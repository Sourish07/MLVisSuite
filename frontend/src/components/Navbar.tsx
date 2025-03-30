import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  const location = useLocation()
  const { pathname } = location

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Linear Regression', path: '/linear-regression' },
    { name: 'Logistic Regression', path: '/logistic-regression' },
    { name: 'K-Means Clustering', path: '/kmeans' },
  ]

  return (
    <nav className="bg-indigo-600 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-white font-bold text-xl">ML Viz Suite</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === link.path
                    ? 'bg-indigo-700 text-white'
                    : 'text-indigo-100 hover:bg-indigo-500'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 