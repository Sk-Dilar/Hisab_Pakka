import React from 'react'
import { Link } from 'react-router-dom'

function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/10 to-success/5" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-success/10 to-transparent rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-accent/30 px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700">Trusted by 10,000+ Freelancers</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
            Make Every <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-success">Bill Count</span>
            <br />
            Get Paid <span className="text-transparent bg-clip-text bg-gradient-to-r from-success to-primary">Faster</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            The all-in-one billing platform for freelancers. Track work, create invoices, and automate payment allocations—so you can focus on what you do best.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5">
              Start Free Trial
            </Link>
            <button className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-full font-semibold text-lg border-2 border-gray-200 transition-all hover:border-primary hover:-translate-y-0.5 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Watch Demo
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">No credit card required • 14-day free trial</p>
        </div>
        
        {/* Hero Image / Dashboard Preview */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
          <div className="bg-gradient-to-br from-primary/20 to-success/20 rounded-2xl p-1 shadow-2xl">
            <div className="bg-white rounded-xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=700&fit=crop" alt="Dashboard Preview" className="w-full opacity-90" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
