import {useEffect, useState} from "react";
import api from "../api/axiosClient.js";

const AchievementsPage = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchAchievements() {
            try{
                const response = await api.get(`/api/achievements`);
                setAchievements(response.data.achievements);
                setLoading(false);
            }catch(e){
                setError(e.message);
                setLoading(false);
            }
        }
        fetchAchievements();
    }, []);

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