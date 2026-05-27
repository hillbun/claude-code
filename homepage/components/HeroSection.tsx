export default function HeroSection() {
  return (
    <section className="relative pt-16 min-h-screen flex items-center bg-gradient-to-br from-indigo-50 via-white to-white overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <span className="inline-block mb-6 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
          Empowering Digital Transformation
        </span>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
          Technology Solutions
          <br />
          <span className="text-indigo-600">Built for Growth</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-500 mb-10">
          We deliver enterprise-grade software, cloud infrastructure, and IT consulting services
          that help businesses scale faster and operate smarter.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#products"
            className="px-8 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            Explore Our Products
          </a>
          <a
            href="#about"
            className="px-8 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Learn About Us
          </a>
        </div>
      </div>
    </section>
  );
}
