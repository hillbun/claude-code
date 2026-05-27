"use client";

import { useState } from "react";

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contact" className="py-24 bg-indigo-600">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="text-white">
            <span className="text-indigo-200 font-semibold text-sm uppercase tracking-widest">Contact Us</span>
            <h2 className="mt-3 text-4xl font-bold leading-tight">
              Let's Build Something Great Together
            </h2>
            <p className="mt-4 text-indigo-200 leading-relaxed">
              Have a project in mind or want to explore how we can help? Reach out and our team
              will get back to you within one business day.
            </p>

            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-3 text-indigo-100">
                <span className="text-xl">📧</span>
                <span>contact@itpartner.com</span>
              </div>
              <div className="flex items-center gap-3 text-indigo-100">
                <span className="text-xl">📞</span>
                <span>+1 (800) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-indigo-100">
                <span className="text-xl">📍</span>
                <span>123 Tech Avenue, San Francisco, CA 94105</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl">
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-gray-900">Message Sent!</h3>
                <p className="text-gray-500 mt-2">We'll get back to you within one business day.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about your project..."
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
