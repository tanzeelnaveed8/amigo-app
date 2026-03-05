const AppError = require('../../utility/appError');
require('dotenv').config();

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400, { [err.path]: 'Invalid value' });
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyPattern)[0];
  const message = { [field]: `${field} already exists` };
  return new AppError('Duplicate field error', 400, message);
};

const handleValidationErrorDB = (err) => {
  const fieldErrors = {};
  Object.values(err.errors).forEach((error) => {
    fieldErrors[error.path] = error.message;
  });
  return new AppError('Validation error', 400, fieldErrors);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401, {
    token: 'invalid token',
    code: 'INVALID_TOKEN',
  });

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401, {
    token: 'Token expired',
    code: 'TOKEN_EXPIRED',
  });

const handleTimeoutError = () =>
  new AppError('Request timeout. Please try again.', 408, {
    timeout: 'Request took too long',
  });

const sendErrorDev = (err, req, res) => {
  return res.status(err.statusCode || 500).json({
    status: 'fail',
    message: err.message,
    error: err.fieldErrors || { [err.name]: err.message },
    code: err.fieldErrors?.code || undefined,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      status: 'fail',
      message: err.message,
      error: err.fieldErrors || undefined,
      code: err.fieldErrors?.code || undefined,
    });
  }

  console.error('UNEXPECTED ERROR:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong. Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  let error = { ...err };
  error.message = err.message;
  error.name = err.name;

  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
  if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') error = handleTimeoutError();

  if (process.env.NODE_ENV === 'production') {
    return sendErrorProd(error, req, res);
  }

  return sendErrorDev(err, req, res);
};
