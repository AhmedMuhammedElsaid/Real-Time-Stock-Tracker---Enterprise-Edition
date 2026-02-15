import type { TooltipProps } from 'recharts';
import type { CustomChartData } from '../../../types';

// Recharts doesn't always expose internal types reliably across versions via deep imports.
// Defining them here for maximum compatibility with Vite's import analysis.
type ValueType = number | string | Array<number | string>;
type NameType = number | string;
const CustomTooltip = (props: TooltipProps<ValueType, NameType>) => {
  // @ts-ignore
  const { active, payload } = props;
  if (active && payload && payload.length) {
    const data = payload[0].payload as CustomChartData;
    const value = payload[0].value;

    return (
      <div className="custom-tooltip">
        <p className="tooltip-time">
          {data.displayTime}
        </p>
        <p className="tooltip-price">
          ${typeof value === 'number'
            ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : value}
        </p>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
