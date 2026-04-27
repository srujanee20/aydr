const Service = require('../models/Service');

const createService = async (serviceData) => {
    const service = new Service(serviceData);
    await service.save();
    return service;
};

const getServicesByProvider = async (providerId) => {
    return await Service.find({ providerId, isActive: true })
        .populate('categoryId', 'name iconUrl')
        .sort({ createdAt: -1 });
};

// Toggle a service active state
const toggleServiceStatus = async (serviceId, isActive) => {
    return await Service.findByIdAndUpdate(serviceId, { isActive }, { new: true });
};

// Update a service's fields
const updateService = async (serviceId, updateData) => {
    return await Service.findByIdAndUpdate(serviceId, updateData, { new: true, runValidators: true });
};

module.exports = {
    createService,
    getServicesByProvider,
    toggleServiceStatus,
    updateService
};
