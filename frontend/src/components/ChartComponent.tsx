import React, { useRef, useEffect, useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  ScatterController,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { Point } from '../types'; // We'll create this type file next

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ScatterController,
  Title,
  Tooltip,
  Legend
);

export interface DataSeries {
  label: string;
  data: Point[];
  backgroundColor?: string;
  borderColor?: string;
  pointRadius?: number;
  showLine?: boolean;
  fill?: boolean;
}

export interface ChartComponentProps {
  dataSeries: DataSeries[];
  onPointClick?: (x: number, y: number) => void;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  title?: string;
}

const ChartComponent: React.FC<ChartComponentProps> = ({
  dataSeries,
  onPointClick,
  xMin = -10,
  xMax = 10,
  yMin = -10,
  yMax = 10,
  title = '',
}) => {
  const chartRef = useRef<ChartJS<'scatter'>>(null);
  
  // Format data for Chart.js
  const chartData: ChartData<'scatter'> = {
    datasets: dataSeries.map(series => ({
      label: series.label,
      data: series.data.map(point => ({ x: point.x, y: point.y })),
      backgroundColor: series.backgroundColor || 'rgba(75, 192, 192, 0.6)',
      borderColor: series.borderColor || 'rgba(75, 192, 192, 1)',
      pointRadius: series.pointRadius || 5,
      showLine: series.showLine || false,
      fill: series.fill || false,
    })),
  };

  // Chart options
  const chartOptions: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        min: xMin,
        max: xMax,
        grid: {
          color: 'rgba(200, 200, 200, 0.3)',
        },
        title: {
          display: true,
          text: 'X',
        },
      },
      y: {
        min: yMin,
        max: yMax,
        grid: {
          color: 'rgba(200, 200, 200, 0.3)',
        },
        title: {
          display: true,
          text: 'Y',
        },
      },
    },
    plugins: {
      title: {
        display: !!title,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `(${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(2)})`;
          }
        }
      },
      legend: {
        display: dataSeries.length > 1, // Only show legend if multiple series
      },
    },
    animation: {
      duration: 0, // Disable animations for better performance
    },
  };

  // Handle clicks on the chart
  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onPointClick || !chartRef.current) return;

    const chart = chartRef.current;
    const rect = chart.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Get the point in data coordinates
    const xScale = chart.scales.x;
    const yScale = chart.scales.y;

    if (!xScale || !yScale) return;

    // Convert click coordinates to chart data values
    const dataX = xScale.getValueForPixel(x);
    const dataY = yScale.getValueForPixel(y);

    if (dataX !== undefined && dataY !== undefined) {
      console.log(`[ChartComponent] Click mapped to data: (${dataX.toFixed(2)}, ${dataY.toFixed(2)})`);
      onPointClick(dataX, dataY);
    }
  };

  return (
    <div className="w-full h-[500px] border border-gray-300 dark:border-gray-700 rounded shadow-inner bg-white dark:bg-gray-800 p-4">
      <Scatter
        ref={chartRef}
        data={chartData}
        options={chartOptions}
        onClick={handleClick}
      />
    </div>
  );
};

export default ChartComponent;
