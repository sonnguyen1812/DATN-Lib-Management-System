class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const login = (req, res, next) => {};

export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;

    console.log(err);

    if (err.code === 11000) {
        const statusCode = 400;
        const message = `Duplicate field value entered`;
        err = new ErrorHandler(message, statusCode);
    }

    if (err.name === "JsonWebTokenError") {
        const statusCode = 400;
        const message = `Json web token is invalid, try again.`;
        err = new ErrorHandler(message, statusCode);
    }

    if (err.name === "TokenExpiredError") {
        const statusCode = 400;
        const message = `Json web token is expired, try again.`;
        err = new ErrorHandler(message, statusCode);
    }

    if (err.name === "CastError") {
        const statusCode = 400;
        const message = `Resource not found. Invalid: ${err.path}: ${err.value}`;
        err = new ErrorHandler(message, statusCode);
    }

    const errorMessage = err.errors
        ? Object.values(err.errors)
              .map((error) => error.message)
              .join(", ")
        : err.message;

    return res.status(err.statusCode).json({
        success: false,
        message: errorMessage,
    });
};

export default ErrorHandler;
