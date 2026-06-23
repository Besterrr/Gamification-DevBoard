import {useState} from "react";
import {useAuth} from "../hooks/useAuth.js";
import {useNavigate} from "react-router-dom";

const RegisterPage = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const {login} = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, username, password})
        });
        const data = await response.json();
        if(!response.ok){
            setError(data.message);
            return;
        }
        const user = data.newUser;
        const accessToken = data.accessToken;
        const refreshToken = data.refreshToken;
        login(user, accessToken, refreshToken);
        navigate("/")
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