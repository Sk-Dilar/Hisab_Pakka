import React from 'react'

const steps = [
  {
    number: '01',
    title: 'Add Your Clients',
    description: 'Create client profiles with contact details and company information.'
  },
  {
    number: '02',
    title: 'Log Work Items',
    description: 'Track tasks, hours, or deliverables with quantity and rate.'
  },
  {
    number: '03',
    title: 'Generate Invoices',
    description: 'One-click invoice generation with smart auto-billing logic.'
  },
  {
    number: '04',
    title: 'Record Payments',
    description: 'Apply payments with automatic FIFO allocation to invoices.'
  }
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">How It Works</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
            Simple Steps to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-success">Streamline Billing</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started in minutes. No complex setup, no learning curve.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-gradient-to-br from-primary/5 to-success/5 rounded-2xl p-8 border border-gray-100 hover:border-primary/30 transition-all duration-300">
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-success opacity-20 mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <svg className="w-8 h-8 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
