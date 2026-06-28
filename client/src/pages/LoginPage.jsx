import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../hooks/useAuth.js";
import api from "../api/axiosClient.js";

const LoginPage = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();
        try{
            const response = await api.post(`/api/auth/login`, {email, password});
            const user = response.data.user;
            const accessToken = response.data.accessToken;
            const refreshToken = response.data.refreshToken;
            login(user, accessToken, refreshToken);
            navigate("/");
        }catch(e){
            setError(e.message);
        }
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