import {useNavigate} from "react-router-dom";
import {useState} from "react";
import api from "../api/axiosClient.js";

const AddNewProjectPage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        try{
            await api.post(`/api/projects`,{ title, description });
            setTitle('');
            setDescription('');
            navigate("/");
        }catch(e){
            setError(e.message);
        }
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