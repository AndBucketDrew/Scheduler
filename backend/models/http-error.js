export class HttpError extends Error {
    constructor(message, errorCode) {
        super(message);
        this.errorCode = Number(errorCode) || 500;
    }
};

export default HttpError;