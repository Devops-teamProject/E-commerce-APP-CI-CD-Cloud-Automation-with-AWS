export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-6">
      
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">E-Shop</h2>
          <p>Your favorite online store for fashion, electronics, and more.</p>
        </div>

       
        <div>
          <h3 className="text-white font-semibold mb-3">Useful Links</h3>
          <ul className="space-y-2">
            <li>
              <a href="/" className="hover:text-blue-400">
                Home
              </a>
            </li>
            <li>
              <a href="/products" className="hover:text-blue-400">
                Products
              </a>
            </li>
            <li>
              <a href="/about" className="hover:text-blue-400">
                About Us
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-blue-400">
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Contact</h3>
          <ul className="space-y-2">
            <li>Email: magednaim58@gmail.com</li>
            <li>Phone: +201207511764</li>
            <li>Address: Cairo, Egypt</li>
          </ul>
        </div>
      </div>

      <hr className="border-gray-700 my-8" />

      <p className="text-center text-gray-500">
        © 2025 E-Shop. All rights reserved.
      </p>
    </footer>
  );
}
