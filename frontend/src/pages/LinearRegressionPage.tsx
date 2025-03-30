import React, { useState, useCallback } from 'react';
import ChartComponent, { DataSeries } from '../components/ChartComponent';
import { computeLinearRegression } from '../services/api';
import type { Point, LinRegResponsePayload } from '../types';

const LinearRegressionPage: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [degree, setDegree] = useState<number>(1);
  const [regressionResult, setRegressionResult] = useState<LinRegResponsePayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePointClick = useCallback((x: number, y: number) => {
    console.log(`[LinearRegressionPage] Adding point: (${x}, ${y})`);
    setPoints(prevPoints => [...prevPoints, { x, y }]);
    setRegressionResult(null); // Clear previous result when adding new points
  }, []);

  const handleClearPoints = () => {
    setPoints([]);
    setRegressionResult(null);
    setError(null);
  };

  const handleCompute = async () => {
    if (points.length < 2) {
      setError("Please add at least two points to compute regression.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await computeLinearRegression({
        points,
        degree
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
    {
      label: 'Data Points',
      data: points,
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      pointRadius: 6,
    }
  ];

  // Add regression line if available
  if (regressionResult && regressionResult.predictions) {
    // Create a line series from the regression result
    dataSeries.push({
      label: 'Regression Line',
      data: points.map((point, index) => ({
        x: point.x,
        y: regressionResult.predictions[index] || 0,
      })),
      backgroundColor: 'rgba(255, 99, 132, 0.6)',
      borderColor: 'rgba(255, 99, 132, 1)',
      pointRadius: 0, // Hide individual points
      showLine: true, // Show the connecting line
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Linear Regression</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ChartComponent 
            dataSeries={dataSeries}
            onPointClick={handlePointClick}
            title="Linear Regression Plot"
          />
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="degree">
                Polynomial Degree
              </label>
              <input
                id="degree"
                type="number"
                min="1"
                max="10"
                value={degree}
                onChange={(e) => setDegree(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
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
                        Point {index + 1}: ({point.x.toFixed(2)}, {point.y.toFixed(2)})
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
                <p className="text-sm mb-1">Cost (MSE): {regressionResult.cost?.toFixed(4)}</p>
              )}
              {regressionResult.coefficients && regressionResult.coefficients.length > 0 && (
                <p className="text-sm mb-1">Coefficients: [{regressionResult.coefficients.map(c => c.toFixed(3)).join(', ')}]</p>
              )}
              <p className="text-sm mb-1">Polynomial Degree: {degree}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinearRegressionPage;
