// components/home/Testimonials.jsx
import { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Star, FormatQuote } from '@mui/icons-material';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
// Import required modules
import { Pagination, Autoplay } from 'swiper/modules';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'John Mbwambo',
      role: 'Regular Commuter',
      rating: 5,
      content: 'Daladala Smart has revolutionized my daily commute. I no longer waste time waiting for daladalas and can plan my journey better.',
      image: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 2,
      name: 'Maria Sanga',
      role: 'Student',
      rating: 4,
      content: 'As a student, I love that I can track when my daladala will arrive. The fare payment option also makes it very convenient.',
      image: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 3,
      name: 'Emmanuel Joseph',
      role: 'Business Owner',
      rating: 5,
      content: 'This app is a game-changer for public transport in Dar es Salaam. No more uncertainty about when my transport will arrive.',
      image: 'https://randomuser.me/api/portraits/men/62.jpg'
    },
    {
      id: 4,
      name: 'Grace Mwakasege',
      role: 'Teacher',
      rating: 5,
      content: `I'm always punctual for my classes now thanks to Daladala Smart. The real-time tracking is extremely accurate.`,
      image: 'https://randomuser.me/api/portraits/women/68.jpg'
    }
  ];

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={i < rating ? 'text-warning' : 'text-muted'} 
          fontSize="small"
        />
      );
    }
    return stars;
  };

  return (
    <section className="testimonials py-5">
      <Container>
        <div className="text-center mb-5">
          <h2 className="section-title mb-3">What Our Users Say</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '700px' }}>
            Hear from real people who use Daladala Smart for their daily commutes.
          </p>
        </div>

        <Swiper
          slidesPerView={1}
          spaceBetween={30}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          modules={[Pagination, Autoplay]}
          className="testimonial-swiper"
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
              <Card className="testimonial-card h-100 border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="quote-icon mb-3">
                    <FormatQuote className="text-primary" style={{ fontSize: 40 }} />
                  </div>
                  
                  <div className="mb-3">
                    {renderStars(testimonial.rating)}
                  </div>
                  
                  <Card.Text className="testimonial-content mb-4">
                    "{testimonial.content}"
                  </Card.Text>
                  
                  <div className="d-flex align-items-center">
                    <div className="testimonial-avatar me-3">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="rounded-circle"
                        width="50"
                        height="50"
                      />
                    </div>
                    <div>
                      <h5 className="mb-0 testimonial-name">{testimonial.name}</h5>
                      <p className="text-muted mb-0 testimonial-role">{testimonial.role}</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </Container>
      
      <style jsx>{`
        .testimonial-card {
          border-radius: 12px;
          transition: transform 0.3s ease;
        }
        
        .testimonial-card:hover {
          transform: translateY(-5px);
        }
        
        .testimonial-content {
          min-height: 120px;
        }
        
        .testimonial-name {
          font-size: 1rem;
        }
        
        .testimonial-role {
          font-size: 0.875rem;
        }
        
        .testimonial-swiper {
          padding-bottom: 50px;
        }
        
        .quote-icon {
          height: 40px;
        }
      `}</style>
    </section>
  );
};

export default Testimonials;