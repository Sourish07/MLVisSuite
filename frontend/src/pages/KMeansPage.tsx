import { useState } from 'react'
import Plot from '../components/Plot'
import api, { Point, Centroid, ClusteredPoint } from '../utils/apiClient'

const KMeansPage = () => {
  // State
  const [points, setPoints] = useState<Point[]>([])
  const [clusteredPoints, setClusteredPoints] = useState<ClusteredPoint[]>([])
  const [centroids, setCentroids] = useState<Centroid[]>([])
  const [k, setK] = useState<number>(3)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const [isConverged, setIsConverged] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Handler to add a point when clicking on the plot
  const handlePointAdd = (x: number, y: number) => {
    const newPoint: Point = { x, y }
    setPoints([...points, newPoint])
    // Reset clustering state when adding new points
    setClusteredPoints([])
    setCentroids([])
    setIsInitialized(false)
    setIsConverged(false)
  }

  // Handler to initialize K-means
  const handleInitializeKMeans = async () => {
    if (points.length < k) {
      setError(`Please add at least ${k} points to the plot`)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.kMeans.initialize({
        points,
        k,
      })

      setCentroids(response.data.centroids)
      setClusteredPoints(response.data.assignments)
      setIsInitialized(true)
      setIsConverged(false)
    } catch (err: any) {
      setError(err.message || 'An error occurred while initializing K-means')
    } finally {
      setIsLoading(false)
    }
  }

  // Handler to perform one step (assignment)
  const handleAssignmentStep = async () => {
    if (!isInitialized) {
      setError('Please initialize K-means first')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.kMeans.step({
        points: clusteredPoints,
        centroids,
        step_type: 'assignment',
      })

      setClusteredPoints(response.data.assignments)
      setIsConverged(response.data.converged)
    } catch (err: any) {
      setError(err.message || 'An error occurred during assignment step')
    } finally {
      setIsLoading(false)
    }
  }

  // Handler to perform one step (update)
  const handleUpdateStep = async () => {
    if (!isInitialized) {
      setError('Please initialize K-means first')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.kMeans.step({
        points: clusteredPoints,
        centroids,
        step_type: 'update',
      })

      setCentroids(response.data.centroids)
      setClusteredPoints(response.data.assignments)
      setIsConverged(response.data.converged)
    } catch (err: any) {
      setError(err.message || 'An error occurred during update step')
    } finally {
      setIsLoading(false)
    }
  }

  // Handler to perform a full iteration (assignment + update)
  const handleFullIteration = async () => {
    if (!isInitialized) {
      setError('Please initialize K-means first')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // First assignment step
      const assignResponse = await api.kMeans.step({
        points: clusteredPoints,
        centroids,
        step_type: 'assignment',
      })

      // Then update step
      const updateResponse = await api.kMeans.step({
        points: assignResponse.data.assignments,
        centroids,
        step_type: 'update',
      })

      setCentroids(updateResponse.data.centroids)
      setClusteredPoints(updateResponse.data.assignments)
      setIsConverged(updateResponse.data.converged)
    } catch (err: any) {
      setError(err.message || 'An error occurred during full iteration')
    } finally {
      setIsLoading(false)
    }
  }

  // Handler to run K-means until convergence
  const handleRunUntilConvergence = async () => {
    if (points.length < k) {
      setError(`Please add at least ${k} points to the plot`)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.kMeans.run({
        points,
        k,
      })

      setCentroids(response.data.centroids)
      setClusteredPoints(response.data.assignments)
      setIsInitialized(true)
      setIsConverged(response.data.converged)

      if (response.data.iterations) {
        setIsLoading(false)
        setError(null)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while running K-means')
    } finally {
      setIsLoading(false)
    }
  }

  // Handler to clear the plot
  const handleClearPlot = () => {
    setPoints([])
    setClusteredPoints([])
    setCentroids([])
    setIsInitialized(false)
    setIsConverged(false)
    setError(null)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">K-Means Clustering Visualization</h1>
        <p className="mt-2 text-gray-600">
          Click on the plot to add data points, then visualize the K-Means clustering algorithm step by step
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md h-min">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Clusters (K)
              </label>
              <input
                type="range"
                min="2"
                max="8"
                value={k}
                disabled={isInitialized}
                onChange={(e) => setK(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
                <span>8</span>
              </div>
              <div className="mt-1 text-center font-medium">
                {k}
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <button
                onClick={handleInitializeKMeans}
                disabled={isLoading || points.length < k}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
              >
                {isLoading ? 'Computing...' : isInitialized ? 'Reinitialize Centroids' : 'Initialize Centroids'}
              </button>

              <div className="pt-2 border-t border-gray-200 mt-2">
                <p className="text-sm text-gray-500 mb-2 font-medium">Step-by-Step Execution</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleAssignmentStep}
                    disabled={isLoading || !isInitialized || isConverged}
                    className="bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm disabled:bg-blue-400"
                  >
                    Assignment Step
                  </button>
                  
                  <button
                    onClick={handleUpdateStep}
                    disabled={isLoading || !isInitialized || isConverged}
                    className="bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm disabled:bg-green-400"
                  >
                    Update Step
                  </button>
                </div>
                
                <button
                  onClick={handleFullIteration}
                  disabled={isLoading || !isInitialized || isConverged}
                  className="w-full mt-2 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-sm disabled:bg-purple-400"
                >
                  Full Iteration
                </button>
              </div>
              
              <button
                onClick={handleRunUntilConvergence}
                disabled={isLoading}
                className="w-full mt-4 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm disabled:bg-red-400"
              >
                Run Until Convergence
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
            <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="text-gray-600">Data Points:</div>
              <div className="font-medium">{points.length}</div>
              
              <div className="text-gray-600">Clusters (K):</div>
              <div className="font-medium">{k}</div>
              
              <div className="text-gray-600">Initialized:</div>
              <div className="font-medium">{isInitialized ? 'Yes' : 'No'}</div>
              
              <div className="text-gray-600">Converged:</div>
              <div className="font-medium">{isConverged ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>

        {/* Plot Area */}
        <div className="md:col-span-2">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <Plot 
              points={isInitialized ? clusteredPoints : points} 
              centroids={centroids}
              onPointAdd={handlePointAdd}
              showClusters={isInitialized}
            />
          </div>
          
          {isInitialized && (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
              <p className="text-sm text-gray-600 mb-2">
                {isConverged 
                  ? 'K-Means has converged! The centroids will no longer move significantly.' 
                  : 'Click the step buttons above to see how K-Means iteratively adjusts the clusters.'}
              </p>
              
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {centroids.map((centroid, i) => (
                  <div key={i} className="px-3 py-1 bg-white rounded-full shadow-sm text-xs">
                    Centroid {i}: ({centroid.x.toFixed(2)}, {centroid.y.toFixed(2)})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default KMeansPage 