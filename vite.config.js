// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Так как сайт теперь по адресу https://ПТБ-М.РФ/ (в корне), base должен быть '/'
  base: '/',
  plugins: [react()]
})