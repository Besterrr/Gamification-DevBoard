import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../hooks/useAuth.js";

const LoginPage = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();

        const response = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });
        const data = await response.json();

        if(!response.ok){
            setError(data.message);
            return;
        }
        const user = data.user;
        const accessToken = data.accessToken;
        const refreshToken = data.refreshToken;
        login(user, accessToken, refreshToken);
        navigate("/");
    }

    return (
        <>
        <form onSubmit = {handleSubmit}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Войти</button>
        </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
    );
};

export default LoginPage;