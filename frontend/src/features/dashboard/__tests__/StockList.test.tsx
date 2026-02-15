import { render, waitFor } from '@testing-library/react';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { StockList } from '../components/StockList';
import { useStockContext } from '../../../providers/StockProvider';
import { BrowserRouter } from 'react-router-dom';
import * as api from '../../../api/api';

// Mock the context hook
vi.mock('../../../providers/StockProvider', () => ({
  useStockContext: vi.fn()
}));

// Mock the API service
vi.mock('../../../api/api', () => ({
  fetchStockList: vi.fn()
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../hooks/useVirtualGrid', () => ({
  useVirtualGrid: vi.fn((config) => ({
    containerRef: () => {},
    visibleItems: Array.from({ length: config.itemCount }).map((_, i) => ({
      index: i,
      style: {}
    })),
    totalHeight: config.itemCount * config.itemHeight
  }))
}));

describe('StockList Component', () => {
  const mockStocks = {
    'AAPL': { symbol: 'AAPL', name: 'Apple Inc', price: 150.00 },
    'GOOGL': { symbol: 'GOOGL', name: 'Alphabet Inc', price: 2800.00 }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (api.fetchStockList as any).mockResolvedValue([]);
  });

  it('renders loading skeleton initially when no stocks', async () => {
    (useStockContext as any).mockReturnValue({
      stocks: {},
      setInitialStocks: vi.fn(),
      subscribe: vi.fn()
    });

    const { container } = render(
      <BrowserRouter>
        <StockList />
      </BrowserRouter>
    );

    expect(container.querySelector('.skeleton-card')).toBeInTheDocument();
  });

  it('renders stock cards when stocks are available', async () => {
    (useStockContext as any).mockReturnValue({
      stocks: mockStocks,
      setInitialStocks: vi.fn(),
      subscribe: vi.fn()
    });

    const { getByText } = render(
      <BrowserRouter>
        <StockList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(getByText('AAPL')).toBeInTheDocument();
    });

    expect(getByText('Apple Inc')).toBeInTheDocument();
    expect(getByText('GOOGL')).toBeInTheDocument();
  });
});
