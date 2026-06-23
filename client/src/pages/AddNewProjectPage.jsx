import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {useAuth} from "../hooks/useAuth.js";
import {apiFetch} from "../api/apiClient.js";

const AddNewProjectPage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState(null);
    const {accessToken, refreshToken, updateTokens, logout} = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();
        const response = await apiFetch(
            "http://localhost:5000/api/projects",
            {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description })
            },
            accessToken,
            refreshToken,
            updateTokens,
            logout
        );
        const data = await response.json();
        if(!response.ok){
            setError(data.message)
            return
        }
        setTitle('');
        setDescription('');
        navigate("/");
    }

    return (
        <div>
        <form onSubmit = {handleSubmit}>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
            <button type="submit">Добавить проект</button>
        </form>
            {error && <p style = {{color: "red"}}>{error}</p>}
        </div>
    );
};

export default AddNewProjectPage;