import {useEffect, useState} from "react";

export function useDarkMode(){

    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    })

    useEffect(() => {
        if(isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggleDark = () => setIsDark(prev => !prev);
    return { isDark, toggleDark };
}


