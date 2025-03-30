import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate
} from "react-router-dom";

// Import Page Components
import KMeansPage from './pages/KMeansPage';
import LinearRegressionPage from './pages/LinearRegressionPage';
import LogisticRegressionPage from './pages/LogisticRegressionPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
        <nav className="bg-white dark:bg-gray-800 shadow-md p-4">
          <ul className="flex space-x-4 justify-center">
            <li>
              <Link to="/linear-regression" className="hover:text-blue-500 dark:hover:text-blue-400">Linear Regression</Link>
            </li>
            <li>
              <Link to="/logistic-regression" className="hover:text-blue-500 dark:hover:text-blue-400">Logistic Regression</Link>
            </li>
            <li>
              <Link to="/kmeans" className="hover:text-blue-500 dark:hover:text-blue-400">K-Means Clustering</Link>
            </li>
          </ul>
        </nav>

        <main className="flex-grow container mx-auto p-4">
          <Routes>
            <Route path="/linear-regression" element={<LinearRegressionPage />} />
            <Route path="/logistic-regression" element={<LogisticRegressionPage />} />
            <Route path="/kmeans" element={<KMeansPage />} />
            {/* Redirect base path to a default page */}
            <Route path="/" element={<Navigate to="/linear-regression" replace />} />
          </Routes>
        </main>

        <footer className="text-center p-4 text-sm text-gray-500 dark:text-gray-400">
          MLVisSuite - Interactive Machine Learning Visualization
        </footer>
      </div>
    </Router>
  );
}

export default App;
