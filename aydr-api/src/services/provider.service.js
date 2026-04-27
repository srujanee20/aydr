const Provider = require('../models/Provider');

const createProvider = async (providerData) => {
    const provider = new Provider(providerData);
    return await provider.save();
};

const getAllProviders = async (filters = {}) => {
    const query = { ...filters };
    
    // Add text-based filtering on address OR provider name (partial match, case-insensitive)
    if (query.search) {
        query['$or'] = [
            { 'location.address': { $regex: query.search, $options: 'i' } },
            { name: { $regex: query.search, $options: 'i' } }
        ];
        delete query.search;
    }
    
    return await Provider.find(query).populate('category', 'name iconUrl');
};

const getProviderById = async (id) => {
    return await Provider.findById(id).populate('category', 'name iconUrl');
};

const updateProviderSettings = async (id, updateData) => {
    const provider = await Provider.findById(id);
    if (!provider) throw new Error('Provider not found');

    // If location is being updated, force re-verification
    if (updateData.location) {
        provider.verification.status = 'PENDING';
        provider.profileSetup.location.status = 'PENDING';
    }

    // Only logoUrl or name trigger branding re-verification (NOT bio)
    if (updateData.name || updateData.logoUrl) {
        provider.verification.status = 'PENDING';
        provider.profileSetup.branding.status = 'PENDING';
    }

    // Auto-update pricing status when basePrice is set
    if (updateData.basePrice !== undefined && updateData.basePrice > 0) {
        if (provider.profileSetup.pricing.status === 'INCOMPLETE') {
            provider.profileSetup.pricing.status = 'APPROVED';
        }
    }

    // Update the other provided properties
    Object.assign(provider, updateData);
    provider.markModified('profileSetup');
    provider.markModified('verification');
    return await provider.save();
};

module.exports = { createProvider, getAllProviders, getProviderById, updateProviderSettings };
