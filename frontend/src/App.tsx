
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import StockProvider from './providers/StockProvider';
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary';
import Loading from './components/common/Loading/Loading';

const Dashboard = lazy(() => import('./features/dashboard/pages/Dashboard'));
const StockDetail = lazy(() => import('./features/stocks/pages/StockDetail'));

function App() {
  return (
    <ErrorBoundary name="AppRoot">
      <HelmetProvider>
        <StockProvider>
          <BrowserRouter>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/stocks/:symbol" element={<StockDetail />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </StockProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
