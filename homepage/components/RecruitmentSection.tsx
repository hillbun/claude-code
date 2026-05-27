const perks = [
  { icon: "🚀", title: "High-Impact Work", description: "Ship products used by thousands of enterprise clients worldwide." },
  { icon: "📚", title: "Learning Budget", description: "Annual budget for courses, conferences, and certifications." },
  { icon: "🌏", title: "Flexible & Remote", description: "Work from anywhere with a flexible, async-friendly culture." },
  { icon: "💰", title: "Competitive Pay", description: "Top-of-market salaries, equity, and performance bonuses." },
];

const openings = [
  { title: "Senior Full-Stack Engineer", dept: "Engineering", type: "Full-time" },
  { title: "DevOps / Platform Engineer", dept: "Infrastructure", type: "Full-time" },
  { title: "Product Manager", dept: "Product", type: "Full-time" },
  { title: "UI/UX Designer", dept: "Design", type: "Full-time" },
];

export default function RecruitmentSection() {
  return (
    <section id="recruitment" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">Careers</span>
          <h2 className="mt-3 text-4xl font-bold text-gray-900">Join Our Team</h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            We're looking for talented people who are passionate about building great technology.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {perks.map((perk) => (
            <div key={perk.title} className="text-center p-6">
              <div className="text-3xl mb-3">{perk.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{perk.title}</h3>
              <p className="text-sm text-gray-500">{perk.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-2xl overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Open Positions</h3>
          </div>
          <ul>
            {openings.map((job, i) => (
              <li
                key={job.title}
                className={`flex items-center justify-between px-8 py-5 hover:bg-indigo-50 transition-colors cursor-pointer ${i < openings.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <div>
                  <div className="font-medium text-gray-900">{job.title}</div>
                  <div className="text-sm text-gray-500">{job.dept} · {job.type}</div>
                </div>
                <span className="text-indigo-600 text-sm font-medium">Apply →</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
