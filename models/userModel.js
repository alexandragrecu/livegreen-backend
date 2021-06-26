const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const rewardSchema = require('./rewardModel');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please tell us your first name!'],
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: [true, 'Please tell us your email address!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please tell us a valid email!'],
  },
  zipCode: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please tell us your password!'],
    minLength: 8,
    select: false,
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
  passwordResetToken: String,
  passwordResetExpiresAt: Date,
  activeAccount: {
    type: Boolean,
    default: true,
    select: false,
  },
  rewards: [rewardSchema],
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ activeAccount: { $ne: false } });
  next();
});

userSchema.methods.addReward = function (id) {
  this.rewards.push({ offer_id: id });
};

userSchema.methods.updatePoints = function (newPoints) {
  this.totalPoints += newPoints;
};

userSchema.methods.decreasePoints = function (newPoints) {
  this.totalPoints -= newPoints;
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp =
      parseInt(this.passwordChangedAt.getTime(), 10) / 1000;
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.matchedPasswords = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
