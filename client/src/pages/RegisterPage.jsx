import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import api from "../api/axiosClient.js";
import './Auth.scss';
import ThemeToggle from "../components/ThemeToggle.jsx";

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const response = await api.post(`/api/auth/register`, { email, username, password });
            const user = response.data.newUser;
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
                    <p className="auth__subtitle">Создай аккаунт</p>
                </div>

                {error && <p className="auth__error">{error}</p>}

                <form className="auth__form" onSubmit={handleSubmit}>
                    <label className="auth__field">
                        <span className="auth__label">Имя пользователя</span>
                        <input
                            className="auth__input"
                            type="text"
                            placeholder="Например, bester"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </label>

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
                            autoComplete="new-password"
                        />
                    </label>

                    <button className="auth__submit" type="submit">Зарегистрироваться</button>
                </form>

                <p className="auth__switch">
                    Уже есть аккаунт?{' '}
                    <Link className="auth__link" to="/login">Войти</Link>
                </p>
            </div>
            <ThemeToggle />
        </div>
    );
};

export default RegisterPage;