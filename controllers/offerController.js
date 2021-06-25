const Offer = require('../models/offerModel');
const User = require('../models/userModel');

const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/emailOffer');

exports.getOffers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Offer.find(), req.query).filter().sort();
  const offers = await features.query;

  res.status(200).json({
    status: 'success',
    numOffers: offers.length,
    data: {
      offers,
    },
  });
});

exports.getOffer = catchAsync(async (req, res, next) => {
  const offer = await Offer.findById(req.params.id);

  if (!offer) {
    return next(new AppError('No offer with this id!', 404));
  }

  // get points of the offers
  const points = offer.getPoints();

  const user = await User.findById(req.user._id);
  if (!user) {
    return next(
      new AppError('You are not authorized to do this, please login', 403)
    );
  }
  user.decreasePoints(points);
  user.save();

  await new Email(user, offer).sendOffer();

  res.status(200).json({
    status: 'success',
    data: {
      offer,
    },
  });
});

exports.createOffer = catchAsync(async (req, res, next) => {
  const newOffer = await Offer.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      offer: newOffer,
    },
  });
});

exports.updateOffer = catchAsync(async (req, res, next) => {
  const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!offer) {
    return next(new AppError('No offer with this id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      offer,
    },
  });
});

exports.deleteOffer = catchAsync(async (req, res, next) => {
  const offer = await Offer.findByIdAndDelete(req.params.id);

  if (!offer) {
    return next(new AppError('No offer with this id', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getSpecificOffer = catchAsync(async (req, res, next) => {
  const offers = await Offer.find();
  let name = req.query.name.trim().toLowerCase();

  const foundOffers = [];

  for (let i = 0; i < offers.length; i++) {
    if (offers[i].name.toLowerCase().includes(name)) {
      foundOffers.push(offers[i]);
    }
  }

  res.status(200).json({
    status: 'success',
    offers: foundOffers,
  });
});
