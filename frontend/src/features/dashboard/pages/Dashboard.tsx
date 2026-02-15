import React from 'react';
import { StockList } from '../components/StockList';
import { Helmet } from 'react-helmet-async';
import { Header } from '../../../components/common/Header/Header';
import '../styles/Dashboard.css';

export const Dashboard: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>StockPulse | Real-Time Market Overview</title>
        <meta name="description" content="Track your favorite stocks with real-time price updates, professional charts, and live market data." />
      </Helmet>
      
      <Header />

      <main className="layout-container">
        <header className="dashboard-header">
          <h1 className="dashboard-title">
            Market Overview
          </h1>
          <p className="dashboard-subtitle">
            Real-time insights into your watched symbols.
          </p>
        </header>
        <StockList />
      </main>
    </>
  );
};

export default Dashboard;
