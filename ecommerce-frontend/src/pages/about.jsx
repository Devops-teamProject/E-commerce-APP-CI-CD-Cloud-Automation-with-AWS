export default function Aboutus() {
  return (
    <div className="min-h-screen bg-gray-100">
   
      <section className="text-center py-16 bg-gray-600 text-white">
        <h1 className="text-4xl font-bold mb-3">About E-Shop</h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Learn more about our journey, our mission, and what drives us forward.
        </p>
      </section>

      
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-8">
        
        <section className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-gray-700 leading-relaxed">
              E-Shop started with a simple idea: make online shopping easy,
              affordable, and enjoyable. Our journey began with a small team
              passionate about e-commerce and focused on delivering high-quality
              products to customers around the world.
            </p>
          </div>

          <img
            src="https://plus.unsplash.com/premium_photo-1684785618727-378a3a5e91c5?q=80&w=1984&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            className="rounded-lg shadow-lg object-cover h-64 w-full"
            alt="Our Story"
          />
        </section>

        
        <section>
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            We aim to provide exceptional products with an excellent customer
            experience. Quality, trust, and customer satisfaction are at the
            heart of everything we do.
          </p>
        </section>

        
        <section>
          <h2 className="text-3xl font-bold mb-4">Our Values</h2>
          <ul className="list-disc ml-6 text-gray-700 space-y-2">
            <li>Customer-first mentality</li>
            <li>Commitment to quality</li>
            <li>Innovation & continuous improvement</li>
            <li>Transparency and integrity</li>
          </ul>
        </section>

        
        <div className="text-center mt-10">
          <a
            href="/contact"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
