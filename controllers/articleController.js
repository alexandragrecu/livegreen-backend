const Article = require('../models/articleModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllArticles = catchAsync(async (req, res, next) => {
  const articles = await Article.find();
  if (!articles) {
    return new AppError('Articles not found, please try again later', 500);
  }

  res.status(200).json({
    status: 'success',
    numArticles: articles.length,
    data: {
      articles
    }
  });
});

exports.getArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    return next(new AppError('There is no article with this id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      article
    }
  });
});

exports.createArticle = catchAsync(async (req, res, next) => {
  const newArticle = await Article.create(req.body);

  res.status(201).json({
    status: 'success',
    article: newArticle
  });
});

exports.updateArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!article) {
    return next(new AppError('There is no article with this id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      article
    }
  });
});

exports.deleteArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findByIdAndDelete(req.params.id);

  if (!article) {
    return next(new AppError('There is no article with this id', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
