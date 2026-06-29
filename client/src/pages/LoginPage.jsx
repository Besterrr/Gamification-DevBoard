import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import api from "../api/axiosClient.js";
import './Auth.scss';
import ThemeToggle from "../components/ThemeToggle.jsx";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const response = await api.post(`/api/auth/login`, { email, password });
            const user = response.data.user;
            const accessToken = response.data.accessToken;
            const refreshToken = response.data.refreshToken;
            login(user, accessToken, refreshToken);
            navigate("/");
        } catch (e) {
            setError(e.message);
        }
    }

    return (
        <div className="auth">
            <div className="auth__card">
                <div className="auth__header">
                    <h1 className="auth__logo">DevBoard</h1>
                    <p className="auth__subtitle">Войди в свой аккаунт</p>
                </div>

                {error && <p className="auth__error">{error}</p>}

                <form className="auth__form" onSubmit={handleSubmit}>
                    <label className="auth__field">
                        <span className="auth__label">Email</span>
                        <input
                            className="auth__input"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </label>

                    <label className="auth__field">
                        <span className="auth__label">Пароль</span>
                        <input
                            className="auth__input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </label>

                    <button className="auth__submit" type="submit">Войти</button>
                </form>

                <p className="auth__switch">
                    Нет аккаунта?{' '}
                    <Link className="auth__link" to="/register">Зарегистрироваться</Link>
                </p>
            </div>
            <ThemeToggle />
        </div>
    );
};

export default LoginPage;