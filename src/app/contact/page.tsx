import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Contact Us</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-lg text-slate-700 mb-8">
            Have questions or need assistance? We'd love to hear from you!
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Email</h3>
              <a href="mailto:contact@arielspace.com" className="text-blue-600 hover:text-blue-700">
                contact@arielspace.com
              </a>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Social Media</h3>
              <div className="space-y-2">
                <p className="text-slate-700">Follow us on our social channels for updates:</p>
                <div className="flex gap-4">
                  <a href="#" className="text-blue-600 hover:text-blue-700">Facebook</a>
                  <a href="#" className="text-blue-600 hover:text-blue-700">Twitter</a>
                  <a href="#" className="text-blue-600 hover:text-blue-700">LinkedIn</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
