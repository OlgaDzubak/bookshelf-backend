const errorMessageList = {
    401: "Bad Request",
    401: "Not authorized",
    403: "Forbidden",
    404: "Not found",
    409: "Conflict",
    422: "Cloudinary downloading error : file format not allowed",
}

const httpError = (status, message = errorMessageList[status]) => {
    const error = new Error(message);
    error.status = status;
    return error;
}

module.exports = httpError;
