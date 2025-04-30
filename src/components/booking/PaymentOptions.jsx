// components/booking/PaymentOptions.jsx
import { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { 
  AccountBalanceWallet, 
  CreditCard, 
  MonetizationOn,
  ArrowBack,
  ArrowForward
} from '@mui/icons-material';

const PaymentOptions = ({ 
  onSubmit, 
  onBack, 
  loading, 
  error,
  totalAmount 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!agreed) {
      return;
    }
    
    onSubmit({
      payment_method: paymentMethod,
      payment_details: {
        phone: paymentPhone
      }
    });
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <div className="payment-methods mb-4">
        <h5 className="mb-3">Select Payment Method</h5>
        <div className="payment-options">
          <div 
            className={`payment-option ${paymentMethod === 'mobile_money' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('mobile_money')}
          >
            <div className="option-icon">
              <AccountBalanceWallet className="text-primary" />
            </div>
            <div className="option-details">
              <div className="option-title">Mobile Money</div>
              <div className="option-desc">Pay using M-Pesa, Airtel Money, or Tigo Pesa</div>
            </div>
            <div className="option-radio">
              <Form.Check 
                type="radio" 
                name="paymentMethod" 
                checked={paymentMethod === 'mobile_money'}
                onChange={() => setPaymentMethod('mobile_money')}
              />
            </div>
          </div>
          
          <div 
            className={`payment-option ${paymentMethod === 'cash' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('cash')}
          >
            <div className="option-icon">
              <MonetizationOn className="text-success" />
            </div>
            <div className="option-details">
              <div className="option-title">Cash</div>
              <div className="option-desc">Pay in cash to the driver when boarding</div>
            </div>
            <div className="option-radio">
              <Form.Check 
                type="radio" 
                name="paymentMethod" 
                checked={paymentMethod === 'cash'}
                onChange={() => setPaymentMethod('cash')}
              />
            </div>
          </div>
          
          <div 
            className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('card')}
          >
            <div className="option-icon">
              <CreditCard className="text-info" />
            </div>
            <div className="option-details">
              <div className="option-title">Card Payment</div>
              <div className="option-desc">Pay with your debit or credit card</div>
            </div>
            <div className="option-radio">
              <Form.Check 
                type="radio" 
                name="paymentMethod" 
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
              />
            </div>
          </div>
        </div>
      </div>
      
      {paymentMethod === 'mobile_money' && (
        <div className="mobile-money-form mb-4">
          <h5 className="mb-3">Mobile Money Details</h5>
          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control 
              type="tel" 
              placeholder="Enter mobile money number"
              value={paymentPhone}
              onChange={(e) => setPaymentPhone(e.target.value)}
              required
            />
            <Form.Text className="text-muted">
              Enter the phone number registered with your mobile money account.
            </Form.Text>
          </Form.Group>
        </div>
      )}
      
      {paymentMethod === 'card' && (
        <div className="card-payment-form mb-4">
          <h5 className="mb-3">Card Details</h5>
          <Alert variant="info">
            Card payment functionality is in development. Please use Mobile Money or Cash for now.
          </Alert>
        </div>
      )}
      
      <Form.Group className="mb-4">
        <Form.Check
          type="checkbox"
          id="payment-agreement"
          label={
            <span>
              I agree to the payment terms and conditions
            </span>
          }
          checked={agreed}
          onChange={() => setAgreed(!agreed)}
        />
      </Form.Group>
      
      <div className="d-flex justify-content-between">
        <Button 
          variant="outline-primary" 
          onClick={onBack}
          className="d-flex align-items-center"
          disabled={loading}
        >
          <ArrowBack className="me-2" />
          Back
        </Button>
        
        <Button 
          variant="primary" 
          type="submit" 
          className="d-flex align-items-center"
          disabled={loading || !agreed || (paymentMethod === 'mobile_money' && !paymentPhone)}
        >
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Processing...
            </>
          ) : (
            <>
              Complete Booking
              <ArrowForward className="ms-2" />
            </>
          )}
        </Button>
      </div>
      
      <style jsx>{`
        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .payment-option {
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 15px;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .payment-option:hover {
          border-color: #adb5bd;
        }
        
        .payment-option.active {
          border-color: var(--primary-color);
          background-color: rgba(var(--bs-primary-rgb), 0.05);
        }
        
        .option-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(var(--bs-primary-rgb), 0.1);
          border-radius: 8px;
          margin-right: 12px;
        }
        
        .option-details {
          flex-grow: 1;
        }
        
        .option-title {
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .option-desc {
          font-size: 14px;
          color: #6c757d;
        }
        
        .option-radio {
          flex-shrink: 0;
        }
      `}</style>
    </Form>
  );
};

export default PaymentOptions;