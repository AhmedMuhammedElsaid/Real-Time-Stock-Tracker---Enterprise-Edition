import type { StockListItem, HistoricalDataResponse } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || `${window.location.origin}/api`;

export async function fetchStockList(): Promise<StockListItem[]> {
  const response = await fetch(`${API_BASE_URL}/stocks`);
  if (!response.ok) {
    throw new Error(`Failed to fetch stocks: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchStockHistory(symbol: string): Promise<HistoricalDataResponse[]> {
  const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/history`);
  if (!response.ok) {
    throw new Error(`Failed to fetch history for ${symbol}: ${response.statusText}`);
  }
  return response.json();
}
