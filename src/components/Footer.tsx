export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Join our community */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Join our community</h3>
            <div className="flex flex-col space-y-2">
              <a href="mailto:contact@arielspace.com" className="text-slate-300 hover:text-white transition">
                Email
              </a>
              <a href="#" className="text-slate-300 hover:text-white transition">
                Facebook
              </a>
              <a href="#" className="text-slate-300 hover:text-white transition">
                Twitter
              </a>
              <a href="#" className="text-slate-300 hover:text-white transition">
                Linkedin
              </a>
            </div>
          </div>

          {/* Where to? */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Where to?</h3>
            <div className="flex flex-col space-y-2">
              <a href="/" className="text-slate-300 hover:text-white transition">
                Home
              </a>
              <a href="/about" className="text-slate-300 hover:text-white transition">
                About Us
              </a>
              <a href="/contact" className="text-slate-300 hover:text-white transition">
                Contact
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-slate-700 text-center text-slate-400">
          <p>© 2025 ArielSpace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
