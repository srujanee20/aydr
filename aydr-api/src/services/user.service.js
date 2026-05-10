const User = require('../models/User');
const Provider = require('../models/Provider');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// Fields to exclude from all user responses
const USER_SAFE_FIELDS = '-password -__v';

const registerCustomer = async (data) => {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) throw new Error('Email already registered');

    const user = new User({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: 'CUSTOMER'
    });
    
    await user.save();
    return user;
};

const registerProvider = async (data) => {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) throw new Error('Email already registered');

    let categoryId = data.category;

    if (data.customCategory) {
        const Category = require('../models/Category');
        const newCategory = new Category({
            name: data.customCategory,
            isActive: false,
            status: 'PENDING'
        });
        await newCategory.save();
        categoryId = newCategory._id;
    }

    // Create the business provider profile
    const provider = new Provider({
        name: data.providerName,
        category: categoryId,
        email: data.email,
        phone: data.phone,
        location: data.location,
        verification: { status: 'PENDING' },
        profileSetup: {
            branding: { status: 'PENDING' },
            location: { status: 'PENDING' },
            pricing: { status: 'INCOMPLETE' },
            category: { status: 'PENDING' }
        }
    });
    // Set submittedBy for tracking if it's a custom category
    if (data.customCategory) {
        const Category = require('../models/Category');
        await Category.findByIdAndUpdate(categoryId, { submittedBy: provider._id });
    }
    await provider.save();

    // Create the User credential document and map the providerId
    const user = new User({
        name: data.userName,
        email: data.email,
        password: data.password,
        role: 'PROVIDER',
        providerId: provider._id
    });
    await user.save();

    return { user, provider };
};

const loginUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');
    if (!user.isActive) throw new Error('User account is deactivated');

    const isMatch = await user.checkPassword(password);
    if (!isMatch) throw new Error('Invalid credentials');

    // Prevent login if provider has not been approved by admin
    if (user.role === 'PROVIDER' && user.providerId) {
        const provider = await Provider.findById(user.providerId);
        if (provider && provider.verification.status !== 'APPROVED') {
            const err = new Error(`Login blocked. Account approval status: ${provider.verification.status}`);
            err.statusCode = 403;
            throw err;
        }
    }

    const payload = {
        jti: uuidv4(),
        sub: user._id,
        iss: process.env.JWT_ISSUER || 'aydr-api',
        aud: process.env.JWT_AUDIENCE || 'aydr-client',
        scp: [user.role.toLowerCase()]
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return { user, token };
};

const getUserById = async (userId) => {
    return await User.findById(userId).select(USER_SAFE_FIELDS).populate('providerId');
};

const updateCustomerProfile = async (userId, updateData) => {
    // Never allow updating password or role through this endpoint
    delete updateData.password;
    delete updateData.role;
    delete updateData.providerId;
    return await User.findByIdAndUpdate(userId, updateData, { new: true }).select(USER_SAFE_FIELDS);
};

module.exports = {
    registerCustomer,
    registerProvider,
    loginUser,
    getUserById,
    updateCustomerProfile
};
