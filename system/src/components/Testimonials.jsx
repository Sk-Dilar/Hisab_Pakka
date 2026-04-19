import React from "react";
import { FaStar } from "react-icons/fa";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "UX Designer",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    content:
      "Hisab Pakka transformed how I handle client billing. The automatic payment allocation is a game-changer!",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Full-Stack Developer",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    content:
      "I used to spend hours on invoices. Now it takes seconds. The smart billing logic is brilliant.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Content Strategist",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    content:
      "Finally, a billing platform that understands freelancers. Clean, simple, and powerful.",
    rating: 5,
  },
];

function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
            Loved by{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-success">
              Freelancers
            </span>{" "}
            Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of happy users who trust Hisab Pakka with their
            billing.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="w-5 h-5 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
