// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { ServicesGrid } from './components/sections/ServicesGrid';
import { CasesSlider } from './components/sections/CasesSlider';
import { ContactForm } from './components/sections/ContactForm';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
// Импортируем новую секцию
import { Licenses } from './components/sections/Licenses';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <About />
                <ServicesGrid />
                <CasesSlider />
                <Licenses /> {/* Добавляем секцию Лицензии и свидетельства */}
                <ContactForm />
              </>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;