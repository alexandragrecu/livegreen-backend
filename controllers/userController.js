const User = require('../models/userModel');
const Offer = require('../models/offerModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found with this email!'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      zipCode: user.zipCode,
      totalPoints: user.totalPoints,
      role: user.role,
    },
  });
});

exports.updateMyData = catchAsync(async (req, res, next) => {
  // user tries to change password accessing this route => error
  if (req.body.password) {
    return next(new AppError('You cannot update your password here.', 400));
  }

  // security: update just name and email
  const filteredBody = filterObj(
    req.body,
    'firstName',
    'lastName',
    'email',
    'zipCode'
  );

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { activeAccount: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const getReward = catchAsync(async (userReward, rewards) => {
  const reward = {};
  reward._id = userReward._id;
  reward.purchaseDate = userReward.purchaseDate;

  const offer = await Offer.findById(userReward.offer_id);

  if (!offer) {
    return next(new AppError('Reward not found!'));
  }
  reward.offer = offer;
  rewards.push(reward);
});

exports.getRewards = catchAsync(async (req, res, next) => {
  const rewards = [];

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found with this email!'));
  }

  const userRewards = user.rewards;

  userRewards.forEach(async (userReward) => {
    await getReward(userReward, rewards);

    if (rewards.length === userRewards.length) {
      res.status(200).json({
        status: 'success',
        data: {
          rewards,
        },
      });
    }
  });
});

exports.validatePoints = catchAsync(async (req, res, next) => {
  const id = req.query.id;

  const user = await User.findById(id);

  if (!user) {
    return next(new AppError('User not found!'));
  }

  user.validatePoints();

  await user.save();

  res.status(200).json({
    status: 'success',
    data: user,
  });
});
