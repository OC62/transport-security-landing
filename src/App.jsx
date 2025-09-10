import { lazy, Suspense } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Breadcrumbs from './components/Breadcrumbs';
import ErrorBoundary from './components/ErrorBoundary';

// Ленивая загрузка компонентов
const Hero = lazy(() => import('./components/sections/Hero'));
const About = lazy(() => import('./components/sections/About'));
const ServicesGrid = lazy(() => import('./components/sections/ServicesGrid'));
const CasesSlider = lazy(() => import('./components/sections/CasesSlider'));
const Careers = lazy(() => import('./components/sections/Careers'));
const Licenses = lazy(() => import('./components/sections/Licenses'));
const Partners = lazy(() => import('./components/sections/Partners'));
const CommunitySupport = lazy(
  () => import('./components/sections/CommunitySupport')
);
const ContactForm = lazy(() => import('./components/sections/ContactForm'));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        <Header />
        <Breadcrumbs />
        <main>
          <Suspense fallback={<LoadingSpinner />}>
            <Hero />
            <About />
            <ServicesGrid />
            <CasesSlider />
            <Careers />
            <Licenses />
            <Partners />
            <CommunitySupport />
            <ContactForm />
          </Suspense>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
