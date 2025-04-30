// components/common/Button.jsx
import { forwardRef } from 'react';
import { Button as BootstrapButton } from 'react-bootstrap';

const Button = forwardRef(({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "", 
  icon, 
  iconPosition = "start",
  isLoading = false,
  ...props 
}, ref) => {
  return (
    <BootstrapButton
      ref={ref}
      variant={variant}
      size={size}
      className={`custom-btn ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Loading...
        </>
      ) : (
        <>
          {icon && iconPosition === "start" && <span className="me-2">{icon}</span>}
          {children}
          {icon && iconPosition === "end" && <span className="ms-2">{icon}</span>}
        </>
      )}
    </BootstrapButton>
  );
});

Button.displayName = 'Button';

export default Button;