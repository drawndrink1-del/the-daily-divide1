import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { fontFamily: { sans: ['var(--font-sans)'], mono: ['var(--font-mono)'] }, colors: { amberline: '#f59e0b', indigoelectric: '#818cf8' } } }, plugins: [] };
export default config;
