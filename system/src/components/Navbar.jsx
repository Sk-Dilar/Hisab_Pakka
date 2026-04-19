import React from 'react'
import { Link } from 'react-router-dom'

function Navbar({ scrolled }) {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-success rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">HP</span>
            </div>
            <span className={`text-xl font-bold ${scrolled ? 'text-gray-900' : 'text-gray-900'}`}>Hisab Pakka</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-primary transition-colors">How it Works</a>
            <a href="#pricing" className="text-gray-600 hover:text-primary transition-colors">Pricing</a>
            <a href="#testimonials" className="text-gray-600 hover:text-primary transition-colors">Testimonials</a>
            <Link to="/login" className="text-gray-700 hover:text-primary font-medium transition-colors">Login</Link>
            <Link to="/register" className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full font-medium transition-all hover:shadow-lg hover:shadow-primary/30">
              Get Started Free
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <a href="#features" className="block text-gray-600 hover:text-primary">Features</a>
            <a href="#how-it-works" className="block text-gray-600 hover:text-primary">How it Works</a>
            <a href="#pricing" className="block text-gray-600 hover:text-primary">Pricing</a>
            <Link to="/login" className="block text-gray-700 hover:text-primary">Login</Link>
            <Link to="/register" className="block bg-primary text-white px-6 py-2 rounded-full font-medium">Get Started Free</Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
