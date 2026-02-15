import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStockContext } from '../../../providers/StockProvider';
import { StockChart } from '../components/StockChart';
import { Helmet } from 'react-helmet-async';
import { Header } from '../../../components/common/Header/Header';
import './StockDetail.css';

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const { stocks, subscribe, unsubscribe } = useStockContext();
  const stock = symbol ? stocks[symbol] : undefined;

  const pageTitle = stock ? `${stock.name} (${stock.symbol}) | Real-Time Stock Analysis` : 'Stock Analysis';
  const pageDescription = stock
    ? `Live stock price updates and historical charts for ${stock.name} (${stock.symbol}). Analyze market trends and stay informed.`
    : 'Analyze stock market trends with professional real-time charts.';

  useEffect(() => {
    if (symbol) {
      subscribe([symbol]);
      return () => {
        unsubscribe([symbol]);
      };
    }
  }, [symbol, subscribe, unsubscribe]);

  if (!stock) {
    return (
      <>
        <Header />
        <main className="layout-container compact">
          <Helmet>
            <title>Loading Stock Details...</title>
          </Helmet>
          <div className="layout-container">
            <p className="detail-loading">Stock not found or loading...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>

      <Header />

      <main className="layout-container compact">
        <div className="detail-header">
          <Link to="/" className="back-link">← Back to Dashboard</Link>
          <h1>{stock.name} ({stock.symbol})</h1>
          <p className="detail-price">
            Current Price: <span>${stock.price?.toFixed(2)}</span>
          </p>
        </div>

        <div className="chart-container">
          <StockChart symbol={stock.symbol} />
        </div>
      </main>
    </>
  );
};
