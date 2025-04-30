// components/home/HowItWorks.jsx (continued)
import { Container, Row, Col } from 'react-bootstrap';
import { Search, DirectionsBus, Payment, StarBorder } from '@mui/icons-material';

const HowItWorks = () => {
  const steps = [
    {
      icon: <Search style={{ fontSize: 40 }} />,
      title: 'Find Your Route',
      description: 'Search for routes by entering your pickup location and destination.'
    },
    {
      icon: <DirectionsBus style={{ fontSize: 40 }} />,
      title: 'Book Your Trip',
      description: 'Select from available trips and book your seat in advance.'
    },
    {
      icon: <Payment style={{ fontSize: 40 }} />,
      title: 'Easy Payment',
      description: 'Pay securely using mobile money, card, or cash.'
    },
    {
      icon: <StarBorder style={{ fontSize: 40 }} />,
      title: 'Rate Your Experience',
      description: 'Help improve the service by rating your journey.'
    }
  ];

  return (
    <section className="how-it-works py-5">
      <Container>
        <div className="text-center mb-5">
          <h2 className="section-title mb-3">How It Works</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '700px' }}>
            Get started with Daladala Smart in just a few simple steps. Our platform makes booking and tracking daladala trips easier than ever.
          </p>
        </div>

        <Row className="g-4">
          {steps.map((step, index) => (
            <Col key={index} md={6} lg={3}>
              <div className="step-card text-center">
                <div className="step-icon-wrapper mb-4">
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-number">{index + 1}</div>
                </div>
                <h3 className="h5 mb-3">{step.title}</h3>
                <p className="text-muted">{step.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
      
      <style jsx>{`
        .step-card {
          padding: 2rem;
          height: 100%;
        }
        
        .step-icon-wrapper {
          position: relative;
          display: inline-block;
        }
        
        .step-icon {
          width: 80px;
          height: 80px;
          background-color: var(--primary-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto;
          transition: transform 0.3s ease;
        }
        
        .step-card:hover .step-icon {
          transform: translateY(-8px);
        }
        
        .step-number {
          position: absolute;
          top: -10px;
          right: -10px;
          width: 30px;
          height: 30px;
          background-color: var(--secondary-color);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
      `}</style>
    </section>
  );
};

export default HowItWorks;