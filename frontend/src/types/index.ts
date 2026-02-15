export interface Stock {
  symbol: string;
  name: string;
  price: number;
  lastUpdated?: string; 
}

export interface StockListItem {
  symbol: string;
  name: string;
  price: number;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: string; // ISO string from backend
}

export interface ChartDataPoint {
  timestamp: number; // Unix timestamp for easier plotting
  price: number;
}

export interface HistoricalDataResponse {
  timestamp: string;
  price: number;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface CustomChartData {
  time: number;
  displayTime: string;
  price: number;
}

