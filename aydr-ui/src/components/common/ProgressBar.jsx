const STATUS_COLORS = {
    INCOMPLETE: { bar: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', label: 'Incomplete' },
    PENDING: { bar: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', label: 'Pending Review' },
    APPROVED: { bar: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', label: 'Approved' },
    REJECTED: { bar: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'Rejected' },
};

const PROGRESS_VALUES = { INCOMPLETE: 25, PENDING: 60, APPROVED: 100, REJECTED: 100 };

const ProgressBar = ({ label, status = 'INCOMPLETE', message = '' }) => {
    const config = STATUS_COLORS[status] || STATUS_COLORS.INCOMPLETE;
    const progress = PROGRESS_VALUES[status] || 25;

    return (
        <div className="progress-bar">
            <div className="progress-bar__header">
                <span className="progress-bar__label">{label}</span>
                <span className="progress-bar__status" style={{ color: config.bar }}>{config.label}</span>
            </div>
            <div className="progress-bar__track" style={{ backgroundColor: config.bg }}>
                <div
                    className="progress-bar__fill"
                    style={{ width: `${progress}%`, backgroundColor: config.bar }}
                />
            </div>
            {message && <p className="progress-bar__message">{message}</p>}
        </div>
    );
};

export default ProgressBar;
