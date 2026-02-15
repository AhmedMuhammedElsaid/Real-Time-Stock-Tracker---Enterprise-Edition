import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

interface VirtualGridConfig {
  itemCount: number;
  itemMinWidth: number;
  itemHeight: number;
  gap: number;
  buffer?: number;
}

export interface VirtualGridResult {
  containerRef: (node: HTMLDivElement | null) => void;
  visibleItems: { index: number; style: React.CSSProperties }[];
  totalHeight: number;
}

export function useVirtualGrid({
  itemCount,
  itemMinWidth,
  itemHeight,
  gap,
  buffer = 2
}: VirtualGridConfig): VirtualGridResult {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const observerRef = useRef<ResizeObserver | null>(null);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (node) {
      setContainer(node);
      setContainerWidth(node.getBoundingClientRect().width);

      const observer = new ResizeObserver((entries) => {
        if (entries[0]) {
          setContainerWidth(entries[0].contentRect.width);
        }
      });

      observer.observe(node);
      observerRef.current = observer;
    } else {
      setContainer(null);
    }
  }, []);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollTop(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const gridMetrics = useMemo(() => {
    if (containerWidth === 0) return { columns: 1, totalHeight: 0 };

    const columns = Math.max(1, Math.floor((containerWidth + gap) / (itemMinWidth + gap)));
    const rows = Math.ceil(itemCount / columns);
    const totalHeight = rows * itemHeight + (rows - 1) * gap;

    return { columns, rows, totalHeight };
  }, [containerWidth, itemCount, itemMinWidth, itemHeight, gap]);

  const visibleItems = useMemo(() => {
    if (containerWidth === 0 || !container) return [];

    const { columns } = gridMetrics;
    const viewportHeight = window.innerHeight;
    
    const containerOffsetTop = container.getBoundingClientRect().top + window.scrollY;
    const relativeScroll = Math.max(0, scrollTop - containerOffsetTop);
    
    const startRow = Math.max(0, Math.floor(relativeScroll / (itemHeight + gap)) - buffer);
    const endRow = Math.min(
      Math.ceil(itemCount / columns),
      Math.ceil((relativeScroll + viewportHeight) / (itemHeight + gap)) + buffer
    );

    const items = [];
    for (let row = startRow; row < endRow; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        if (index >= itemCount) break;

        const columnWidth = (containerWidth - (columns - 1) * gap) / columns;
        
        items.push({
          index,
          style: {
            position: 'absolute' as const,
            top: row * (itemHeight + gap),
            left: col * (columnWidth + gap),
            width: columnWidth,
            height: itemHeight
          }
        });
      }
    }

    return items;
  }, [containerWidth, container, scrollTop, itemCount, itemHeight, gap, buffer, gridMetrics]);

  return {
    containerRef,
    visibleItems,
    totalHeight: gridMetrics.totalHeight
  };
}
