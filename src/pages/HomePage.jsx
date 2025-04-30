// pages/HomePage.jsx
import { Helmet } from 'react-helmet';
import HeroSection from '../components/home/HeroSection';
import QuickSearch from '../components/home/QuickSearch';
import PopularRoutes from '../components/home/PopularRoutes';
import HowItWorks from '../components/home/HowItWorks';
import AppPromotion from '../components/home/AppPromotion';
import Testimonials from '../components/home/Testimonials';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>Daladala Smart | Modern Public Transportation</title>
        <meta 
          name="description" 
          content="Book, track, and pay for your daladala rides easily. Modernizing public transportation in Tanzania." 
        />
      </Helmet>
      
      <HeroSection />
      <QuickSearch />
      <PopularRoutes />
      <HowItWorks />
      <AppPromotion />
      <Testimonials />
    </>
  );
};

export default HomePage;