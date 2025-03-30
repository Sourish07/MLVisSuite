'use client';

import React, { useState, useCallback } from 'react';
import ChartComponent, { DataSeries } from '../components/ChartComponent';
import { computeLogisticRegression } from '../services/api';
import type { PointWithLabel, LogRegResponsePayload } from '../types';

const LogisticRegressionPage: React.FC = () => {
  const [points, setPoints] = useState<PointWithLabel[]>([]);
  const [degree, setDegree] = useState<number>(1);
  const [iterations, setIterations] = useState<number>(1000);
  const [learningRate, setLearningRate] = useState<number>(0.01);
  const [selectedLabel, setSelectedLabel] = useState<number>(0); // 0 or 1 for adding points
  const [regressionResult, setRegressionResult] = useState<LogRegResponsePayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePointClick = useCallback((x: number, y: number) => {
    console.log(`[LogisticRegressionPage] Adding point: (${x.toFixed(2)}, ${y.toFixed(2)}) with label ${selectedLabel}`);
    setPoints(prevPoints => [...prevPoints, { x, y, label: selectedLabel }]);
    setRegressionResult(null); // Clear previous result
  }, [selectedLabel]);

  const handleClearPoints = () => {
    setPoints([]);
    setRegressionResult(null);
    setError(null);
  };

  const handleCompute = async () => {
    const uniqueLabels = new Set(points.map(p => p.label));
    if (points.length < 2 || uniqueLabels.size < 2) {
      setError("Please add at least two points with different labels (0 and 1).");
      return;
    }
    setIsLoading(true);
    setError(null);
    setRegressionResult(null);
    try {
      const result = await computeLogisticRegression({
        points,
        degree,
        iterations,
        learning_rate: learningRate,
      });
      setRegressionResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compute regression.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Create data series for Chart.js
  const dataSeries: DataSeries[] = [
    // Class 0 points (blue)
    {
      label: 'Class 0',
      data: points.filter(p => p.label === 0),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      pointRadius: 6,
    },
    // Class 1 points (orange)
    {
      label: 'Class 1',
      data: points.filter(p => p.label === 1),
      backgroundColor: 'rgba(255, 159, 64, 0.6)',
      pointRadius: 6,
    }
  ];

  // We can't easily visualize the decision boundary with Chart.js as we could with Plotly's contour plots
  // Instead, we could add a note to the user that the decision boundary visualization is not available
  // in this simplified version, or implement a more complex visualization if needed.

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Logistic Regression</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ChartComponent 
            dataSeries={dataSeries}
            onPointClick={handlePointClick}
            title="Logistic Regression Plot"
          />
          
          {regressionResult && (
            <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded">
              <p className="text-sm">
                <strong>Note:</strong> Decision boundary visualization is simplified in this version. 
                The colored points show the class separation, but the exact boundary line is not displayed.
              </p>
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Point Label</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedLabel(0)}
                  className={`flex-1 py-2 px-3 rounded ${
                    selectedLabel === 0
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Class 0
                </button>
                <button
                  onClick={() => setSelectedLabel(1)}
                  className={`flex-1 py-2 px-3 rounded ${
                    selectedLabel === 1
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Class 1
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="degree">
                Polynomial Degree
              </label>
              <input
                id="degree"
                type="number"
                min="1"
                max="5"
                value={degree}
                onChange={(e) => setDegree(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="iterations">
                Iterations
              </label>
              <input
                id="iterations"
                type="number"
                min="100"
                max="10000"
                step="100"
                value={iterations}
                onChange={(e) => setIterations(Math.max(100, Math.min(10000, parseInt(e.target.value) || 1000)))}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="learningRate">
                Learning Rate
              </label>
              <input
                id="learningRate"
                type="number"
                min="0.001"
                max="1"
                step="0.001"
                value={learningRate}
                onChange={(e) => setLearningRate(Math.max(0.001, Math.min(1, parseFloat(e.target.value) || 0.01)))}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleCompute}
                disabled={isLoading || points.length < 2}
                className={`px-4 py-2 rounded ${
                  isLoading || points.length < 2
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                } text-white transition-colors`}
              >
                {isLoading ? 'Computing...' : 'Compute Regression'}
              </button>
              
              <button
                onClick={handleClearPoints}
                disabled={isLoading || points.length === 0}
                className={`px-4 py-2 rounded ${
                  isLoading || points.length === 0
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
                } text-white transition-colors`}
              >
                Clear Points
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
                    {points.map((point, index) => (
                      <li key={index}>
                        Point {index + 1}: ({point.x.toFixed(2)}, {point.y.toFixed(2)}) - Class {point.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          
          {/* Results Section */}
          {regressionResult && (
            <div className="mt-6 pt-4 border-t dark:border-gray-600">
              <h3 className="text-lg font-semibold mb-2">Results</h3>
              {regressionResult.cost !== null && regressionResult.cost !== undefined && (
                <p className="text-sm mb-1">Cost (Cross-Entropy): {regressionResult.cost?.toFixed(4)}</p>
              )}
              {regressionResult.coefficients && (
                <p className="text-sm mb-1">Coefficients: [{regressionResult.coefficients.map(c => c.toFixed(3)).join(', ')}]</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogisticRegressionPage;
