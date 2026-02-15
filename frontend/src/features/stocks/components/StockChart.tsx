import React, { useEffect, useState, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useStockContext } from '../../../providers/StockProvider';
import { fetchStockHistory } from '../../../api/api';
import ErrorBoundary  from '../../../components/common/ErrorBoundary/ErrorBoundary';
import { getTime } from '../../../utils/utils';
import { Skeleton } from '../../../components/common/Skeleton';
import Fallback from '../../../components/common/Fallback/Fallback';
import { type CustomChartData } from '../../../types';
import CustomTooltip from './CustomTooltip';
import '../styles/StockChart.css';

interface StockChartProps {
  symbol: string;
}



export const StockChart: React.FC<StockChartProps> = ({ symbol }) => {
  const { stocks } = useStockContext();
  const [history, setHistory] = useState<CustomChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const stock = stocks[symbol];
  const currentPrice = stock?.price;
  const lastUpdated = stock?.lastUpdated;

  useEffect(() => {
    fetchStockHistory(symbol).then(data => {
      const formatted = data.map(d => {
        const date = new Date(d.timestamp);
        return {
          time: getTime(date),
          displayTime: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: d.price
        };
      });
      setHistory(formatted);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [symbol]);

  const chartData = useMemo(() => {
    if (!currentPrice || history.length === 0) return history;

    // Use server timestamp if available, otherwise fallback to local
    const now = lastUpdated ? new Date(lastUpdated) : new Date();
    const currentMinuteTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()).getTime();

    const lastHistoryPoint = history[history.length - 1];

    const livePoint: CustomChartData = {
      time: currentMinuteTime,
      displayTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: currentPrice
    };

    if (lastHistoryPoint && lastHistoryPoint.time === currentMinuteTime) {
      return [...history.slice(0, -1), livePoint];
    } else if (lastHistoryPoint && currentMinuteTime > lastHistoryPoint.time) {
      return [...history, livePoint];
    }

    return history;
  }, [history, currentPrice, lastUpdated]);

  if (loading) {
    return (
      <div className="chart-loading-container">
        <Skeleton width="100%" height="100%" borderRadius="12px" />
      </div>
    );
  }

  return (
    <div className="chart-outer-container">
      <ErrorBoundary
        name="StockChart"
        fallback={<Fallback/>}
      >
        <ResponsiveContainer minWidth={0} minHeight={0}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="displayTime"
              minTickGap={60}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              domain={['auto', 'auto']}
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }}
              tickFormatter={(val) => `$${val.toFixed(0)}`}
            />
            <Tooltip content={CustomTooltip} cursor={{ stroke: 'var(--primary)', strokeWidth: 2 }} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="var(--primary)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorPrice)"
              isAnimationActive={true}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ErrorBoundary>
    </div>
  );
};
