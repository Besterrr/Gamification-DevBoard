import {useAuth} from "../hooks/useAuth.js";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {apiFetch} from "../api/apiClient.js";
import Notifications from "../components/Notifications.jsx";
import ActivityChart from "../components/ActivityChart.jsx";
import Heatmap from "../components/Heatmap.jsx";

const DashboardPage = () => {
    const {logout, accessToken, refreshToken, updateTokens} = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [xp, setXP] = useState(0);
    const [level, setLevel] = useState(1);
    const [username, setUsername] = useState('User');
    const [avatar, setAvatar] = useState(null);

    useEffect(() => {
        async function fetchProjects() {
            const [projectResponse, userDataResponse] = await Promise.all([
                apiFetch(`http://localhost:5000/api/projects`,
                { method: "GET" },
                accessToken,
                refreshToken,
                updateTokens,
                logout),
                apiFetch(`http://localhost:5000/api/auth/me`,
                    {method: "GET"},
                    accessToken,
                    refreshToken,
                    updateTokens,
                    logout)
            ]);
            const projectData = await projectResponse.json();
            const userData = await userDataResponse.json();
            if(!projectResponse.ok || !userDataResponse.ok) {
                setError({message: "Ошибка загрузки данных"});
                setLoading(false);
                return;
            }
            setProjects(projectData.projects);
            setAvatar(userData.user.avatar_url);
            setUsername(userData.user.username);
            setXP(userData.user.xp);
            setLevel(userData.user.level);
            setLoading(false);
        }
        fetchProjects();
    }, [accessToken,refreshToken, updateTokens, logout])

   async function handleDelete(removedId) {
       if(window.confirm('Точно хочешь удалить проект?')) {
           const response = await apiFetch(
               `http://localhost:5000/api/projects/${removedId}`,
               { method: "DELETE" },
               accessToken,
               refreshToken,
               updateTokens,
               logout
           );
            const data = await response.json();
            if(!response.ok) {
                setError(data.message);
                return;
            }
            setProjects(projects => projects.filter(project => project.id !== removedId));
        }
    }

    function handleEdit(project) {
        setEditingId(project.id);
        setEditTitle(project.title);
        setEditDescription(project.description);
    }

    async function handleUpdate(e){
        e.preventDefault();
        const response = await apiFetch(`http://localhost:5000/api/projects/${editingId}`,
            { method: "PUT",
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify ({title: editTitle, description: editDescription}), },
            accessToken,
            refreshToken,
            updateTokens,
            logout
        )
        const data = await response.json();
        if(!response.ok) {
            setError(data.message);
            return;
        }
        const updatedProjects = projects.map((project) => {
            if(project.id === editingId) {
                return data.project;
            }
            return project;
        })
        setEditTitle('')
        setEditDescription('')
        setProjects(updatedProjects);
        setEditingId(null);
    }

    async function handleAvatarUpload(e){
        const file = e.target.files[0];
        if(!file){
            return
        }
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await apiFetch('http://localhost:5000/api/users/avatar',
            {method: "POST", body: formData},
            accessToken,
            refreshToken,
            updateTokens,
            logout)
        const data = await response.json();
        if(!response.ok) {
            setError(data.message);
            return;
        }
        setAvatar(data.avatarUrl);
    }

    if(loading){
        return <p>Загрузка...</p>
    }

    return (
        <div>
            <h1>Дашборд</h1>
            <h3>{username}
                <button onClick={() => navigate('/achievements')}>Достижения</button>
            </h3>
            {avatar ? <img style={{width: '50px'}} src={'http://localhost:5000' + avatar} alt="Аватар"/> : <p>👤</p>}
            <input type="file" accept="image/*" onChange={(e)=> handleAvatarUpload(e)} />
            <Notifications/>
            <p>Level: {level}; XP: {xp}</p>
            {!error && projects.length === 0 && <p style={{color: 'green'}}>У тебя пока нет проектов</p>}
            {error && <p style={{color: 'red'}}>{error}</p>}
            <ul>
                {projects.map(project => (
                    <li key={project.id}>
                        {project.title} — {project.description}
                        <div onClick={() => handleDelete(project.id)}>❌</div>
                        <div onClick={() => handleEdit(project)}>✏️</div>
                        {editingId === project.id && <form onSubmit={(e) => handleUpdate(e)}>
                            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}/>
                            <input type="text" value={editDescription}
                                   onChange={(e) => setEditDescription(e.target.value)}/>
                            <button type="submit">Обновить</button>
                        </form>}
                        <div onClick={() => navigate(`/project/${project.id}`)}>Добавить задачи</div>
                        ️️
                    </li>
                ))}
            </ul>
            <button onClick={() => navigate('/addProject')}>Добавить новый проект</button>
            <button onClick={logout}>Выйти из учётной записи</button>
            <ActivityChart/>
            <hr/>
            <div style={{marginBottom: '100px'}}>
                <Heatmap/>
            </div>
        </div>
    );
};

export default DashboardPage;