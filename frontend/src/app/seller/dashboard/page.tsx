'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Product {
  id: number;
  title: string;
  price: number;
  stock: number;
  category: string;
  is_active: boolean;
  image_url: string | null;
}

export default function SellerProductsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      router.push('/login');
      return;
    }
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await API.get('/seller/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">🛍️ ShopHub</h1>
        <div className="flex items-center gap-4">
          <Link href="/seller/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
          <button onClick={() => { logout(); router.push('/login'); }} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Products</h2>
          <Link href="/seller/products/add" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
            + Add Product
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading products...</p>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-gray-500 text-lg mb-4">No products yet</p>
            <Link href="/seller/products/add" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Add your first product
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 text-gray-600 font-medium">Product</th>
                  <th className="text-left px-6 py-4 text-gray-600 font-medium">Price</th>
                  <th className="text-left px-6 py-4 text-gray-600 font-medium">Stock</th>
                  <th className="text-left px-6 py-4 text-gray-600 font-medium">Category</th>
                  <th className="text-left px-6 py-4 text-gray-600 font-medium">Status</th>
                  <th className="text-left px-6 py-4 text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.title} className="w-10 h-10 object-cover rounded-lg" />
                          ) : (
                            <span>📦</span>
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{product.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">₹{product.price}</td>
                    <td className="px-6 py-4">
                      <span className={product.stock < 5 ? 'text-red-600 font-medium' : 'text-gray-700'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{product.category || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
