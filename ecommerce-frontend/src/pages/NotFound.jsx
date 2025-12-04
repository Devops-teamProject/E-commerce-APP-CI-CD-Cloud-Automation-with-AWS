export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-4">
      
      <h1 className="text-6xl font-bold text-blue-600 mb-4">
        404
      </h1>

      <p className="text-xl text-gray-700 mb-6">
       Not Found 😔
      </p>

      <a
        href="/"
        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-all duration-300"
      >
        Back to Home Page
      </a>
    </div>
  );
}
