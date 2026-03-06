const User = require("../models/User");

const { successResponse, errorResponse } = require("../common/utils/webUtils");


const registerUser = async (req, res) => {
    const { role, name, email, password, serviceCategory, basePrice } = req.body;

    const userExists = await User.exists({ email });
    if (userExists)
        return res.status(409).json(errorResponse(`User already exists with email ${email}!`));
}