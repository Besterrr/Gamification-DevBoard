import './Loader.scss';

const Loader = ({ fullscreen = false }) => {
    return (
        <div className={`loader ${fullscreen ? 'loader--fullscreen' : ''}`}>
            <div className="loader__spinner">
                <div className="loader__ring" />
                <div className="loader__ring" />
                <div className="loader__ring" />
            </div>
        </div>
    );
};

export default Loader;