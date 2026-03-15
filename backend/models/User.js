const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'github', 'apple'],
    default: 'local'
  },
  oauth: {
    // Provider payloads (ids, usernames, verified flags, etc).
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  avatarUrl: {
    type: String
  },
  password: {
    type: String,
    required: function requiredPassword() {
      return this.authProvider === 'local';
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (!this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
