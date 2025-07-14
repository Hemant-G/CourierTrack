// backend/middleware/errorMiddleware.js

// Middleware for handling 404 Not Found errors
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404); // Set the HTTP status code to 404
  next(error); // Pass the error to the next error-handling middleware
};

// Middleware for handling general errors
const errorHandler = (err, req, res, next) => {
  // If status code is 200 (OK), it means an error occurred but a status wasn't set.
  // We'll default it to 500 (Internal Server Error) in such cases.
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose Bad ObjectId (CastError)
  // If an ID passed in the URL (e.g., /api/users/123) is not a valid MongoDB ObjectId format
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    message = `Resource not found`;
    statusCode = 404;
  }

  // Send the error response
  res.status(statusCode).json({
    message: message,
    // In production, we don't want to send the stack trace for security reasons.
    // In development, it's useful for debugging.
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { notFound, errorHandler };