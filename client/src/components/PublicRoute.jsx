import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PublicRoute = ({ children }) => {
    const { accessToken } = useAuth();

    if (accessToken) {
        return <Navigate to="/" />;
    }

    return children;
};

export default PublicRoute;