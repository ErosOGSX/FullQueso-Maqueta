import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
  persist(
    (set, get) => ({
      isDarkMode: false,
      
      toggleTheme: () => {
        const newMode = !get().isDarkMode
        set({ isDarkMode: newMode })
        
        if (newMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
      
      setTheme: (isDark) => {
        set({ isDarkMode: isDark })
        
        if (isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
      
      initTheme: () => {
        document.documentElement.classList.remove('dark')
        set({ isDarkMode: false })
      }
    }),
    {
      name: 'theme-storage'
    }
  )
)

export default useThemeStore