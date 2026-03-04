/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
        colors: {
        "brand-dark": "#0f172a", // Mantener base oscura profunda
        "brand-bg": "#f8fafc",   // Nuevo fondo claro/frío
        "brand-surface": "#ffffff", // Superficie blanca pura
        "brand-primary": "#4f46e5", // Indigo más vibrante
        "brand-secondary": "#d946ef", // Fuchsia vibrante para gradientes
        "brand-accent": "#0ea5e9", // Sky blue para acentos
        "brand-success": "#10b981", 
        "brand-warning": "#f59e0b",
        "brand-danger": "#ef4444",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
