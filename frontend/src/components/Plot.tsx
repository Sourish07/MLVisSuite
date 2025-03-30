import { useRef, useEffect } from 'react'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
  ScatterController,
  LineController,
} from 'chart.js'
import { Chart } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  LinearScale, // For x and y axes
  PointElement, // For scatter points
  LineElement, // For lines (regression, boundary)
  Tooltip, // For hover information
  Legend, // To show labels for datasets
  CategoryScale, // Needed for scatter/line plots
  ScatterController, // Register scatter controller
  LineController // Register line controller
)

interface Point {
  x: number
  y: number
  label?: number
  cluster?: number
}

interface PlotProps {
  points: Point[]
  linePoints?: Point[]
  boundaryPoints?: Point[]
  centroids?: Point[]
  onPointAdd: (x: number, y: number, label?: number) => void
  showLabels?: boolean
  showClusters?: boolean
}

const Plot = ({
  points,
  linePoints = [],
  boundaryPoints = [],
  centroids = [],
  onPointAdd,
  showLabels = false,
  showClusters = false,
}: PlotProps) => {
  const chartRef = useRef<ChartJS>(null)

  const handleChartClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const chart = chartRef.current
    if (!chart) return

    const canvasRect = event.currentTarget.getBoundingClientRect()
    const clickX = event.clientX - canvasRect.left
    const clickY = event.clientY - canvasRect.top

    const xValue = chart.scales.x.getValueForPixel(clickX)
    const yValue = chart.scales.y.getValueForPixel(clickY)

    if (xValue !== undefined && yValue !== undefined) {
      onPointAdd(xValue, yValue, 0) // Default label 0, will be overridden by parent for logistic
    }
  }

  // Prepare datasets based on the mode
  const datasets: any[] = []
  const legendDisplay = showLabels || showClusters

  // Color palette
  const colors = ['blue', 'red', 'green', 'purple', 'orange', 'cyan', 'magenta', 'yellow']
  const labelColors: { [key: number]: string } = { 0: 'blue', 1: 'red' }

  // Base scatter data for all points (used if not showing labels or clusters)
  if (!showLabels && !showClusters) {
    datasets.push({
      type: 'scatter',
      label: 'Data Points',
      data: points.map((p) => ({ x: p.x, y: p.y })),
      backgroundColor: 'blue',
      pointRadius: 5,
    })
  }

  // Linear Regression Line
  if (linePoints.length > 0 && !showLabels && !showClusters) {
    datasets.push({
      type: 'line',
      label: 'Regression Line',
      data: linePoints.map((p) => ({ x: p.x, y: p.y })),
      borderColor: 'red',
      backgroundColor: 'red',
      borderWidth: 2,
      pointRadius: 0, // Don't show points on the line
      fill: false,
      tension: 0.1, // Slight curve for polynomial
      showLine: true,
    })
  }

  // Logistic Regression Points & Boundary
  if (showLabels) {
    const pointsByLabel: Record<number, Point[]> = {}
    points.forEach((point) => {
      const label = point.label !== undefined ? point.label : 0
      if (!pointsByLabel[label]) pointsByLabel[label] = []
      pointsByLabel[label].push(point)
    })

    Object.entries(pointsByLabel).forEach(([label, labelPoints]) => {
      const labelNum = parseInt(label)
      datasets.push({
        type: 'scatter',
        label: `Class ${labelNum}`,
        data: labelPoints.map((p) => ({ x: p.x, y: p.y })),
        backgroundColor: labelColors[labelNum] || 'gray',
        pointRadius: 5,
      })
    })

    if (boundaryPoints.length > 0) {
      // Sort boundary points by x for a smooth line
      const sortedBoundary = [...boundaryPoints].sort((a, b) => a.x - b.x)
      datasets.push({
        type: 'line',
        label: 'Decision Boundary',
        data: sortedBoundary.map((p) => ({ x: p.x, y: p.y })),
        borderColor: 'green',
        backgroundColor: 'green',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.1, 
        showLine: true,
      })
    }
  }

  // K-Means Points & Centroids
  if (showClusters) {
    const pointsByCluster: Record<number, Point[]> = {}
    points.forEach((point) => {
      const cluster = point.cluster !== undefined ? point.cluster : 0
      if (!pointsByCluster[cluster]) pointsByCluster[cluster] = []
      pointsByCluster[cluster].push(point)
    })

    Object.entries(pointsByCluster).forEach(([cluster, clusterPoints]) => {
      const clusterIndex = parseInt(cluster)
      datasets.push({
        type: 'scatter',
        label: `Cluster ${clusterIndex}`,
        data: clusterPoints.map((p) => ({ x: p.x, y: p.y })),
        backgroundColor: colors[clusterIndex % colors.length],
        pointRadius: 5,
      })
    })

    if (centroids.length > 0) {
      datasets.push({
        type: 'scatter',
        label: 'Centroids',
        data: centroids.map((c) => ({ x: c.x, y: c.y })),
        backgroundColor: centroids.map((c) => colors[(c.cluster ?? 0) % colors.length]),
        pointRadius: 8,
        pointStyle: 'crossRot',
        borderColor: 'black',
        borderWidth: 2,
      })
    }
  }

  const chartData = { datasets }

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    // onClick handled by the canvas wrapper
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'X',
        },
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'Y',
        },
      },
    },
    plugins: {
      legend: {
        display: legendDisplay,
      },
      tooltip: {
        enabled: true,
      },
    },
  }

  return (
    <div className="plot-container relative w-full h-[500px]">
      <Chart
        ref={chartRef}
        type='scatter' // Base type, datasets can override
        data={chartData}
        options={options}
        onClick={handleChartClick} 
      />
    </div>
  )
}

export default Plot 