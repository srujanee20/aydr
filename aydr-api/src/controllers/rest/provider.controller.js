const providerService = require('../../services/provider.service');

const createProvider = async (req, res, next) => {
    try {
        const provider = await providerService.createProvider(req.body);
        res.status(201).json({ message: 'Provider created', provider });
    } catch (error) {
        next(error);
    }
};

const getProviders = async (req, res, next) => {
    try {
        // Enforce that the public API only returns active and approved providers
        const filters = { 
            ...req.query, 
            isAvailable: true, 
            'verification.status': 'APPROVED' 
        };
        const providers = await providerService.getAllProviders(filters);
        
        const isAdmin = req.user && req.user.jwtPayload && req.user.jwtPayload.scp && req.user.jwtPayload.scp.includes('admin');
        
        const mappedProviders = providers.map(p => {
            const pObj = p.toObject();
            if (!isAdmin) {
                delete pObj.profileSetup;
                delete pObj.verification;
            }
            return pObj;
        });

        res.status(200).json({ providers: mappedProviders });
    } catch (error) {
        next(error);
    }
};

const getProvider = async (req, res, next) => {
    try {
        const provider = await providerService.getProviderById(req.params.id);
        if (!provider) {
            const err = new Error('Provider not found');
            err.statusCode = 404;
            return next(err);
        }
        
        const providerObj = provider.toObject();
        const isAdmin = req.user && req.user.jwtPayload && req.user.jwtPayload.scp && req.user.jwtPayload.scp.includes('admin');
        const isSelf = req.user && req.user.providerId && req.user.providerId.toString() === providerObj._id.toString();
        
        if (!isAdmin && !isSelf) {
            delete providerObj.profileSetup;
            delete providerObj.verification;
        }

        res.status(200).json({ provider: providerObj });
    } catch (error) {
        next(error);
    }
};

const updateSettings = async (req, res, next) => {
    try {
        // A provider can only update their own provider profile
        if (req.user.providerId && req.user.providerId.toString() !== req.params.id && (!req.user.jwtPayload.scp || !req.user.jwtPayload.scp.includes('admin'))) {
            const err = new Error('Forbidden: You can only edit your own provider settings');
            err.statusCode = 403;
            return next(err);
        }
        
        const provider = await providerService.updateProviderSettings(req.params.id, req.body);
        res.status(200).json({ message: 'Settings updated successfully', provider });
    } catch (error) {
        next(error);
    }
};

module.exports = { createProvider, getProviders, getProvider, updateSettings };
