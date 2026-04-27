const Provider = require('../../models/Provider');

const getProviders = async (req, res) => {
    const status = req.query.status || 'ALL';
    let filter = {};
    if (status !== 'ALL') {
        filter['verification.status'] = status;
    }
    
    const providers = await Provider.find(filter).populate('category', 'name').sort({ createdAt: -1 });
    res.render('admin/providers', { providers, currentStatus: status });
};

const updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status, message } = req.body; // status: APPROVED, REJECTED, etc.
    try {
        const provider = await Provider.findById(id);
        if (!provider) return res.status(404).json({ success: false, error: 'Provider not found' });
        
        provider.verification.status = status;
        provider.verification.adminMessage = message || '';

        if (status === 'APPROVED') {
            if (provider.profileSetup.branding.status === 'PENDING') provider.profileSetup.branding.status = 'APPROVED';
            if (provider.profileSetup.location.status === 'PENDING') provider.profileSetup.location.status = 'APPROVED';
            if (provider.profileSetup.category && provider.profileSetup.category.status === 'PENDING') provider.profileSetup.category.status = 'APPROVED';
            
            // Also approve custom category if it exists
            const Category = require('../../models/Category');
            if (provider.category) {
                await Category.findByIdAndUpdate(provider.category, { status: 'APPROVED', isActive: true });
            }
        }

        await provider.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { getProviders, updateStatus };
