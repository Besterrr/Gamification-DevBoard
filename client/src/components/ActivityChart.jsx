import {useEffect, useState} from "react";
import {fetchUserStats} from "../api/apiClient.js";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {useAuth} from "../hooks/useAuth.js";

const ActivityChart = ({days = 7}) => {
    const [stats, setStats] = useState([]);
    const {logout, accessToken, refreshToken, updateTokens} = useAuth();

    useEffect(() => {
        async function fetchData() {
            const data = await fetchUserStats(days, accessToken, refreshToken, updateTokens, logout);
            setStats(data.activity);
        }
        fetchData();
    }, [days,accessToken, refreshToken, updateTokens, logout]);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default ActivityChart;