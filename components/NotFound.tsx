export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-5xl font-bold text-blue-700 mb-4">404</h1>
      <p className="text-lg text-gray-700 mb-6">Sorry, the page you are looking for could not be found or you do not have access.</p>
      <a href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Go Home</a>
    </div>
  );
}
