const User = require('../../models/User');

const getLogin = (req, res) => {
    if (req.session && req.session.adminId) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', { error: null });
};

const postLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, role: 'ADMIN' });
        if (!user || !(await user.checkPassword(password))) {
            return res.render('admin/login', { error: 'Invalid admin credentials' });
        }
        
        req.session.adminId = user._id;
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.render('admin/login', { error: 'Server error occurred' });
    }
};

const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
};

module.exports = { getLogin, postLogin, logout };
