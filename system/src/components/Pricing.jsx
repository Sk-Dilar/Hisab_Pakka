import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaCheck } from "react-icons/fa";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for getting started",
    features: [
      "3 Clients",
      "10 Invoices/month",
      "Basic Reports",
      "Email Support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "15",
    description: "For serious freelancers",
    features: [
      "Unlimited Clients",
      "Unlimited Invoices",
      "Advanced Reports",
      "Priority Support",
      "Custom Branding",
      "API Access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "49",
    description: "For teams and agencies",
    features: [
      "Everything in Pro",
      "Team Members",
      "Role-based Access",
      "Audit Logs",
      "Dedicated Support",
      "SLA Guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
            Simple,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-success">
              Transparent
            </span>{" "}
            Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center gap-4 bg-white rounded-full p-1.5 shadow-sm border border-gray-200">
            <button
              className={`px-6 py-2.5 rounded-full font-medium transition-all ${!annual ? "bg-primary text-white" : "text-gray-600"}`}
              onClick={() => setAnnual(false)}
            >
              Monthly
            </button>
            <button
              className={`px-6 py-2.5 rounded-full font-medium transition-all ${annual ? "bg-primary text-white" : "text-gray-600"}`}
              onClick={() => setAnnual(true)}
            >
              Annual <span className="text-accent ml-1 text-sm">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl p-8 border-2 transition-all duration-300 hover:-translate-y-2 ${
                plan.popular
                  ? "border-primary shadow-xl scale-105"
                  : "border-gray-100 shadow-sm hover:shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="inline-block bg-accent text-gray-900 text-sm font-semibold px-4 py-1 rounded-full mb-4">
                  Most Popular
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <p className="text-gray-600 mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">
                  ${annual ? (plan.price * 0.8).toFixed(0) : plan.price}
                </span>
                <span className="text-gray-600">/month</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <FaCheck className="w-4 h-4 text-success flex-shrink-0 mt-1" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`block w-full py-3 rounded-full font-semibold text-center transition-all ${
                  plan.popular
                    ? "bg-primary hover:bg-primary/90 text-white hover:shadow-lg hover:shadow-primary/30"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pricing;
