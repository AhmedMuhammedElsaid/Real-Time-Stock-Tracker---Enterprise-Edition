import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useStockContext } from '../../../providers/StockProvider';
import { fetchStockList } from '../../../api/api';
import { StockCard } from './StockCard';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '../../../components/common/Skeleton';
import { useVirtualGrid } from '../../../hooks/useVirtualGrid';
import '../styles/StockList.css';
import ReloadButton from '../../../components/common/ReloadButton/ReloadButton';

export const StockList: React.FC = () => {
  const { stocks, setInitialStocks, subscribe } = useStockContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const stockArray = useMemo(() => Object.values(stocks), [stocks]);

  const { containerRef, visibleItems, totalHeight } = useVirtualGrid({
    itemCount: stockArray.length,
    itemMinWidth: 280,
    itemHeight: 110,
    gap: 24,
    buffer: 4
  });

  const initialLoadRef = useRef(false);
  const loadStocks = useCallback(async () => {
    if (initialLoadRef.current) return;
    
    const hasStocks = Object.keys(stocks).length > 0;
    
    // We only need to set these if it's a re-load/retry after error
    // Initial values are already correct
    if (error) setError(null);
    if (!hasStocks && !loading) setLoading(true);

    try {
      const list = await fetchStockList();
      setInitialStocks(list);
      subscribe(list.map(s => s.symbol));
      setLoading(false);
      initialLoadRef.current = true;
    } catch {
      if (!hasStocks) {
        setError('Failed to load stocks. Please ensure backend is running.');
        setLoading(false);
      }
    }
  }, [setInitialStocks, subscribe, stocks, error, loading]);

  useEffect(() => {
    loadStocks();
  }, [loadStocks]); // Include loadStocks in dependencies


  const handleStockClick = (symbol: string) => navigate(`/stocks/${symbol}`);


  if (loading) {
    return (
      <div className="stock-grid-static">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="stock-card skeleton-card">
            <div className="stock-info">
              <Skeleton width="60px" height="24px" />
              <Skeleton width="120px" height="16px" />
            </div>
            <Skeleton width="80px" height="32px" />
          </div>
        ))}
      </div>
    );
  }

  if (error) return <div className="error">
    <p>{error}</p>
    <ReloadButton onClick={loadStocks} label="Retry" />
  </div>;

  return (
    <div className="stock-grid" ref={containerRef} style={{ height: totalHeight }}>
      {visibleItems.map(({ index, style }) => {
        const stock = stockArray[index];
        return (
          <div key={stock.symbol} className="virtual-item" style={style}>
            <StockCard
              stock={stock}
              onClick={handleStockClick}
            />
          </div>
        );
      })}
    </div>
  );
};
