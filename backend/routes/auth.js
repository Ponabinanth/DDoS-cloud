const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Audit = require('../models/Audit');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { generateToken, auth, JWT_SECRET } = require('../middleware/auth');

const DEFAULT_RETURN_TO = process.env.FRONTEND_DEFAULT_RETURN_TO || 'http://127.0.0.1:5500/login.html';
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || 'http://127.0.0.1:5500,http://localhost:5500')
  .split(',')
  .map(v => v.trim())
  .filter(Boolean);

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

function getPublicBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

function getRedirectUri(req, provider) {
  return `${getPublicBaseUrl(req)}/api/auth/oauth/${provider}/callback`;
}

function sanitizeReturnTo(returnTo) {
  if (!returnTo) return DEFAULT_RETURN_TO;
  try {
    const url = new URL(returnTo);
    if (!FRONTEND_ORIGINS.includes(url.origin)) return DEFAULT_RETURN_TO;
    return url.toString();
  } catch (_error) {
    return DEFAULT_RETURN_TO;
  }
}

function redirectWithFragment(res, returnTo, fragment) {
  const url = new URL(returnTo);
  url.hash = new URLSearchParams(fragment).toString();
  res.redirect(url.toString());
}

function signOAuthState(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '10m' });
}

function verifyOAuthState(state, provider) {
  const decoded = jwt.verify(state, JWT_SECRET);
  if (!decoded || decoded.provider !== provider) {
    throw new Error('Invalid OAuth state');
  }
  return decoded;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (_err) {}
  return { ok: response.ok, status: response.status, json, text };
}

async function upsertOAuthUser({ provider, providerId, email, emailVerified, name, avatarUrl, oauth }) {
  const safeEmail = normalizeEmail(email);
  if (!safeEmail) {
    throw new Error('OAuth provider did not return an email address');
  }
  if (emailVerified === false) {
    throw new Error('Email is not verified with the OAuth provider');
  }

  let user = await User.findOne({ email: safeEmail });
  if (!user) {
    user = new User({
      name: name || safeEmail.split('@')[0],
      email: safeEmail,
      authProvider: provider,
      avatarUrl: avatarUrl || undefined,
      oauth: { [provider]: { id: providerId, ...oauth } }
    });
  } else {
    const nextOauth = { ...(user.oauth || {}) };
    nextOauth[provider] = { id: providerId, ...oauth };
    user.oauth = nextOauth;

    if (!user.avatarUrl && avatarUrl) user.avatarUrl = avatarUrl;
    if (!user.name && name) user.name = name;

    // Ensure password-less users don't validate as "local".
    if (!user.password && user.authProvider === 'local') {
      user.authProvider = provider;
    }
  }

  await user.save();
  return user;
}

async function googleExchange(code, redirectUri) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth is not configured');
  }

  const token = await fetchJson('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    }).toString()
  });
  if (!token.ok) {
    throw new Error(token.json?.error_description || token.json?.error || 'Google token exchange failed');
  }

  const accessToken = token.json?.access_token;
  if (!accessToken) throw new Error('Google token exchange did not return access_token');

  const userinfo = await fetchJson('https://openidconnect.googleapis.com/v1/userinfo', {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!userinfo.ok) {
    throw new Error('Google userinfo fetch failed');
  }

  return {
    providerId: userinfo.json?.sub,
    email: userinfo.json?.email,
    emailVerified: userinfo.json?.email_verified !== false,
    name: userinfo.json?.name,
    avatarUrl: userinfo.json?.picture,
    oauth: { email_verified: userinfo.json?.email_verified }
  };
}

async function githubExchange(code, redirectUri) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('GitHub OAuth is not configured');
  }

  const token = await fetchJson('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri
    }).toString()
  });

  if (!token.ok) {
    throw new Error(token.json?.error_description || token.json?.error || 'GitHub token exchange failed');
  }

  const accessToken = token.json?.access_token;
  if (!accessToken) throw new Error('GitHub token exchange did not return access_token');

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'SecureChain'
  };

  const profile = await fetchJson('https://api.github.com/user', { method: 'GET', headers });
  if (!profile.ok) throw new Error('GitHub profile fetch failed');

  let email = profile.json?.email;
  let emailVerified = true;

  if (!email) {
    const emails = await fetchJson('https://api.github.com/user/emails', { method: 'GET', headers });
    if (!emails.ok || !Array.isArray(emails.json)) {
      throw new Error('GitHub email fetch failed (ensure scope user:email)');
    }

    const primary = emails.json.find(e => e.primary) || emails.json[0];
    email = primary?.email;
    emailVerified = primary?.verified !== false;
  }

  return {
    providerId: String(profile.json?.id || ''),
    email,
    emailVerified,
    name: profile.json?.name || profile.json?.login,
    avatarUrl: profile.json?.avatar_url,
    oauth: { login: profile.json?.login }
  };
}

function parseApplePrivateKey(raw) {
  if (!raw) return '';
  return raw.replace(/\\n/g, '\n');
}

