import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ children }) => {
    const { accessToken } = useAuth();

    if (!accessToken) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default PrivateRoute;