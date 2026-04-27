const serviceService = require('../../services/service.service');

const createService = async (req, res, next) => {
    try {
        const service = await serviceService.createService(req.body);
        res.status(201).json({ message: 'Service created', service });
    } catch (error) {
        next(error);
    }
};

const getServicesByProvider = async (req, res, next) => {
    try {
        const services = await serviceService.getServicesByProvider(req.params.providerId);
        res.status(200).json({ services });
    } catch (error) {
        next(error);
    }
};

const updateService = async (req, res, next) => {
    try {
        const service = await serviceService.updateService(req.params.id, req.body);
        if (!service) {
            const err = new Error('Service not found');
            err.statusCode = 404;
            return next(err);
        }
        res.status(200).json({ message: 'Service updated', service });
    } catch (error) {
        next(error);
    }
};

module.exports = { createService, getServicesByProvider, updateService };
