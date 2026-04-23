import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          🛍️ ShopHub
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          The best multi-vendor marketplace
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700">
            Login
          </Link>
          <Link href="/register" className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-300">
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}