// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { ServicesGrid } from './components/sections/ServicesGrid';
import { CasesSlider } from './components/sections/CasesSlider';
import { Careers } from './components/sections/Careers';
import { ContactForm } from './components/sections/ContactForm';
import { Partners } from './components/sections/Partners';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Licenses } from './components/sections/Licenses';
import { Breadcrumbs } from './components/Breadcrumbs';

function App() {
  return (
    // basename для корня домена
    <Router basename="/">
      <div className="min-h-screen bg-white">
        <Header />
        <Breadcrumbs />
        <main>
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <About />
                <ServicesGrid />
                <CasesSlider />
                <Careers />
                <Licenses />
                <Partners />
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