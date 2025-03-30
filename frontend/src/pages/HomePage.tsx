import { Link } from 'react-router-dom'

const HomePage = () => {
  const algorithms = [
    {
      title: 'Linear Regression',
      description: 'Visualize how Linear Regression finds the best fit line for your data points.',
      path: '/linear-regression',
      color: 'bg-blue-500',
    },
    {
      title: 'Logistic Regression',
      description: 'See how Logistic Regression creates a decision boundary for binary classification.',
      path: '/logistic-regression',
      color: 'bg-green-500',
    },
    {
      title: 'K-Means Clustering',
      description: 'Watch the iterative process of K-Means clustering your data into groups.',
      path: '/kmeans',
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="mx-auto max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">ML Visualization Suite</h1>
        <p className="mt-4 text-xl text-gray-600">
          An interactive tool for visualizing fundamental machine learning algorithms
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {algorithms.map((algo) => (
          <Link
            key={algo.path}
            to={algo.path}
            className="block group"
          >
            <div className="h-full flex flex-col overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl border border-gray-200">
              <div className={`${algo.color} p-6 text-white`}>
                <h2 className="text-xl font-semibold">{algo.title}</h2>
              </div>
              <div className="p-6 bg-white flex-grow">
                <p className="text-gray-600">{algo.description}</p>
              </div>
              <div className="p-4 bg-gray-50 text-center">
                <span className="text-indigo-600 font-medium group-hover:text-indigo-800">
                  Try it now →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 bg-indigo-50 rounded-lg">
        <h2 className="text-xl font-semibold text-indigo-800">How to use</h2>
        <ul className="mt-4 space-y-2 text-gray-700">
          <li>• Select an algorithm from the cards above</li>
          <li>• Click on the plot area to add data points</li>
          <li>• Adjust parameters using the provided controls</li>
          <li>• Run the algorithm and observe the visualization</li>
          <li>• Reset the plot to try with different data points</li>
        </ul>
      </div>
    </div>
  )
}

export default HomePage 