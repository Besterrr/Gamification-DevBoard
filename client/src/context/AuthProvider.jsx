import {useState} from "react";
import {AuthContext} from "./AuthContext.jsx";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));

    function login(userData, accessToken, refreshToken) {
        setUser(userData);
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
    }

    function logout() {
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setAccessToken(null);
        setRefreshToken(null);
    }

    function updateTokens(newAccessToken, newRefreshToken) {
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
    }

    return (
        <AuthContext.Provider value={{ user, accessToken, refreshToken, login, logout, updateTokens }}>{children}</AuthContext.Provider>
    )
}