import {useEffect, useState} from "react";
import {fetchUserStats} from "../api/apiClient.js";
import './Heatmap.scss';

const dayLabels = ['Пн', '', 'Ср', '', 'Пт', '', ''];
const monthLabels = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

function getLevel(count) {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count <= 4) return 3;
    return 4;
}

function groupByWeeks(days) {
    const size = 7;
    return days.reduce((chunks, item, index) =>
        index % size === 0 ? [...chunks, days.slice(index, index + size)] : chunks, []);
}

function getMonthLabel(week, prevWeek) {
    const currentMonth = new Date(week[0].date).getMonth();
    if (!prevWeek) return monthLabels[currentMonth];
    const prevMonth = new Date(prevWeek[0].date).getMonth();
    return currentMonth !== prevMonth ? monthLabels[currentMonth] : '';
}

const Heatmap = () => {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        async function fetchHalfOfYearData() {
            const days = 182;
            const date = new Date();
            date.setDate(date.getDate() - days + 1);
            const dayOfTheWeek = date.getDay();
            const extraDays = ((dayOfTheWeek - 1) + 7) % 7;
            const countOfDays = days + extraDays;
            const data = await fetchUserStats(countOfDays);
            setStats(data.activity);
        }
        fetchHalfOfYearData();
    }, []);

    if (stats.length === 0) return null;

    const weeks = groupByWeeks(stats);
    const totalCount = stats.reduce((sum, day) => sum + day.count, 0);

    return (
        <div className="heatmap">
            <div className="heatmap__header">
                <span className="heatmap__title">Недавняя активность</span>
                <span className="heatmap__subtitle">Последние 6 месяцев</span>
            </div>

            <div className="heatmap__grid-wrapper">
                <div className="heatmap__month-labels">
                    {weeks.map((week, i) => (
                        <div key={i} className="heatmap__month-label">
                            {getMonthLabel(week, weeks[i - 1])}
                        </div>
                    ))}
                </div>

                <div className="heatmap__body">
                    <div className="heatmap__day-labels">
                        {dayLabels.map((label, i) => (
                            <div key={i} className="heatmap__day-label">{label}</div>
                        ))}
                    </div>

                    <div className="heatmap__weeks">
                        {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="heatmap__week">
                                {week.map((day) => {
                                    const level = getLevel(day.count);
                                    return (
                                        <div
                                            key={day.date}
                                            className={`heatmap__cell heatmap__cell--level-${level}`}
                                            title={`${day.date}: ${day.count} задач`}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="heatmap__footer">
                <span>{totalCount} выполненных задач</span>
                <div className="heatmap__legend">
                    <span>0</span>
                    {[0, 1, 2, 3, 4].map(level => (
                        <div key={level} className={`heatmap__legend-cell heatmap__legend-cell--level-${level}`}/>
                    ))}
                    <span>5+</span>
                </div>
            </div>
        </div>
    );
};

export default Heatmap;