export default function Contactus(){
return (
  <div className="min-h-screen bg-gray-100">
    <section className="text-center py-16 bg-gray-600 text-white">
      <h1 className="text-4xl font-bold mb-3">Contact Us</h1>
      <p className="text-gray-300 text-lg max-w-2xl mx-auto">
        Got a question ? Alright we'd like to hear from you Send Us a messageand
        we'll respond as soon as possible.
      </p>
    </section>

    <section className="py-16 bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">
      
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Contact Us
        </h2>

        <form className="space-y-6">
         
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="example@email.com"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Subject
            </label>
            <input
              type="text"
              placeholder="Message subject"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Message
            </label>
            <textarea
              rows="5"
              placeholder="Write your message..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            ></textarea>
          </div>

          
          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </section>
  </div>
);

}