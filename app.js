const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');
const { connect } = require('http2');

//Start Express  app
const app = express();
app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());

app.options('*', cors());
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet());

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", "'unsafe-inline'", 'ws:'],
//       connectSrc: [
//         'https://checkout.stripe.com',
//         'https://api.stripe.com',
//         'https://maps.googleapis.com',
//         "'self'"
//       ],
//       frameSrc: [
//         'https://checkout.stripe.com',
//         'https://b.stripecdn.com',
//         'https://js.stripe.com',
//         'https://hooks.stripe.com',
//         "'self'"
//       ],
//       scriptSrc: [
//         'https://checkout.stripe.com',
//         'https://b.stripecdn.com',
//         'https://js.stripe.com',
//         'https://maps.googleapis.com',
//         "'self'"
//       ],
//       // styleSrc: ["'"],
//       imgSrc: ['https://*.stripe.com', "'self'"],
//       fontSrc: ["'self'", 'https:', 'data:']
//     }
//   })
// );

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      // defaultSrc: ["'self'", 'https:', 'data:', 'ws:'],
      defaultSrc: ['*'],
      connectSrc: ['*'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      scriptSrc: [
        "'self'",
        'https:',
        'blob:',
        '*',
        'unsafe-inline',
        'js.stripe.com/v3/',
        'https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.js',
        'https://js.stripe.com/v3'
      ],
      objectSrc: ["'none'"],
      styleSrc: [
        "'self'",
        'https:',
        'unsafe-inline',
        'sha256-CwE3Bg0VYQOIdNAkbB/Btdkhul49qZuwgNCMPgNY5zw='
      ]
      // upgradeInsecureRequests: []
    }
  })
);

// app.use(helmet({ contentSecurityPolicy: false }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request by this IP, please try again in an hour!'
});

app.use('/api', limiter);

app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use(compression());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);

  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', function(req, res, next) {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
