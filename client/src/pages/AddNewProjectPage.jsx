import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axiosClient.js";
import './AddNewProjectPage.scss';

const AddNewProjectPage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/api/projects`, { title, description });
            navigate("/");
        } catch (e) {
            setError(e.message);
            setLoading(false);
        }
    }

    return (
        <div className="new-project">
            <div className="new-project__card">
                <button className="new-project__back" onClick={() => navigate('/')}>
                    ← Назад
                </button>

                <div className="new-project__header">
                    <h1 className="new-project__title">Новый проект</h1>
                    <p className="new-project__subtitle">Заполни детали — и сразу к делу</p>
                </div>

                {error && <p className="new-project__error">{error}</p>}

                <form className="new-project__form" onSubmit={handleSubmit}>
                    <label className="new-project__field">
                        <span className="new-project__label">Название</span>
                        <input
                            className="new-project__input"
                            type="text"
                            placeholder="Например, DevBoard"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            autoFocus
                        />
                    </label>

                    <label className="new-project__field">
                        <span className="new-project__label">Описание <span className="new-project__optional">(необязательно)</span></span>
                        <textarea
                            className="new-project__input new-project__input--textarea"
                            placeholder="О чём этот проект?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </label>

                    <button
                        className="new-project__submit"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Создаём...' : 'Создать проект'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddNewProjectPage;