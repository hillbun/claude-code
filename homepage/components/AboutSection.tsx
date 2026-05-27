const stats = [
  { value: "10+", label: "Years of Experience" },
  { value: "200+", label: "Enterprise Clients" },
  { value: "500+", label: "Projects Delivered" },
  { value: "80+", label: "Team Members" },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">About Us</span>
            <h2 className="mt-3 text-4xl font-bold text-gray-900 leading-tight">
              A Trusted Partner in Digital Innovation
            </h2>
            <p className="mt-6 text-gray-500 leading-relaxed">
              ITPartner was founded with a single mission: to help organizations harness the power of
              modern technology. From startups to Fortune 500 companies, we provide end-to-end IT
              solutions tailored to each client's unique challenges.
            </p>
            <p className="mt-4 text-gray-500 leading-relaxed">
              Our team of engineers, architects, and consultants combines deep technical expertise
              with business acumen to deliver solutions that create real, measurable value.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="p-8 rounded-2xl bg-indigo-50 text-center"
              >
                <div className="text-4xl font-extrabold text-indigo-600">{stat.value}</div>
                <div className="mt-2 text-sm text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
