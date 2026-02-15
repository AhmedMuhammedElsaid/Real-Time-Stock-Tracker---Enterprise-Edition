import React from 'react';
import { Link } from 'react-router-dom';
import { useStockContext } from '../../../providers/StockProvider';
import { Landmark, Activity } from 'lucide-react';

import './Header.css';

export const Header: React.FC = () => {
  const { connectionStatus } = useStockContext();
  const isConnected = connectionStatus === 'connected';

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="header-logo">
          <div className="logo-icon-wrapper">
            <Landmark size={20} />
          </div>
          <span className="logo-text">StockPulse</span>
        </Link>

        <div className={`connection-status ${isConnected ? 'status-connected' : 'status-disconnected'}`}>
          <Activity 
            size={14} 
            color={isConnected ? 'var(--success)' : 'var(--error)'} 
            className={isConnected ? 'pulse-slow' : ''}
          />
          <span className={`status-text ${isConnected ? 'success' : 'error'}`}>
            {isConnected ? 'Market Open' : 'Connecting...'}
          </span>
        </div>
      </div>
    </header>
  );
};
