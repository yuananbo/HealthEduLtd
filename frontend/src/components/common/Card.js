/**
 * Reusable Card Component
 */

import React from 'react';
import './Card.css';

const Card = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`card ${className}`.trim()} 
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`card-header ${className}`.trim()}>
    {children}
  </div>
);

const CardBody = ({ children, className = '' }) => (
  <div className={`card-body ${className}`.trim()}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`.trim()}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
