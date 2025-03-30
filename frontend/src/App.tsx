import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LinearRegressionPage from './pages/LinearRegressionPage'
import LogisticRegressionPage from './pages/LogisticRegressionPage'
import KMeansPage from './pages/KMeansPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/linear-regression" element={<LinearRegressionPage />} />
          <Route path="/logistic-regression" element={<LogisticRegressionPage />} />
          <Route path="/kmeans" element={<KMeansPage />} />
        </Routes>
      </main>
      <footer className="bg-white shadow-inner py-4">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          ML Visualization Suite - Educational Tool
        </div>
      </footer>
    </div>
  )
}

export default App 