function appleClientSecret() {
  const clientId = process.env.APPLE_CLIENT_ID;
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const privateKey = parseApplePrivateKey(process.env.APPLE_PRIVATE_KEY);
  if (!clientId || !teamId || !keyId || !privateKey) {
    throw new Error('Apple OAuth is not configured');
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = now + (60 * 60 * 24 * 180); // 180 days
  return jwt.sign(
    { iss: teamId, iat: now, exp, aud: 'https://appleid.apple.com', sub: clientId },
    privateKey,
    { algorithm: 'ES256', keyid: keyId }
  );
}

async function appleExchange(code, redirectUri) {
  const clientId = process.env.APPLE_CLIENT_ID;
  if (!clientId) throw new Error('Apple OAuth is not configured');

  const token = await fetchJson('https://appleid.apple.com/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: appleClientSecret(),
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    }).toString()
  });
  if (!token.ok) {
    throw new Error(token.json?.error_description || token.json?.error || 'Apple token exchange failed');
  }

  const idToken = token.json?.id_token;
  if (!idToken) throw new Error('Apple token exchange did not return id_token');

  // For our purposes (issuing our own JWT), decode is sufficient after a successful token exchange.
  const decoded = jwt.decode(idToken) || {};
  const email = decoded.email;
  const verified = decoded.email_verified;
  const emailVerified = verified === true || verified === 'true' || verified === 1 || verified === '1';

  return {
    providerId: decoded.sub,
    email,
    emailVerified,
    name: email ? email.split('@')[0] : 'Apple User',
    avatarUrl: undefined,
    oauth: { email_verified: decoded.email_verified }
  };
}

// ==================== OAUTH (GOOGLE / GITHUB / APPLE) ====================
router.get('/oauth/:provider/start', async (req, res) => {
  const provider = String(req.params.provider || '').toLowerCase();
  const returnTo = sanitizeReturnTo(req.query.returnTo);

  try {
    const redirectUri = getRedirectUri(req, provider);
    const nonce = crypto.randomBytes(16).toString('hex');
    const state = signOAuthState({ provider, returnTo, nonce });

    let authUrl = null;

    if (provider === 'google') {
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        throw new Error('Google OAuth is not configured');
      }

      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'select_account',
        state
      }).toString()}`;
    } else if (provider === 'github') {
      if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
        throw new Error('GitHub OAuth is not configured');
      }

      authUrl = `https://github.com/login/oauth/authorize?${new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        redirect_uri: redirectUri,
        scope: 'read:user user:email',
        state
      }).toString()}`;
    } else if (provider === 'apple') {
      if (!process.env.APPLE_CLIENT_ID || !process.env.APPLE_TEAM_ID || !process.env.APPLE_KEY_ID || !process.env.APPLE_PRIVATE_KEY) {
        throw new Error('Apple OAuth is not configured');
      }

      authUrl = `https://appleid.apple.com/auth/authorize?${new URLSearchParams({
        client_id: process.env.APPLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        response_mode: 'query',
        scope: 'name email',
        state,
        nonce
      }).toString()}`;
    } else {
      throw new Error('Unsupported OAuth provider');
    }

    return res.redirect(authUrl);
  } catch (error) {
    return redirectWithFragment(res, returnTo, {
      oauth_error: 'start_failed',
      oauth_error_description: error.message,
      provider
    });
  }
});

router.get('/oauth/:provider/callback', async (req, res) => {
  const provider = String(req.params.provider || '').toLowerCase();
  const code = String(req.query.code || '');
  const state = String(req.query.state || '');
  const providerError = req.query.error ? String(req.query.error) : '';
  const providerErrorDescription = req.query.error_description ? String(req.query.error_description) : '';

  let returnTo = DEFAULT_RETURN_TO;

  try {
    const decoded = verifyOAuthState(state, provider);
    returnTo = sanitizeReturnTo(decoded.returnTo);

    if (providerError) {
      return redirectWithFragment(res, returnTo, {
        oauth_error: providerError,
        oauth_error_description: providerErrorDescription,
        provider
      });
    }

    if (!code) {
      throw new Error('Missing authorization code');
    }

    const redirectUri = getRedirectUri(req, provider);
    let oauthProfile = null;

    if (provider === 'google') {
      oauthProfile = await googleExchange(code, redirectUri);
    } else if (provider === 'github') {
      oauthProfile = await githubExchange(code, redirectUri);
    } else if (provider === 'apple') {
      oauthProfile = await appleExchange(code, redirectUri);
    } else {
      throw new Error('Unsupported OAuth provider');
    }

    const user = await upsertOAuthUser({
      provider,
      providerId: oauthProfile.providerId,
      email: oauthProfile.email,
      emailVerified: oauthProfile.emailVerified,
      name: oauthProfile.name,
      avatarUrl: oauthProfile.avatarUrl,
      oauth: oauthProfile.oauth
    });

    await Audit.create({
      eventType: 'LOGIN',
      description: `OAuth login (${provider}): ${user.email}`,
      user: user._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const token = generateToken(user._id);
    return redirectWithFragment(res, returnTo, { token, provider });
  } catch (error) {
    return redirectWithFragment(res, returnTo, {
      oauth_error: 'callback_failed',
      oauth_error_description: error.message,
      provider
    });
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const safeEmail = normalizeEmail(email);

    // Check if user exists
    const existingUser = await User.findOne({ email: safeEmail });
    if (existingUser) {
      if (!existingUser.password) {
        return res.status(400).json({ error: 'Email already registered via social login. Please use Google/GitHub/Apple to sign in.' });
      }
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const user = new User({ name, email: safeEmail, password, authProvider: 'local' });
    await user.save();

    // Create audit log
    await Audit.create({
      eventType: 'LOGIN',
      description: `New user registered: ${email}`,
      user: user._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const safeEmail = normalizeEmail(email);

    const user = await User.findOne({ email: safeEmail });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(400).json({ error: 'This account uses social login. Please sign in with Google/GitHub/Apple.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    // Create audit log
    await Audit.create({
      eventType: 'LOGIN',
      description: `User logged in: ${email}`,
      user: user._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Create audit log
    await Audit.create({
      eventType: 'LOGOUT',
      description: 'User logged out',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: { token: token?.substring(0, 10) + '...' }
    });

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt
    }
  });
});

// Profile alias for frontend compatibility
router.get('/profile', auth, async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    createdAt: req.user.createdAt
  });
});

module.exports = router;
