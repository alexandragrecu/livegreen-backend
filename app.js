const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const productRoutes = require('./routes/productRoutes');
const offerRoutes = require('./routes/offerRoutes');
const userRoutes = require('./routes/userRoutes');
const articleRoutes = require('./routes/articleRoutes');

const app = express();

const optionsCors = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(optionsCors));

// https headers
app.use(helmet());

// 60 requests per hour from the same ip
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'You are making too many request from this IP, please try again later!'
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));

// Data sanitization
// NoSql query injection
app.use(mongoSanitize());

// html code injection
app.use(xss());

// parameter pollution
app.use(
  hpp({
    whitelist: ['points', 'city', 'people']
  })
);

app.use(compression());

// ROUTES
app.use('/api/v1/users', userRoutes);

app.use('/api/v1/products', productRoutes);

app.use('/api/v1/offers', offerRoutes);

app.use('/api/v1/articles', articleRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} !`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
