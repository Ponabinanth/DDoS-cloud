// Login page controller (no frameworks, minimal globals)
(() => {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const terminalPhrases = [
        'establishing secure session...',
        'loading policy: zero-trust / least-privilege',
        'verifying audit chain integrity...',
        'synchronizing threat intel feeds...',
        'arming response playbooks...',
        'hardening edge rulesets...'
    ];

    function setTabActive(tabName) {
        const tabs = $$('.tab-btn[data-tab]');
        const panels = $$('.tab-content');

        tabs.forEach(btn => {
            const active = btn.dataset.tab === tabName;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        panels.forEach(panel => {
            const active = panel.id === `${tabName}-tab`;
            panel.classList.toggle('active', active);
        });

        hideMessages();
        focusFirstInput(tabName);
    }

    function focusFirstInput(tabName) {
        const panel = document.getElementById(`${tabName}-tab`);
        const input = panel ? $('input, textarea, select', panel) : null;
        input?.focus();
    }

    function hideMessages() {
        $$('.error-message, .success-message').forEach(msg => {
            msg.classList.remove('show');
            msg.textContent = '';
        });
    }

    function showMessage(elementId, message) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.textContent = message;
        el.classList.add('show');
    }

    function showError(elementId, message) {
        showMessage(elementId, message);
    }

    function showSuccess(elementId, message) {
        showMessage(elementId, message);
    }

    function togglePasswordVisibility(toggleIcon) {
        const wrapper = toggleIcon.closest('.password-toggle');
        const input = wrapper ? $('input', wrapper) : null;
        if (!input) return;

        const nowVisible = input.type === 'password';
        input.type = nowVisible ? 'text' : 'password';
        toggleIcon.classList.toggle('fa-eye-slash', nowVisible);
        toggleIcon.classList.toggle('fa-eye', !nowVisible);
        toggleIcon.setAttribute('aria-pressed', nowVisible ? 'true' : 'false');
    }

    async function updateApiStatus() {
        const chip = document.getElementById('authApiStatus');
        const kpiMode = document.getElementById('kpiMode');
        if (!chip || !window.api) return;

        try {
            const result = await window.api.checkHealth();
            const db = result?.database || 'unknown';
            const online = result?.status === 'healthy';

            chip.classList.remove('status-ok', 'status-warn');
            if (online) {
                chip.classList.add('status-ok');
                chip.innerHTML = `<i class="fas fa-satellite-dish"></i> API: Online${db === 'disconnected' ? ' (Demo)' : ''}`;
                if (kpiMode) kpiMode.textContent = db === 'disconnected' ? 'DEMO' : 'LIVE';
            } else {
                chip.classList.add('status-warn');
                chip.innerHTML = '<i class="fas fa-satellite-dish"></i> API: Offline';
                if (kpiMode) kpiMode.textContent = 'OFF';
            }
        } catch (_err) {
            chip.classList.remove('status-ok');
            chip.classList.add('status-warn');
            chip.innerHTML = '<i class="fas fa-satellite-dish"></i> API: Offline';
            if (kpiMode) kpiMode.textContent = 'OFF';
        }
    }

    function startTerminalTicker() {
        const line = document.getElementById('authTerminalLine');
        if (!line) return;

        let idx = 0;
        const tick = () => {
            idx = (idx + 1) % terminalPhrases.length;
            line.textContent = terminalPhrases[idx];
        };

        // First change after a short delay so it doesn't feel static.
        setTimeout(() => {
            tick();
            setInterval(tick, 2600);
        }, 1200);
    }

    async function handleLoginSubmit(event) {
        event.preventDefault();
        hideMessages();

        const email = ($('#loginEmail')?.value || '').trim();
        const password = $('#loginPassword')?.value || '';

        if (!email || !password) {
            showError('login-error', 'Please fill in all fields');
            return;
        }

        // Prefer backend login. Fallback keeps demo/offline behavior intact.
        try {
            const result = await window.api.login(email, password);
            if (result?.token || result?.user) {
                const user = result.user || { email, name: email.split('@')[0] };
                localStorage.setItem('securechain_current_user', JSON.stringify(user));
                window.location.href = 'index.html';
                return;
            }
        } catch (error) {
            const health = await window.api.checkHealth();
            if (health?.status === 'healthy') {
                showError('login-error', error?.message || 'Login failed');
                return;
            }

            // Backend offline: fall back to local demo mode.
            window.api.clearToken?.();
        }

        const users = JSON.parse(localStorage.getItem('securechain_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            localStorage.setItem('securechain_current_user', JSON.stringify(user));
            window.location.href = 'index.html';
            return;
        }

        showError('login-error', 'Invalid email or password');
    }

    async function handleSignupSubmit(event) {
        event.preventDefault();
        hideMessages();

        const name = ($('#signupName')?.value || '').trim();
        const email = ($('#signupEmail')?.value || '').trim();
        const password = $('#signupPassword')?.value || '';
        const confirmPassword = $('#signupConfirmPassword')?.value || '';

        if (!name || !email || !password || !confirmPassword) {
            showError('signup-error', 'Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            showError('signup-error', 'Passwords do not match');
            return;
        }
        if (password.length < 8) {
            showError('signup-error', 'Password must be at least 8 characters');
            return;
        }

        try {
            const result = await window.api.register(name, email, password);
            if (result?.token || result?.user) {
                const user = result.user || { name, email };
                localStorage.setItem('securechain_current_user', JSON.stringify(user));
                window.location.href = 'index.html';
                return;
            }
        } catch (error) {
            const health = await window.api.checkHealth();
            if (health?.status === 'healthy') {
                showError('signup-error', error?.message || 'Signup failed');
                return;
            }

            // Backend offline: fall back to local demo mode.
            window.api.clearToken?.();
        }

        const users = JSON.parse(localStorage.getItem('securechain_users') || '[]');
        if (users.find(u => u.email === email)) {
            showError('signup-error', 'Email already registered');
            return;
        }

        const newUser = { id: Date.now(), name, email, password, createdAt: new Date().toISOString() };
        users.push(newUser);
        localStorage.setItem('securechain_users', JSON.stringify(users));
        localStorage.setItem('securechain_current_user', JSON.stringify(newUser));
        window.location.href = 'index.html';
    }

    function handleForgotSubmit(event) {
        event.preventDefault();
        hideMessages();

        const email = ($('#forgotEmail')?.value || '').trim();
        if (!email) {
            showError('forgot-error', 'Enter your email address');
            return;
        }

        // Demo-only behavior: no real email sending here.
        const users = JSON.parse(localStorage.getItem('securechain_users') || '[]');
        const user = users.find(u => u.email === email);
        if (user) {
            showSuccess('forgot-success', 'Password reset link sent to your email!');
            $('#forgotForm')?.reset();
        } else {
            showError('forgot-error', 'Email not found');
        }
    }

    async function handleSocialLogin(provider, buttonEl) {
        hideMessages();

        if (!window.api) {
            showError('login-error', 'API service not loaded. Please refresh.');
            return;
        }

        const originalHtml = buttonEl?.innerHTML;
        if (buttonEl) {
            buttonEl.disabled = true;
            buttonEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecting...';
        }

        try {
            const health = await window.api.checkHealth();
            if (!health || health.status !== 'healthy') {
                showError('login-error', 'Backend API is offline. Start the backend on port 3000.');
                return;
            }

            const returnTo = `${window.location.origin}${window.location.pathname}`;
            const oauthUrl = `${window.api.baseUrl}/auth/oauth/${encodeURIComponent(provider)}/start?returnTo=${encodeURIComponent(returnTo)}`;
            window.location.href = oauthUrl;
        } catch (error) {
            showError('login-error', error?.message || 'Social login failed');
        } finally {
            if (buttonEl) {
                buttonEl.disabled = false;
                buttonEl.innerHTML = originalHtml || buttonEl.innerHTML;
            }
        }
    }

    function wireUi() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const forgotForm = document.getElementById('forgotForm');

        loginForm?.addEventListener('submit', handleLoginSubmit);
        signupForm?.addEventListener('submit', handleSignupSubmit);
        forgotForm?.addEventListener('submit', handleForgotSubmit);

        // Tab buttons
        $$('.tab-btn[data-tab]').forEach(btn => {
            btn.addEventListener('click', () => setTabActive(btn.dataset.tab));
        });

        // Action links (forgot/back)
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[data-action]');
            if (!link) return;
            event.preventDefault();

            const action = link.dataset.action;
            if (action === 'forgot') {
                setTabActive('forgot');
            } else if (action === 'back-login') {
                setTabActive('login');
            }
        });

        // Password toggle click + keyboard support
        document.addEventListener('click', (event) => {
            const icon = event.target.closest('.toggle-visibility');
            if (!icon) return;
            togglePasswordVisibility(icon);
        });
        document.addEventListener('keydown', (event) => {
            const icon = event.target?.closest?.('.toggle-visibility');
            if (!icon) return;
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            togglePasswordVisibility(icon);
        });

        // Social buttons
        $$('.social-btn[data-provider]').forEach(btn => {
            btn.addEventListener('click', () => handleSocialLogin(btn.dataset.provider, btn));
        });
    }

    async function redirectIfAuthenticated() {
        const currentUser = localStorage.getItem('securechain_current_user');
        if (currentUser) {
            window.location.href = 'index.html';
            return;
        }

        // If we have a backend token but no cached user, recover profile.
        const token = localStorage.getItem('auth_token');
        if (token && window.api) {
            try {
                window.api.setToken(token);
                const profile = await window.api.getProfile();
                const user = profile?.user || profile;
                if (user?.email) {
                    localStorage.setItem('securechain_current_user', JSON.stringify(user));
                    window.location.href = 'index.html';
                }
            } catch (_error) {
                window.api.clearToken?.();
            }
        }
    }

    function applySavedTheme() {
        const saved = localStorage.getItem('securechain_theme');
        if (saved === 'light') {
            document.body.classList.add('light-theme');
        }
    }

    async function consumeOAuthRedirect() {
        const raw = (window.location.hash || '').replace(/^#/, '');
        if (!raw) return;

        const params = new URLSearchParams(raw);
        const token = params.get('token');
        const provider = params.get('provider');
        const oauthError = params.get('oauth_error');
        const oauthDesc = params.get('oauth_error_description');

        // Always clear the hash (it may contain secrets like token).
        if (raw) {
            history.replaceState(null, document.title, window.location.pathname + window.location.search);
        }

        if (oauthError) {
            const label = provider ? `${provider.toUpperCase()}: ` : '';
            showError('login-error', `${label}${oauthDesc || oauthError}`);
            return;
        }

        if (!token || !window.api) return;

        window.api.setToken(token);
        try {
            const profile = await window.api.getProfile();
            const user = profile?.user || profile || { email: 'user', name: 'User' };
            localStorage.setItem('securechain_current_user', JSON.stringify(user));
            window.location.href = 'index.html';
        } catch (error) {
            window.api.clearToken?.();
            showError('login-error', error?.message || 'OAuth sign-in failed');
        }
    }

    document.addEventListener('DOMContentLoaded', async () => {
        applySavedTheme();
        wireUi();
        startTerminalTicker();
        await consumeOAuthRedirect();
        updateApiStatus();

        // Keep this last so the page can paint if storage is slow.
        await redirectIfAuthenticated();
    });
})();
