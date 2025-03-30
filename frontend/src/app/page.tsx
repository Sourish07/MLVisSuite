import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <h1 className="text-4xl font-bold mb-8 text-center">Welcome to the ML Visualization Suite</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 text-center max-w-2xl">
        Explore interactive visualizations of fundamental machine learning algorithms.
        Click on the links below or use the navigation bar to get started.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Link href="/linear-regression" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow text-center border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-3 text-blue-600 dark:text-blue-400">Linear Regression</h2>
            <p className="text-gray-600 dark:text-gray-400">Visualize fitting a line (or curve) to 2D data points using gradient descent.</p>
        </Link>
        <Link href="/logistic-regression" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow text-center border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-3 text-green-600 dark:text-green-400">Logistic Regression</h2>
            <p className="text-gray-600 dark:text-gray-400">See how a decision boundary is learned for binary classification problems.</p>
        </Link>
        <Link href="/kmeans" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow text-center border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-3 text-purple-600 dark:text-purple-400">K-Means Clustering</h2>
            <p className="text-gray-600 dark:text-gray-400">Observe the process of grouping data points into clusters iteratively.</p>
        </Link>
      </div>
    </div>
  );
}
