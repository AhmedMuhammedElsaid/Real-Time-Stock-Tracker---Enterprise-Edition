import { describe, it, expect } from 'vitest';
import { initialState, stockReducer, type StockState } from '../StockReducer';

describe('stockReducer', () => {
  it('should handle SET_STOCKS with initial prices', () => {
    const stocks = [{ symbol: 'AAPL', name: 'Apple Inc', price: 150.25 }];
    const action = { type: 'SET_STOCKS' as const, payload: stocks };
    
    const newState = stockReducer(initialState, action);
    
    expect(newState.stocks['AAPL']).toBeDefined();
    expect(newState.stocks['AAPL'].price).toBe(150.25);
  });

  it('should preserve prices when SET_STOCKS is called and stocks already exist', () => {
    const currentState: StockState = {
      ...initialState,
      stocks: {
        'AAPL': { symbol: 'AAPL', name: 'Apple Inc', price: 150.50 }
      }
    };
    
    const stocks = [{ symbol: 'AAPL', name: 'Apple Inc', price: 0 }];
    const action = { type: 'SET_STOCKS' as const, payload: stocks };
    
    const newState = stockReducer(currentState, action);
    
    expect(newState.stocks['AAPL'].price).toBe(150.50);
  });

  it('should update price on UPDATE_PRICE', () => {
    const currentState: StockState = {
      ...initialState,
      stocks: {
        'AAPL': { symbol: 'AAPL', name: 'Apple Inc', price: 150.50 }
      }
    };
    
    const update = { symbol: 'AAPL', price: 151.00, timestamp: '2026-01-27T12:00:00Z' };
    const action = { type: 'UPDATE_PRICE' as const, payload: update };
    
    const newState = stockReducer(currentState, action);
    
    expect(newState.stocks['AAPL'].price).toBe(151.00);
    expect(newState.stocks['AAPL'].lastUpdated).toBe('2026-01-27T12:00:00Z');
  });

  it('should handle SET_CONNECTION_STATUS', () => {
    const action = { type: 'SET_CONNECTION_STATUS' as const, payload: 'connected' as const };
    const newState = stockReducer(initialState, action);
    
    expect(newState.connectionStatus).toBe('connected');
  });
});
