import { useNavigate } from 'react-router-dom';

const DEFAULT_IMAGE = '/images/avatar-default.png';

const ServiceCard = ({ service, provider, showBookBtn = false, onBook }) => {
    const navigate = useNavigate();

    const formatDuration = (minutes) => {
        if (minutes < 60) return `${minutes} min`;
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins ? `${hrs}h ${mins}m` : `${hrs}h`;
    };

    return (
        <div className="service-card">
            {(service.primaryImage || service.images?.[0]) && (
                <div className="service-card__image">
                    <img src={service.primaryImage || service.images[0]} alt={service.name} />
                </div>
            )}
            <div className="service-card__body">
                <div className="service-card__header">
                    <h4 className="service-card__name">{service.name}</h4>
                    <span className="service-card__price">₹{service.price}</span>
                </div>
                <p className="service-card__desc">{service.description}</p>
                <div className="service-card__meta">
                    <span className="service-card__duration">⏱ {formatDuration(service.duration)}</span>
                    {service.categoryId?.name && (
                        <span className="service-card__category">{service.categoryId.name}</span>
                    )}
                </div>
                {provider && (
                    <div
                        className="service-card__provider"
                        onClick={() => navigate(`/customer/provider/${provider._id}`)}
                    >
                        <img src={provider.logoUrl || DEFAULT_IMAGE} alt={provider.name} />
                        <span>{provider.name}</span>
                    </div>
                )}
                {showBookBtn && (
                    <button className="service-card__book-btn" onClick={() => onBook?.(service)}>
                        Book Now
                    </button>
                )}
            </div>
        </div>
    );
};

export default ServiceCard;
