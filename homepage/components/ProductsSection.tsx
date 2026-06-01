const products = [
  {
    icon: "🖥️",
    title: "Custom Software Development",
    description: "Bespoke web and mobile applications designed around your workflows and business logic.",
  },
  {
    icon: "☁️",
    title: "Cloud Infrastructure",
    description: "Scalable, secure cloud architecture on AWS, Azure, or GCP — fully managed and optimized.",
  },
  {
    icon: "🔒",
    title: "Cybersecurity",
    description: "Comprehensive security audits, penetration testing, and continuous threat monitoring.",
  },
  {
    icon: "📊",
    title: "Data & Analytics",
    description: "Turn raw data into actionable insights with BI dashboards and AI-powered analytics.",
  },
  {
    icon: "🔗",
    title: "System Integration",
    description: "Seamlessly connect legacy systems with modern APIs, ERPs, and third-party platforms.",
  },
  {
    icon: "🛠️",
    title: "IT Consulting",
    description: "Strategic technology roadmaps and hands-on advisory to align IT with business goals.",
  },
];

export default function ProductsSection() {
  return (
    <section id="products" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">Our Products & Services</span>
          <h2 className="mt-3 text-4xl font-bold text-gray-900">
            Everything You Need to Scale
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            End-to-end technology services from initial strategy through implementation and ongoing support.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.title}
              className="p-8 rounded-2xl bg-white border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div className="text-4xl mb-4">{product.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
