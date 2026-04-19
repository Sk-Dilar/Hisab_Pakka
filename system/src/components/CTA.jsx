import React from 'react'
import { Link } from 'react-router-dom'

function CTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary to-success relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Ready to Get Paid Faster?
        </h2>
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Join 10,000+ freelancers who've streamlined their billing workflow. Start your free trial today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/register" 
            className="bg-white text-primary hover:bg-gray-100 px-10 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            Start Free Trial
          </Link>
          <button className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-10 py-4 rounded-full font-semibold text-lg transition-all hover:-translate-y-0.5">
            Schedule Demo
          </button>
        </div>
        <p className="text-sm text-white/80 mt-6">No credit card required • 14-day free trial • Cancel anytime</p>
      </div>
    </section>
  )
}

export default CTA
