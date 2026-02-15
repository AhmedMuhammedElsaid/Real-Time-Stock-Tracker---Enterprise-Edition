import React from 'react';
import './Loading.css';

const Loading: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="spinner" role="status" aria-label="Loading"/>
    </div>
  );
};

export default Loading;
