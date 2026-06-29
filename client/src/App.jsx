import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import AddNewProjectPage from "./pages/AddNewProjectPage.jsx";
import ProjectPage from "./pages/ProjectPage.jsx";
import AchievementsPage from "./pages/AchievementsPage.jsx";
import {useEffect} from "react";
import {useAuth} from "./hooks/useAuth.js";
import socket from "./socket.js";
import api, { setupInterceptors } from './api/axiosClient.js';

function App() {
    const {logout, accessToken, refreshToken, updateTokens} = useAuth();

    setupInterceptors(accessToken, refreshToken, updateTokens, logout);

    useEffect(() => {
        if(!accessToken) return;

        async function fetchUser() {
            const response = await api.get('/api/auth/me');
            socket.emit('register', response.data.user.id);
        }
        fetchUser();
    }, [accessToken]);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={
                    <PrivateRoute>
                        <DashboardPage />
                    </PrivateRoute>
                } />

                <Route path = "/addProject" element = {
                    <PrivateRoute>
                        <AddNewProjectPage/>
                    </PrivateRoute>
                }>
                </Route>

                <Route path = "/project/:id" element = {
                    <PrivateRoute>
                        <ProjectPage/>
                    </PrivateRoute>
                }>
                </Route>

                <Route path = "/achievements" element = {
                    <PrivateRoute>
                        <AchievementsPage/>
                    </PrivateRoute>
                }>
                </Route>

                <Route path="/login" element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                } />

                <Route path="/register" element={
                    <PublicRoute>
                        <RegisterPage />
                    </PublicRoute>
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default App
