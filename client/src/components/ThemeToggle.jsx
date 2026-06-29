import { useDarkMode } from '../hooks/useDarkMode.js';
import './ThemeToggle.scss';

const ThemeToggle = () => {
    const { isDark, toggleDark } = useDarkMode();

    return (
        <button
            className="theme-toggle"
            onClick={toggleDark}
            aria-label="Переключить тему"
        >
            {isDark ? '☀️' : '🌙'}
        </button>
    );
};

export default ThemeToggle;