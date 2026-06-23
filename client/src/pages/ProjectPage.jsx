import {useNavigate, useParams} from 'react-router-dom'
import {useEffect, useState} from "react";
import {apiFetch, fetchProjectStats} from "../api/apiClient.js";
import {useAuth} from "../hooks/useAuth.js";
import AddTasksForm from "../components/AddTasksForm.jsx";

const ProjectPage = () => {
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const {id} = useParams();
    const {logout, accessToken, refreshToken, updateTokens} = useAuth();
    const [project, setProject] = useState(null)
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(0);

    useEffect(() => {
        async function fetchTasks() {
            const [projectResponse, tasksResponse, statsResponse] = await Promise.all([
                apiFetch(`http://localhost:5000/api/projects/${id}`,
                    {method: 'GET'},
                    accessToken,
                    refreshToken,
                    updateTokens,
                    logout
                ),
                apiFetch(`http://localhost:5000/api/projects/${id}/tasks`,
                    {method: 'GET'},
                    accessToken,
                    refreshToken,
                    updateTokens,
                    logout
                ),
                apiFetch(`http://localhost:5000/api/projects/${id}/stats`,
                    {method: 'GET'},
                    accessToken,
                    refreshToken,
                    updateTokens,
                    logout)
            ]);
            const projectData = await projectResponse.json();
            const tasksData = await tasksResponse.json();
            const statsData = await statsResponse.json();
            if (!projectResponse.ok || !tasksResponse.ok || !statsResponse.ok) {
                setError('Ошибка загрузки данных');
                setLoading(false);
                return;
            }
            setProject(projectData.project);
            setTasks(tasksData.tasks);
            setLoading(false);
            setStats(statsData.stats);
        }
        fetchTasks();
    },[id, accessToken, refreshToken, updateTokens, logout]);

    async function handleCreateTask(title, description, priority) {
        const response = await apiFetch(`http://localhost:5000/api/projects/${id}/tasks`,
            {method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, priority })},
            accessToken,
            refreshToken,
            updateTokens,
            logout
        )
        const data = await response.json();
        if(!response.ok) {
            setError(data.message);
            setLoading(false);
            setShowForm(false);
            return;
        }
        setShowForm(false);
        setTasks(tasks => [...tasks, data.task]);
        const statsData = await fetchProjectStats(id, accessToken, refreshToken, updateTokens, logout);
        setStats(statsData.stats);
    }

    async function handleDeleteTask(removedId) {
        if(window.confirm('Точно хочешь удалить задачу?')) {
            const response = await apiFetch(
                `http://localhost:5000/api/tasks/${removedId}`,
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
            setTasks(tasks => tasks.filter(task => task.id !== removedId));
            const statsData = await fetchProjectStats(id, accessToken, refreshToken, updateTokens, logout);
            setStats(statsData.stats);
        }
    }

    async function handleUpdateTask(updatedId, status) {
        const currentTask = tasks.find((task) => task.id === updatedId);
        const title = currentTask.title;
        const description = currentTask.description;
        const priority = currentTask.priority;
        const deadline = currentTask.deadline;
        const response = await apiFetch(`http://localhost:5000/api/tasks/${updatedId}`,
            {method: 'PUT',
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify({title, description, priority, status, deadline}),},
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
       const updatedTasks = tasks.map((task) => {
            if(task.id === updatedId) {
                return data.task;
            }
            return task;
        })
        setTasks(updatedTasks);
        const statsData = await fetchProjectStats(id, accessToken, refreshToken, updateTokens, logout);
        setStats(statsData.stats);
    }

    if(loading){
        return <p>Загрузка...</p>
    }

    return (
        <>
            <div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <h1>{project.title}</h1>
                <p>{project.description}</p>
                <p>Задач всего: {stats.total} Выполнено: {stats.completed}</p>
                {tasks.map(task => (
                    <div key = {task.id}>
                        <p>{task.title}: {task.priority}</p>
                        <select name="status" id="status" value={task.status} onChange={(e) => handleUpdateTask(task.id, e.target.value)}>
                            <option value="todo">todo</option>
                            <option value="inProgress">in progress</option>
                            <option value="done">done</option>
                        </select>
                        <button onClick={() => handleDeleteTask(task.id)}>❌</button>
                    </div>
                ))}
            </div>
                <button onClick={()=> setShowForm(true)}>Добавить задачу</button>
                <button onClick={() => navigate('/')}>Назад</button>
            <div>
                {showForm && <AddTasksForm addTask = {handleCreateTask} showForm={true}/>}
                {showForm && <button onClick={() => setShowForm(false)}>Отмена</button>}
            </div>
        </>
    );
};

export default ProjectPage;
