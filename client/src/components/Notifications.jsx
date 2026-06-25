import socket from "../socket.js";
import {useEffect, useState} from "react";


const Notifications = () => {
    const[notifications, setNotifications] = useState([]);
    const [showList, setShowList] = useState(false);

    useEffect(() => {
        function handleNotification(data) {
            setNotifications(prev => {
                const alreadyExists = prev.some(n => n.taskId === data.taskId);
                if(alreadyExists) return prev;
                return [...prev, data];
            });
        }
        socket.on('notification', handleNotification);
        return () => socket.off('notification', handleNotification);
    }, []);

    return (
        <div>
            <p onClick={() => setShowList(!showList)}>🔔: {notifications.length}</p>
            {showList && (
                <div>
                    {notifications.map((notification) => (
                        <div key={notification.taskId}>
                            <p>{notification.message}</p>
                        </div>
                    ))}
                    <button onClick={() => setNotifications([])}>Очистить</button>
                </div>
            )}
        </div>
    );
};

export default Notifications;