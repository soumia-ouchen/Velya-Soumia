

class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = '') {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = isOperational;
      if (stack) {
        this.stack = stack;
      } else {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  
  export const errorHandler = (err, req, res, next) => {
    // Log the error for debugging
    console.error(err);
  
    // Set default values for unexpected errors
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = null;
  
    // Handle specific error types
    if (err.name === 'ValidationError') {
      // Mongoose validation error
      statusCode = 400;
      message = 'Validation Error';
      errors = {};
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });
    } else if (err.code === 11000) {
      // MongoDB duplicate key error
      statusCode = 409;
      message = 'Duplicate Field Value';
      const field = Object.keys(err.keyValue)[0];
      errors = {
        [field]: `This ${field} is already in use`
      };
    } else if (err.name === 'CastError') {
      // Mongoose bad ObjectId
      statusCode = 400;
      message = `Invalid ${err.path}: ${err.value}`;
    } else if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token. Please log in again!';
    } else if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Your token has expired! Please log in again.';
    }
  
    // Determine if we should send the stack trace
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorResponse = {
      status: 'error',
      message,
      ...(errors && { errors }),
      ...(isDevelopment && { stack: err.stack, fullError: err })
    };
  
    // Send the error response
    res.status(statusCode).json(errorResponse);
  };
  
  export default {
    ApiError,
    errorHandler
  };