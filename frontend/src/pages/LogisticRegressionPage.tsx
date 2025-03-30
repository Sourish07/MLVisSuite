import { useState } from 'react'
import Plot from '../components/Plot'
import api, { LabeledPoint, LogisticRegressionResponse, Point } from '../utils/apiClient'

const LogisticRegressionPage = () => {
  // State
  const [points, setPoints] = useState<LabeledPoint[]>([])
  const [boundaryPoints, setBoundaryPoints] = useState<Point[]>([])
  const [degree, setDegree] = useState<number>(1)
  const [learningRate, setLearningRate] = useState<number>(0.1)
  const [iterations, setIterations] = useState<number>(1000)
  const [currentLabel, setCurrentLabel] = useState<number>(0)
  const [result, setResult] = useState<Partial<LogisticRegressionResponse> | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Handler to add a point when clicking on the plot
  const handlePointAdd = (x: number, y: number) => {
    const newPoint: LabeledPoint = { x, y, label: currentLabel }
    setPoints([...points, newPoint])
    // Clear results when new points are added
    setBoundaryPoints([])
    setResult(null)
  }

  // Handler to run logistic regression
  const handleRunLogisticRegression = async () => {
    // We need at least 2 points with different labels
    const labels = new Set(points.map(p => p.label))
    
    if (points.length < 2 || labels.size < 2) {
      setError('Please add at least 1 point from each class (blue and red)')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.logisticRegression.compute({
        points,
        degree,
        learning_rate: learningRate,
        iterations,
      })

      setResult(response.data)
      setBoundaryPoints(response.data.boundary_points)
    } catch (err: any) {
      setError(err.message || 'An error occurred while computing logistic regression')
    } finally {
      setIsLoading(false)
    }
  }

  // Handler to clear the plot
  const handleClearPlot = () => {
    setPoints([])
    setBoundaryPoints([])
    setResult(null)
    setError(null)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Logistic Regression Visualization</h1>
        <p className="mt-2 text-gray-600">
          Click on the plot to add data points for binary classification, then run Logistic Regression to find the decision boundary
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md h-min">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Class Label
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentLabel(0)}
                  className={`flex-1 py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    currentLabel === 0
                      ? 'bg-blue-600 text-white focus:ring-blue-500'
                      : 'bg-gray-200 text-gray-800 focus:ring-gray-400'
                  }`}
                >
                  Class 0 (Blue)
                </button>
                <button
                  onClick={() => setCurrentLabel(1)}
                  className={`flex-1 py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    currentLabel === 1
                      ? 'bg-red-600 text-white focus:ring-red-500'
                      : 'bg-gray-200 text-gray-800 focus:ring-gray-400'
                  }`}
                >
                  Class 1 (Red)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Polynomial Degree
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={degree}
                onChange={(e) => setDegree(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
              <div className="mt-1 text-center font-medium">
                {degree}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Learning Rate
              </label>
              <select
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="0.001">0.001 (Very Slow)</option>
                <option value="0.01">0.01 (Slow)</option>
                <option value="0.1">0.1 (Recommended)</option>
                <option value="0.5">0.5 (Fast)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Iterations
              </label>
              <input
                type="number"
                min="100"
                max="10000"
                step="100"
                value={iterations}
                onChange={(e) => setIterations(parseInt(e.target.value))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="pt-4 space-y-2">
              <button
                onClick={handleRunLogisticRegression}
                disabled={isLoading || points.length < 2}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
              >
                {isLoading ? 'Computing...' : 'Run Logistic Regression'}
              </button>
              
              <button
                onClick={handleClearPlot}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Clear Plot
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Data Points: {points.length}</h3>
            <div className="flex justify-between text-xs mb-2">
              <span>Class 0 (Blue): {points.filter(p => p.label === 0).length}</span>
              <span>Class 1 (Red): {points.filter(p => p.label === 1).length}</span>
            </div>
            {points.length > 0 && (
              <div className="max-h-40 overflow-y-auto text-xs">
                {points.map((point, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-gray-100">
                    <span>Point {i+1}:</span>
                    <span>({point.x.toFixed(2)}, {point.y.toFixed(2)}) - Class {point.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Plot and Results */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <Plot 
              points={points} 
              boundaryPoints={boundaryPoints} 
              onPointAdd={handlePointAdd}
              showLabels={true}
            />
          </div>

          {result && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Results</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Cost (Log Loss)</h3>
                  <p className="text-lg">{result.cost?.toExponential(4)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Iterations Run</h3>
                  <p className="text-lg">{result.iterations_run}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Converged</h3>
                  <p className="text-lg">{result.converged ? 'Yes' : 'No'}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700">Polynomial Degree</h3>
                  <p className="text-lg">{degree}</p>
                </div>
              </div>

              {result.coefficients && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Model Coefficients</h3>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono overflow-x-auto">
                    {result.coefficients.map((coef, i) => (
                      <div key={i}>
                        {i === 0 ? 'Intercept' : `Feature ${i}`}: {coef.toExponential(4)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LogisticRegressionPage 