const userService = require('../../services/user.service');

const registerCustomer = async (req, res, next) => {
    try {
        const user = await userService.registerCustomer(req.body);
        res.status(201).json({ message: 'Customer registered successfully', user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        next(error);
    }
};

const registerProvider = async (req, res, next) => {
    try {
        const { user, provider } = await userService.registerProvider(req.body);
        res.status(201).json({ 
            message: 'Provider registered successfully and is pending admin verification', 
            user: { id: user._id, name: user.name, email: user.email },
            provider 
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;
        const result = await userService.loginUser(email, password);
        
        if (role && result.user.role !== role) {
            const err = new Error(`Invalid role. Please use the ${result.user.role.toLowerCase()} login portal.`);
            err.statusCode = 401;
            throw err;
        }

        res.status(200).json({
            message: 'Login successful',
            token: result.token,
            user: { id: result.user._id, name: result.user.name, email: result.user.email, role: result.user.role, providerId: result.user.providerId }
        });
    } catch (error) {
        // Specifically flag login errors as 401 Unauthorized for the global handler
        error.statusCode = 401;
        next(error);
    }
};

const getMe = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.user._id);
        if (!user) {
            const err = new Error('User not found');
            err.statusCode = 404;
            return next(err);
        }
        res.status(200).json({ user });
    } catch (error) {
        next(error);
    }
};

const updateMe = async (req, res, next) => {
    try {
        // Customers update their basic info profile here
        const user = await userService.updateCustomerProfile(req.user._id, req.body);
        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) {
            const err = new Error('User not found');
            err.statusCode = 404;
            return next(err);
        }
        res.status(200).json({ user });
    } catch (error) {
        next(error);
    }
};

const updateUserById = async (req, res, next) => {
    try {
        // Strict REST Validation: If you hit /:id, it must match your JWT token unless you are an Admin
        if (req.user._id.toString() !== req.params.id && (!req.user.jwtPayload.scp || !req.user.jwtPayload.scp.includes('admin'))) {
            const err = new Error('Forbidden: You can only edit your own user profile');
            err.statusCode = 403;
            return next(err);
        }

        const user = await userService.updateCustomerProfile(req.params.id, req.body);
        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        next(error);
    }
};

module.exports = { registerCustomer, registerProvider, login, getMe, updateMe, getUserById, updateUserById };
