const LoadingSpinner = ({ size = 'md', text = '' }) => {
    return (
        <div className={`spinner spinner--${size}`}>
            <div className="spinner__circle" />
            {text && <p className="spinner__text">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;
