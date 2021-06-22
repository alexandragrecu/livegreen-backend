const Product = require('../models/productModel');
const User = require('../models/userModel');

const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Product.find(), req.query).sort().filter();
  const products = await features.query;
  res.status(200).json({
    status: 'success',
    numProducts: products.length,
    data: {
      products
    }
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('There is no product with this id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const newProduct = await Product.create(req.body);

  res.status(201).json({
    status: 'success',
    product: newProduct
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!product) {
    return next(new AppError('There is no product with this id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError('There is no product with this id', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.scanBarCode = catchAsync(async (req, res, next) => {
  // get qr code from frontend
  let { qrCode } = req.body;
  qrCode = qrCode.toString().trim();
  // get product with that qr code
  const product = await Product.findOne({ qrCode });
  console.log("PRODUCT", product);
  if (!product) {
    return next(new AppError('There is no product with this QR code', 404));
  }

  // get the points of that product]
  const points = product.getPoints();

  // update points of user
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(
      new AppError('You are not authorized to do this, please login', 403)
    );
  }
  user.updatePoints(points);
  user.save();

  // send response
  res.status(200).json({
    status: 'success',
    data: product
  });
});
