import {useEffect, useState} from "react";
import {fetchUserStats} from "../api/apiClient.js";
import {useAuth} from "../hooks/useAuth.js";

const levelColors = {
    0: '#ebedf0',
    1: '#9be9a8',
    2: '#40c463',
    3: '#30a14e',
    4: '#216e39',
};

const dayLabels = ['Пн', '', 'Ср', '', 'Пт', '', ''];

const monthLabels = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

function getLevel(count){
    if(count === 0) return 0;
    else if(count === 1) return 1
    else if(count === 2) return 2
    else if(count === 3 || count === 4) return 3
    else if(count >= 5) return 4;
}

function groupByWeeks(days){
    const size = 7;
    return days.reduce((chunks, item, index) =>
        index % size === 0 ? [...chunks, days.slice(index, index + size)] : chunks, []);
}

function getMonthLabel(week, prevWeek){
    const currentMonth = new Date(week[0].date).getMonth();
    if(!prevWeek) return monthLabels[currentMonth];
    const prevMonth = new Date(prevWeek[0].date).getMonth();
    return currentMonth !== prevMonth ? monthLabels[currentMonth] : '';
}

const Heatmap = () => {
    const [stats, setStats] = useState([]);
    const {logout, accessToken, refreshToken, updateTokens} = useAuth();

    useEffect(() => {
        async function fetchHalfOfYearData(){
            const days = 182;
            const date = new Date();
            date.setDate(date.getDate() - days + 1);
            const dayOfTheWeek = date.getDay();
            const extraDays = ((dayOfTheWeek - 1) + 7) % 7;
            const countOfDays = days + extraDays;
            const data = await fetchUserStats(countOfDays, accessToken, refreshToken, updateTokens, logout);
            setStats(data.activity);
        }
        fetchHalfOfYearData();
    }, [accessToken, refreshToken, updateTokens, logout]);

    if(stats.length === 0) return null;

    const weeks = groupByWeeks(stats);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', gap: '3px', marginLeft: '24px' }}>
                {weeks.map((week, i) => (
                    <div key={i} style={{ width: '12px', fontSize: '10px', color: '#888' }}>
                        {getMonthLabel(week, weeks[i - 1])}
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '3px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '20px' }}>
                    {dayLabels.map((label, i) => (
                        <div key={i} style={{ height: '12px', fontSize: '10px', color: '#888' }}>
                            {label}
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '3px' }}>
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {week.map((day) => (
                                <div
                                    key={day.date}
                                    title={`${day.date}: ${day.count}`}
                                    style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '2px',
                                        background: levelColors[getLevel(day.count)]
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Heatmap;