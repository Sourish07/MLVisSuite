'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ChartComponent, { DataSeries } from '../components/ChartComponent';
import { initializeKMeans, stepKMeans } from '../services/api';
import type { Point, KMeansResponsePayload, KMeansStepRequestPayload } from '../types';

const KMeansPage: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [k, setK] = useState<number>(3);
  const [centroids, setCentroids] = useState<Point[]>([]);
  const [assignments, setAssignments] = useState<{ [key: string]: number }>({});
  const [stepType, setStepType] = useState<'initialize' | 'assign_points' | 'update_centroids' | 'full_iteration' | 'run_to_convergence'>('initialize');
  const [iteration, setIteration] = useState<number>(0);
  const [converged, setConverged] = useState<boolean>(false);
  const [maxIterations, setMaxIterations] = useState<number>(100);
  const [autoIterate, setAutoIterate] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Add points or initialize centroids.');

  // Colors for different clusters
  const clusterColors = [
    'rgba(75, 192, 192, 0.6)',   // teal
    'rgba(255, 159, 64, 0.6)',   // orange
    'rgba(255, 99, 132, 0.6)',   // pink
    'rgba(54, 162, 235, 0.6)',   // blue
    'rgba(153, 102, 255, 0.6)',  // purple
    'rgba(255, 206, 86, 0.6)',   // yellow
    'rgba(231, 233, 237, 0.6)',  // gray
    'rgba(96, 211, 148, 0.6)',   // mint
    'rgba(250, 130, 49, 0.6)',   // coral
    'rgba(56, 103, 214, 0.6)',   // royal blue
  ];
  
  const handlePointClick = useCallback((x: number, y: number) => {
    console.log(`[KMeansPage] Adding point: (${x.toFixed(2)}, ${y.toFixed(2)})`);
    setPoints(prevPoints => [...prevPoints, { x, y }]);
    
    // Reset if already clustered
    if (centroids.length > 0) {
      setCentroids([]);
      setAssignments({});
      setIteration(0);
      setConverged(false);
      setStatusMessage('Points added. Re-initialize centroids.');
    }
  }, [centroids.length]);

  const handleClearPoints = () => {
    setPoints([]);
    setCentroids([]);
    setAssignments({});
    setIteration(0);
    setConverged(false);
    setError(null);
    setStatusMessage('Plot cleared. Add points or initialize centroids.');
  };

  const executeStep = async () => {
    if (isLoading) return;
    
    if (points.length < k) {
      setError(`Need at least ${k} points to initialize ${k} clusters.`);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const payload: KMeansStepRequestPayload = {
        points,
        k,
        step_type: stepType,
        centroids: centroids.length > 0 ? centroids : undefined,
        assignments: Object.keys(assignments).length > 0 ? assignments : undefined,
        max_iterations: stepType === 'run_to_convergence' ? maxIterations : undefined,
      };
      
      const result = await (stepType === 'initialize' ? initializeKMeans(payload) : stepKMeans(payload));
      
      setCentroids(result.centroids);
      setAssignments(result.assignments);
      
      if (stepType === 'update_centroids' || stepType === 'run_to_convergence') {
        setIteration(prev => prev + (result.iterations_run || 1));
      }
      
      setConverged(result.converged);
      
      if (result.converged) {
        console.log('[KMeansPage] Algorithm converged!');
      }
      
      // Auto-switch to next step type
      if (stepType === 'initialize') {
        setStepType('assign_points');
      } else if (stepType === 'assign_points') {
        setStepType('update_centroids');
      } else if (stepType === 'update_centroids') {
        setStepType('assign_points');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute K-Means step.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle automatic iteration
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (autoIterate && !converged && !isLoading && centroids.length > 0) {
      intervalId = setInterval(() => {
        executeStep();
      }, 800); // Delay between steps in ms
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoIterate, converged, isLoading, centroids.length, executeStep]);

  // Create data series for Chart.js
  const dataSeries: DataSeries[] = useMemo(() => {
    const series: DataSeries[] = [];

    // Add original data points (if not assigned to clusters yet)
    if (Object.keys(assignments).length === 0) {
      series.push({
        label: 'Data Points',
        data: points,
        backgroundColor: 'rgba(128, 128, 128, 0.6)',
        pointRadius: 6,
      });
    } else {
      // Group points by their cluster assignments
      const clusterPoints: { [key: number]: Point[] } = {};
      
      points.forEach((point, index) => {
        const clusterId = assignments[index] ?? -1;
        if (clusterId >= 0) {
          if (!clusterPoints[clusterId]) {
            clusterPoints[clusterId] = [];
          }
          clusterPoints[clusterId].push(point);
        }
      });
      
      // Create a series for each cluster
      Object.entries(clusterPoints).forEach(([clusterId, clusterPoints]) => {
        const id = parseInt(clusterId);
        series.push({
          label: `Cluster ${id}`,
          data: clusterPoints,
          backgroundColor: clusterColors[id % clusterColors.length],
          pointRadius: 6,
        });
      });
    }
    
    // Add centroids as a separate series
    if (centroids.length > 0) {
      centroids.forEach((centroid, i) => {
        series.push({
          label: `Centroid ${i}`,
          data: [centroid],
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: clusterColors[i % clusterColors.length],
          pointRadius: 8,
        });
      });
    }

    return series;
  }, [points, assignments, centroids]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">K-Means Clustering</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ChartComponent 
            dataSeries={dataSeries}
            onPointClick={handlePointClick}
            title="K-Means Clustering Plot"
          />
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="kValue">
                Number of Clusters (K)
              </label>
              <input
                id="kValue"
                type="number"
                min="1"
                max="10"
                value={k}
                onChange={(e) => {
                  const newK = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
                  setK(newK);
                  // Reset clustering if K changes
                  if (centroids.length > 0) {
                    setCentroids([]);
                    setAssignments({});
                    setIteration(0);
                    setConverged(false);
                    setStatusMessage('k changed. Re-initialize centroids.');
                  }
                }}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                disabled={isLoading || centroids.length > 0}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="stepType">
                Step Type
              </label>
              <select
                id="stepType"
                value={stepType}
                onChange={(e) => setStepType(e.target.value as any)}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                disabled={isLoading}
              >
                <option value="initialize">Initialize Centroids</option>
                <option value="assign_points">Assign Points to Clusters</option>
                <option value="update_centroids">Update Centroids</option>
                <option value="run_to_convergence">Run to Convergence</option>
              </select>
            </div>
            
            {stepType === 'run_to_convergence' && (
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="maxIterations">
                  Max Iterations
                </label>
                <input
                  id="maxIterations"
                  type="number"
                  min="1"
                  max="1000"
                  value={maxIterations}
                  onChange={(e) => setMaxIterations(Math.max(1, Math.min(1000, parseInt(e.target.value) || 100)))}
                  className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  disabled={isLoading}
                />
              </div>
            )}
            
            <div className="flex flex-col space-y-2">
              <button
                onClick={executeStep}
                disabled={isLoading || points.length < k}
                className={`px-4 py-2 rounded ${
                  isLoading || points.length < k
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                } text-white transition-colors`}
              >
                {isLoading ? 'Processing...' : converged ? 'Converged!' : `Execute ${
                  stepType === 'initialize' ? 'Initialization' : 
                  stepType === 'assign_points' ? 'Assignment' : 
                  stepType === 'update_centroids' ? 'Update' : 
                  'Full Algorithm'
                }`}
              </button>
              
              {centroids.length > 0 && !converged && (
                <div className="flex items-center mt-2">
                  <input
                    id="autoIterate"
                    type="checkbox"
                    checked={autoIterate}
                    onChange={(e) => setAutoIterate(e.target.checked)}
                    disabled={isLoading || converged}
                    className="mr-2"
                  />
                  <label htmlFor="autoIterate" className="text-sm">
                    Auto-iterate {stepType === 'run_to_convergence' ? 'to convergence' : 'steps'}
                  </label>
                </div>
              )}
              
              <button
                onClick={handleClearPoints}
                disabled={isLoading || points.length === 0}
                className={`px-4 py-2 rounded ${
                  isLoading || points.length === 0
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
                } text-white transition-colors`}
              >
                Clear All
              </button>
            </div>
            
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 rounded">
                {error}
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium mb-1">Points: {points.length}</p>
              <div className="max-h-32 overflow-y-auto text-sm bg-gray-100 dark:bg-gray-900 p-2 rounded">
                {points.length === 0 ? (
                  <span className="text-gray-500 dark:text-gray-400">Click on the plot to add points</span>
                ) : (
                  <ul className="space-y-1">
                    {points.slice(0, 10).map((point, index) => (
                      <li key={index}>
                        Point {index + 1}: ({point.x.toFixed(2)}, {point.y.toFixed(2)})
                        {assignments[index] !== undefined && ` → Cluster ${assignments[index]}`}
                      </li>
                    ))}
                    {points.length > 10 && <li>...and {points.length - 10} more</li>}
                  </ul>
                )}
              </div>
            </div>
          </div>
          
          {/* Status Section */}
          {centroids.length > 0 && (
            <div className="mt-6 pt-4 border-t dark:border-gray-600">
              <h3 className="text-lg font-semibold mb-2">Status</h3>
              <p className="text-sm mb-1">Iteration: {iteration}</p>
              <p className="text-sm mb-1">Clusters: {centroids.length}</p>
              <p className="text-sm mb-1">
                Status: {converged ? 'Converged ✓' : 'In Progress...'}
              </p>
              <p className="text-sm mb-1">{statusMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KMeansPage;
