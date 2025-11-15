import React, { useState, useEffect, useRef, useMemo } from 'react';
import { throttle } from '../../utils/performanceUtils';

const VirtualList = ({ 
  items, 
  itemHeight, 
  containerHeight, 
  renderItem, 
  overscan = 5,
  className = '',
  onScroll 
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2);
    
    return { startIndex, endIndex, visibleCount };
  }, [scrollTop, containerHeight, itemHeight, items.length, overscan]);

  // Throttled scroll handler
  const handleScroll = useMemo(
    () => throttle((e) => {
      const newScrollTop = e.target.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);
    }, 16), // ~60fps
    [onScroll]
  );

  // Visible items
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute',
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        width: '100%',
        left: 0
      }
    }));
  }, [items, visibleRange, itemHeight]);

  // Total height for scrollbar
  const totalHeight = items.length * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Spacer for total height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items */}
        {visibleItems.map(({ item, index, style }) => (
          <div key={index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualList;