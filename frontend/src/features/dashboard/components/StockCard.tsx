import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Stock } from '../../../types';
import '../styles/StockCard.css';
import classNames from 'classnames';

interface StockCardProps {
  stock: Stock;
  onClick: (symbol: string) => void;
}

export const StockCard: React.FC<StockCardProps> = React.memo(({ stock, onClick }) => {
  const prevPrice = useRef(stock.price);
  const [flashClass, setFlashClass] = useState('');

  useEffect(() => {
    if (stock.price > prevPrice.current) {
      setFlashClass('flash-up');
    } else if (stock.price < prevPrice.current) {
      setFlashClass('flash-down');
    }

    const timer = setTimeout(() => {
      setFlashClass('');
    }, 1000);

    prevPrice.current = stock.price;

    return () => clearTimeout(timer);
  }, [stock.price,]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onClick(stock.symbol);
    }
  }, [stock.symbol, onClick])

  const handleOnClick = useCallback(() => {
    onClick(stock.symbol);
  }, [stock.symbol, onClick])

  return (
    <button
      className={classNames('stock-card', flashClass)}
      onClick={handleOnClick}
      onKeyDown={handleKeyDown}
    >
      <div className="stock-info">
        <div className="stock-symbol">{stock.symbol}</div>
        <div className="stock-name">{stock.name}</div>
      </div>
      <p aria-live="polite" className="stock-price">
        ${stock.price.toFixed(2)}
      </p>
    </button>
  );
});
