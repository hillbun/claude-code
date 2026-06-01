export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-white font-bold text-lg">ITPartner</span>
        <p className="text-sm">© {new Date().getFullYear()} ITPartner. All rights reserved.</p>
        <div className="flex gap-6 text-sm">
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#products" className="hover:text-white transition-colors">Products</a>
          <a href="#recruitment" className="hover:text-white transition-colors">Careers</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
