const express = require('express');
const router = express.Router();

const adminRouter = require('./admin.router');

// Mount Admin Portal
router.use('/admin', adminRouter);

// Any other public MVC routes (e.g., marketing pages) can go below here
// router.get('/', (req, res) => res.render('public/home'));

module.exports = router;