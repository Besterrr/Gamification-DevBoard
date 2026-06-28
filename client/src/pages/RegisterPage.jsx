import {useState} from "react";
import {useAuth} from "../hooks/useAuth.js";
import {useNavigate} from "react-router-dom";
import api from "../api/axiosClient.js";

const RegisterPage = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const {login} = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        try{
            const response = await api.post(`/api/auth/register`, {email, username, password})
            const user = response.data.newUser;
            const accessToken = response.data.accessToken;
            const refreshToken = response.data.refreshToken;
            login(user, accessToken, refreshToken);
            navigate("/")
        }catch (e) {
            setError(e.message);
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Зарегистрироваться</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
    );
};

export default RegisterPage;