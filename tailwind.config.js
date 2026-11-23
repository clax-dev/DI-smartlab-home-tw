/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  // hover: solo se aplica en dispositivos con ratón (evita el "hover pegado" al tocar en móvil)
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      // Paleta brutalista: colores planos y saturados + tinta negra pura
      colors: {
        brut: {
          ink: '#000000',
          paper: '#F4F1EA',
          yellow: '#FFE14D',
          red: '#FF5C5C',
          green: '#7CF29C',
          blue: '#6EC8FF',
        },
      },
      // Sombras duras (sin desenfoque): rasgo clave del brutalismo
      boxShadow: {
        'brut-sm': '3px 3px 0 0 #000',
        brut: '6px 6px 0 0 #000',
        'brut-lg': '10px 10px 0 0 #000',
      },
      fontFamily: {
        display: ['"Archivo Black"', 'Impact', 'sans-serif'],
        mono: ['"Space Mono"', 'Consolas', 'monospace'],
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        pop: {
          '0%': { opacity: '0', transform: 'scale(.94) rotate(-1deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0)' },
        },
      },
      animation: {
        marquee: 'marquee 22s linear infinite',
        pop: 'pop .25s ease-out both',
      },
    },
  },
  plugins: [],
};
