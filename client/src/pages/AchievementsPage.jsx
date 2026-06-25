import {useEffect, useState} from "react";
import {apiFetch} from "../api/apiClient.js";
import {useAuth} from "../hooks/useAuth.js";

const AchievementsPage = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {logout, accessToken, refreshToken, updateTokens} = useAuth();

    useEffect(() => {
        async function fetchAchievements() {
            const response = await apiFetch(`http://localhost:5000/api/achievements`,
                {method: 'GET'},
                accessToken,
                refreshToken,
                updateTokens,
                logout
            );
            const achievementsData = await response.json();
            if(!response.ok){
                setError('Ошибка загрузки данных');
                setLoading(false);
                return;
            }
            setAchievements(achievementsData.achievements);
            setLoading(false);
        }
        fetchAchievements();
    }, [accessToken, refreshToken, updateTokens, logout]);

    if (loading) return <p>Загрузка...</p>

    return (
        <div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {achievements.map(achievement => (
                <div key={achievement.id} style={{ color: achievement.earned_at ? 'green' : 'grey' }}>
                    <h3>{achievement.title}</h3>
                    <p>{achievement.icon}</p>
                    <p>{achievement.description}</p>
                    <p>Бонусное XP: {achievement.xp_bonus}</p>
                    {achievement.earned_at && (
                        <p>Получена: {new Date(achievement.earned_at).toLocaleDateString('ru-RU')}</p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default AchievementsPage;