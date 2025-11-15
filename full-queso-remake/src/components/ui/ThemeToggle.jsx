import React from 'react'
import { FiSun, FiMoon } from 'react-icons/fi'
import useThemeStore from '../../store/themeStore'

const ThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useThemeStore()

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-neutral-border dark:hover:bg-gray-600 transition-colors"
            aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
            {isDarkMode ? (
                <FiSun size={20} className="text-yellow-500" />
            ) : (
                <FiMoon size={20} className="text-neutral-text-muted" />
            )}
        </button>
    )
}

export default ThemeToggle