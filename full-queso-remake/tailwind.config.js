/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx}", // Actualizado para JavaScript
    ],
    theme: {
      extend: {
        colors: {
          'brand': {
            'primary': {
              light: '#F87171',
              DEFAULT: '#EF4444',
              dark: '#DC2626',
            },
            'yellow': {
              light: '#FDE047',
              DEFAULT: '#FACC15',
              dark: '#EAB308',
            },
            'dark': {
              light: '#633C7A',
              DEFAULT: '#3C1E46',
              rich: '#2A1133',
            },
          },
          'neutral': {
            'background': '#FEFDFB',
            'surface': '#FFFFFF',
            'border': '#E5E7EB',
            'text-muted': '#6B7280',
          },
          'feedback': {
            'success': '#22C55E',
          },
        },
        fontFamily: {
          'display': ['"Alfa Slab One"', 'serif'],
          'display-alt': ['"Luckiest Guy"', 'cursive'],
          'body': ['"Nunito"', 'sans-serif'],
        },
      },
    },
    plugins: [],
}