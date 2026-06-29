import {useAuth} from "../hooks/useAuth.js";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Notifications from "../components/Notifications.jsx";
import ActivityChart from "../components/ActivityChart.jsx";
import Heatmap from "../components/Heatmap.jsx";
import api from "../api/axiosClient.js";
import {useDarkMode} from "../hooks/useDarkMode.js";
import './DashboardPage.scss';

const DashboardPage = () => {
    const {logout} = useAuth();
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
    const { isDark, toggleDark } = useDarkMode();

    useEffect(() => {
        async function fetchProjects() {
            try{
                const [projectResponse, userDataResponse] = await Promise.all([
                    api.get('/api/projects'),
                    api.get('/api/auth/me')
                ]);
                setProjects(projectResponse.data.projects);
                setUsername(userDataResponse.data.user.username);
                setAvatar(userDataResponse.data.user.avatar_url);
                setXP(userDataResponse.data.user.xp);
                setLevel(userDataResponse.data.user.level);
                setLoading(false);
            }catch(e){
                setError(e.message);
                setLoading(false);
            }
        }
        fetchProjects();
    }, [])

   async function handleDelete(removedId) {
       if(window.confirm('Точно хочешь удалить проект?')) {
           try{
               await api.delete(`/api/projects/${removedId}`);
               setProjects(projects => projects.filter(project => project.id !== removedId));
           }catch(e){
               setError(e.message);
               setLoading(false);
           }
        }
    }

    function handleEdit(project) {
        setEditingId(project.id);
        setEditTitle(project.title);
        setEditDescription(project.description);
    }

    async function handleUpdate(e){
        e.preventDefault();
        try{
           const response = await api.put(`/api/projects/${editingId}`,{title: editTitle, description: editDescription})
            const updatedProjects = projects.map((project) => {
                if(project.id === editingId) {
                    return response.data.project;
                }
                return project;
            })
            setEditTitle('')
            setEditDescription('')
            setProjects(updatedProjects);
            setEditingId(null);
        }catch(e){
            setError(e.message);
            setLoading(false);
        }
    }

    async function handleAvatarUpload(e){
        const file = e.target.files[0];
        if(!file){
            return
        }
        const formData = new FormData();
        formData.append('file', file);
        try{
            const response = await api.post(`/api/users/avatar`, formData)
            setAvatar(response.data.avatarUrl);
        }catch(e){
            setError(e.message);
            setLoading(false);
        }
    }

    if(loading){
        return <p>Загрузка...</p>
    }

    return (
        <div className="dashboard">
            <header className="dashboard__header">
                <h1 className="dashboard__title">DevBoard</h1>
                <button className="theme-toggle" onClick={toggleDark}>
                    {isDark ? '☀️' : '🌙'}
                </button>
            </header>

            <div className="dashboard__profile">
                <div className="dashboard__avatar">
                    {avatar
                        ? <img src={'http://localhost:5000' + avatar} alt="Аватар"/>
                        : <span>👤</span>
                    }
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} />
                </div>
                <div className="dashboard__user-info">
                    <h3>{username}</h3>
                    <p>Level: {level} · XP: {xp}</p>
                </div>
                <div className="dashboard__actions">
                    <button onClick={() => navigate('/achievements')}>Достижения</button>
                    <button onClick={logout}>Выйти</button>
                </div>
            </div>

            <Notifications/>

            {error && <p className="error">{error}</p>}

            <div className="dashboard__projects">
                <div className="dashboard__projects-header">
                    <h2>Мои проекты</h2>
                    <button onClick={() => navigate('/addProject')}>+ Новый проект</button>
                </div>
                {projects.length === 0
                    ? <p className="dashboard__empty">У тебя пока нет проектов</p>
                    : <ul className="project-list">
                        {projects.map(project => (
                            <li key={project.id} className="project-card">
                                <div className="project-card__content" onClick={() => navigate(`/project/${project.id}`)}>
                                    <h3>{project.title}</h3>
                                    <p>{project.description}</p>
                                </div>
                                <div className="project-card__actions">
                                    <button onClick={() => handleEdit(project)}>✏️</button>
                                    <button onClick={() => handleDelete(project.id)}>❌</button>
                                </div>
                                {editingId === project.id &&
                                    <form className="project-card__edit-form" onSubmit={handleUpdate}>
                                        <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Название"/>
                                        <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Описание"/>
                                        <button type="submit">Обновить</button>
                                    </form>
                                }
                            </li>
                        ))}
                    </ul>
                }
            </div>

            <div className="dashboard__activity">
                <h2>Активность</h2>
                <ActivityChart/>
                <hr/>
                <Heatmap/>
            </div>
        </div>
    );
};

export default DashboardPage;