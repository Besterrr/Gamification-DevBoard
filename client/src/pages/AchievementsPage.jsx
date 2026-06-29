import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient.js";
import './AchievementsPage.scss';
import Loader from "../components/Loader.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const AchievementsPage = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchAchievements() {
            try {
                const response = await api.get(`/api/achievements`);
                setAchievements(response.data.achievements);
                setLoading(false);
            } catch (e) {
                setError(e.message);
                setLoading(false);
            }
        }
        fetchAchievements();
    }, []);

    if (loading) return <Loader fullscreen />;

    const earned = achievements.filter(a => a.earned_at);
    const locked = achievements.filter(a => !a.earned_at);

    return (
        <div className="achievements-page">
            <header className="achievements-page__header">
                <button className="achievements-page__back" onClick={() => navigate('/')}>
                    ← Назад
                </button>
                <div className="achievements-page__heading">
                    <h1>Достижения</h1>
                    <span className="achievements-page__counter">
                        {earned.length} / {achievements.length}
                    </span>
                </div>
                <div className="achievements-page__progress-bar">
                    <div
                        className="achievements-page__progress-fill"
                        style={{ width: `${achievements.length ? (earned.length / achievements.length) * 100 : 0}%` }}
                    />
                </div>
            </header>

            {error && <p className="achievements-page__error">{error}</p>}

            {earned.length > 0 && (
                <section className="achievements-page__section">
                    <h2 className="achievements-page__section-title">Получено</h2>
                    <div className="achievements-page__grid">
                        {earned.map(achievement => (
                            <AchievementCard key={achievement.id} achievement={achievement} />
                        ))}
                    </div>
                </section>
            )}

            {locked.length > 0 && (
                <section className="achievements-page__section">
                    <h2 className="achievements-page__section-title">Не получено</h2>
                    <div className="achievements-page__grid">
                        {locked.map(achievement => (
                            <AchievementCard key={achievement.id} achievement={achievement} />
                        ))}
                    </div>
                </section>
            )}
            <ThemeToggle />
        </div>
    );
};

function AchievementCard({ achievement }) {
    const earned = !!achievement.earned_at;

    return (
        <div className={`achievement-card ${earned ? 'achievement-card--earned' : ''}`}>
            <div className="achievement-card__icon">{achievement.icon || '🏆'}</div>
            <div className="achievement-card__body">
                <h3 className="achievement-card__title">{achievement.title}</h3>
                <p className="achievement-card__description">{achievement.description}</p>
                <div className="achievement-card__footer">
                    <span className="achievement-card__xp">+{achievement.xp_bonus} XP</span>
                    {earned && (
                        <span className="achievement-card__date">
                            {new Date(achievement.earned_at).toLocaleDateString('ru-RU')}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AchievementsPage;