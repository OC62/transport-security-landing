import React from 'react'
import ReactDOM from 'react-dom/client' // Убедитесь, что используете react-dom/client
import App from './App.jsx'
import './index.css'
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';

// Современный метод для React 18
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)