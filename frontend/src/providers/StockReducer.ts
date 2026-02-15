import type { ConnectionStatus, Stock, PriceUpdate } from '../types';

export interface StockState {
  stocks: Record<string, Stock>;
  connectionStatus: ConnectionStatus;
}

export type Action = 
  | { type: 'UPDATE_PRICE'; payload: PriceUpdate }
  | { type: 'SET_STOCKS'; payload: Stock[] }
  | { type: 'SET_CONNECTION_STATUS'; payload: ConnectionStatus };

export const initialState: StockState = {
  stocks: {},
  connectionStatus: 'disconnected',
};

export function stockReducer(state: StockState, action: Action): StockState {
  switch (action.type) {
    case 'UPDATE_PRICE': {
      const { symbol, price, timestamp } = action.payload;
      const currentStock = state.stocks[symbol];
      if (!currentStock) return state;

      return {
        ...state,
        stocks: {
          ...state.stocks,
          [symbol]: { ...currentStock, price, lastUpdated: timestamp },
        },
      };
    }
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };
    case 'SET_STOCKS': {
      const newStocks = action.payload.reduce((acc, stock) => {
        const existingStock = state.stocks[stock.symbol];
        acc[stock.symbol] = {
          ...stock,
          price: (stock.price === 0 && existingStock?.price !== undefined) ? existingStock.price : stock.price,
          lastUpdated: existingStock?.lastUpdated || stock.lastUpdated,
        };
        return acc;
      }, {} as Record<string, Stock>);
      return { ...state, stocks: { ...state.stocks, ...newStocks } };
    }
    default:
      return state;
  }
}
