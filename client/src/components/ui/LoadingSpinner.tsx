import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-8 h-6',
    md: 'w-16 h-12',
    lg: 'w-24 h-18',
  };

  return (
    <div className={`loading ${sizeMap[size]} ${className}`}>
        <svg width="64px" height="48px">
      <polyline points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24" id="back"></polyline>
    <polyline points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24" id="front"></polyline>
  </svg>
    </div>
  );
};

export default LoadingSpinner;