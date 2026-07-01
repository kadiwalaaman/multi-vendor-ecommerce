'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface DashboardStats {
  total_products: number;
  total_orders: number;
  total_earnings: number;
  low_stock_products: { id: number; title: string; stock: number }[];
}

export default function SellerDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      router.push('/login');
      return;
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await API.get('/seller/dashboard');
      setStats(res.data);
    } catch (err: any) {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">🛍️ ShopHub</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Hi, {user?.name}! 👋</span>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Seller Dashboard</h2>
          <Link href="/seller/products/add" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
            + Add Product
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <p className="text-4xl font-bold text-blue-600">{stats.total_products}</p>
                <p className="text-gray-500 mt-2">Total Products</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <p className="text-4xl font-bold text-green-600">{stats.total_orders}</p>
                <p className="text-gray-500 mt-2">Total Orders</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <p className="text-4xl font-bold text-purple-600">₹{stats.total_earnings}</p>
                <p className="text-gray-500 mt-2">Total Earnings</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <Link href="/seller/products" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition flex items-center gap-4">
                <span className="text-4xl">📦</span>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">My Products</p>
                  <p className="text-gray-500 text-sm">View and manage your listings</p>
                </div>
              </Link>
              <Link href="/seller/products/add" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition flex items-center gap-4">
                <span className="text-4xl">➕</span>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Add New Product</p>
                  <p className="text-gray-500 text-sm">List a new item for sale</p>
                </div>
              </Link>
            </div>

            {stats.low_stock_products.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="font-semibold text-yellow-800 mb-3">⚠️ Low Stock Alert</h3>
                <ul className="space-y-2">
                  {stats.low_stock_products.map((p) => (
                    <li key={p.id} className="flex justify-between text-yellow-700">
                      <span>{p.title}</span>
                      <span className="font-medium">{p.stock} left</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
