import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import type { Stock, PriceUpdate } from '../types';
import { stockReducer, initialState, type StockState } from './StockReducer';

interface StockContextType extends StockState {
  subscribe: (symbols: string[]) => void;
  unsubscribe: (symbols: string[]) => void;
  setInitialStocks: (stocks: Stock[]) => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export default function StockProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(stockReducer, initialState);
  const { status, send, registerMessageHandler } = useWebSocket();

  useEffect(() => {
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: status });
  }, [status]);

  useEffect(() => {
    registerMessageHandler((data: unknown) => {
      const update = data as PriceUpdate;
      if (update.symbol && update.price) {
        dispatch({ type: 'UPDATE_PRICE', payload: update });
      }
    });
  }, [registerMessageHandler]);

  const subscribe = useCallback((symbols: string[]) => {
    send({ action: 'subscribe', symbols });
  }, []);

  const unsubscribe = useCallback((symbols: string[]) => {
    send({ action: 'unsubscribe', symbols });
  }, []);

  const setInitialStocks = useCallback((stocks: Stock[]) => {
    dispatch({ type: 'SET_STOCKS', payload: stocks });
  }, []);

  return (
    <StockContext.Provider value={{ ...state, subscribe, unsubscribe, setInitialStocks }}>
      {children}
    </StockContext.Provider>
  );
}

export function useStockContext() {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStockContext must be used within a StockProvider');
  }
  return context;
}
