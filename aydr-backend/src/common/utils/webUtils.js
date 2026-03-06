const successResponse = (detail = null, data = null) => {
    return {
        status: "success",
        detail,
        data
    };
};

const errorResponse = (detail = null, data = null) => {
    return {
        status: "error",
        detail,
        data
    };
};

module.exports = {
    successResponse,
    errorResponse
}