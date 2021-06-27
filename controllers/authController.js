const { promisify } = require('util');
const jwt = require('jsonwebtoken');
// const crypto = require('crypto');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    role: req.body.role,
    photo: req.body.photo,
    zipCode: req.body.zipCode,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    totalPoints: req.body.totalPoints,
    activeAccount: req.body.activeAccount,
  });

  // const url = `${req.protocol}://localhost:4200/home`;
  const url = 'http://localhost:3000/home';
  // const url = `${req.protocol}://${req.get('host')}/home`;
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Incorrect email', 401));
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  if (req.headers.authorization) {
    req.headers.authorization.split(' ')[1] = undefined;
  }
  res.cookie('jwt', 'logged-out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protectRoute = catchAsync(async (req, res, next) => {
  // get token
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  //  else if (req.cookies.jwt) {
  //   token = req.cookies.jwt;
  // }

  // if (req.cookie.jwt) {
  //   token = req.cookie.jwt;
  // } else if (
  //   req.headers.authorization &&
  //   req.headers.authorization.startsWith('Bearer')
  // ) {
  //   token = req.headers.authorization.split(' ')[1];
  // }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // validate token
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // user still exists?
  const user = await User.findById(decodedToken.id);

  if (!user) {
    return next(new AppError('User does no longer exists!', 401));
  }
  // user changed his pass after login?
  if (user.changedPasswordAfter(decodedToken.iat)) {
    return next(
      new AppError(
        'User recently changed his password, please log in again!',
        401
      )
    );
  }

  req.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action!')
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user based on posted isEmail
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email', 404));
  }
  // const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://localhost:4200/forgot-password`;
  // const resetURL = `${req.protocol}://${req.get('host')}/forgot-password`;

  try {
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Verify your email!',
    });
  } catch (err) {
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'Try again later. There was a problem when sending this email',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  // if token has not expired and there is user => set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // update changedPasswordAt property for the user
  user.password = req.body.password;
  // user.passwordResetToken = undefined;
  // user.passwordResetExpiresAt = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

// just for loggin users
exports.updatePassword = catchAsync(async (req, res, next) => {
  // get the user from db
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.matchedPasswords(req.body.oldPassword, user.password))) {
    return next(new AppError('Your password is incorrect!', 401));
  }

  // if so, update the password
  user.password = req.body.newPassword;
  await user.save();

  // log the user in, send JWT
  createSendToken(user, 200, res);
});
