import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">About ArielSpace</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <p className="text-lg text-slate-700 leading-relaxed">
            ArielSpace is your gateway to professional growth and career development. We connect 
            ambitious individuals with quality internships and project opportunities that come with 
            industry-recognized certifications.
          </p>
          
          <p className="text-lg text-slate-700 leading-relaxed">
            Our platform is designed to make finding and applying for opportunities seamless and 
            efficient. Whether you're a student looking for your first internship or a professional 
            seeking to expand your skills, ArielSpace provides the resources you need to succeed.
          </p>
          
          <div className="pt-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              To empower individuals with practical experience and certified skills that accelerate 
              their career growth and open doors to new opportunities.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
