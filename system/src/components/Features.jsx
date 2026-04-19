import React from "react";
import {
  FaFolderOpen,
  FaFileInvoice,
  FaChartLine,
  FaUsers,
  FaClock,
  FaShieldAlt,
} from "react-icons/fa";

const features = [
  {
    icon: <FaFolderOpen className="w-8 h-8" />,
    title: "Project Tracking",
    description:
      "Organize work items by project. Track ongoing and finished projects with ease.",
  },
  {
    icon: <FaFileInvoice className="w-8 h-8" />,
    title: "Smart Invoicing",
    description:
      "Auto-append unbilled items to existing invoices. Intelligent billing saves you time.",
  },
  {
    icon: <FaChartLine className="w-8 h-8" />,
    title: "Real-time Balance",
    description:
      "Live client balance tracking. Know exactly who owes what at any given moment.",
  },
  {
    icon: <FaUsers className="w-8 h-8" />,
    title: "Client Management",
    description:
      "Complete client profiles with contact info, company, and financial history.",
  },
  {
    icon: <FaClock className="w-8 h-8" />,
    title: "FIFO Payments",
    description:
      "Automatic payment allocation using First-In-First-Out method for accuracy.",
  },
  {
    icon: <FaShieldAlt className="w-8 h-8" />,
    title: "Secure & Private",
    description:
      "Bank-grade security with data isolation. Your data stays yours, always.",
  },
];

function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
            Everything You Need to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-success">
              Get Paid
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful tools designed to simplify your billing workflow and
            accelerate payments.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-success/10 rounded-xl flex items-center justify-center mb-6 group-hover:from-primary group-hover:to-success transition-all duration-300">
                <span className="text-primary group-hover:text-white transition-colors">
                  {feature.icon}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
