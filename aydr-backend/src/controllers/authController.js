const User = require("../models/User");

const { successResponse, errorResponse } = require("../common/utils/webUtils");
const { generateAccessToken } = require("../common/utils/jwtUtils");

const registerUser = async (req, res) => {
    console.log(`Request received to register user with email: ${req.body.email}`)

    try {
        const { role, name, email, password, serviceCategory, basePrice } = req.body;

        const userExists = await User.exists({ email });
        if (userExists) {
            res.status(409).json(errorResponse(`User already exists with email ${email}!`));
            return;
        }

        const userData = { role, name, email, password };
        if (role === 'PROVIDER') {
            if (!serviceCategory && !basePrice) {
                res.status(400).json(errorResponse("Provider registration failed! Required fields not passed!"));
                return;
            }
            userData.providerDetails = { serviceCategory, basePrice: Number(basePrice) };
        }

        const user = await User.create(userData);

        res.status(201)
            .json(successResponse('User registered successfully.', {
                _id: user._id,
                role: user.role,
                name: user.name,
                email: user.email
            }));
    } catch (err) {
        console.error(`User registration failed: ${err.message}`);
        res.status(500).json(errorResponse('Something went wrong! Please try again later!'));
    }

}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json(errorResponse(`User with email ${email} not found!`));
            return;
        }

        const passwordMatches = await user.matchPassword(password);
        if (!passwordMatches) {
            res.status(401).json(errorResponse('Password does not match!'));
            return;
        }

        const accessToken = generateAccessToken(user);

        res.status(200).json(successResponse(`Successfully logged-in user with email ${email}.`, {
            email,
            accessToken,
            expiresIn: '15m'
        }));

    } catch (err) {
        console.error(`User login failed: ${err.message}`);
        res.status(500).json(errorResponse('Something went wrong! Please try again later!'));
    }
};

module.exports = { registerUser, loginUser };