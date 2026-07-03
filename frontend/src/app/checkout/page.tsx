'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod',
  });

  // Get cart from sessionStorage passed via URL or localStorage
  const [cart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const c = localStorage.getItem('checkout_cart');
      return c ? JSON.parse(c) : [];
    } catch { return []; }
  });

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) { setError('Your cart is empty'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/orders/', {
        items: cart.map(i => ({ product_id: i.id, quantity: i.quantity })),
      });
      setOrderId(res.data.id);
      setOrderPlaced(true);
      localStorage.removeItem('checkout_cart');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
          <div className="text-7xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Order Placed!</h2>
          <p className="text-gray-500 mb-2">Your order #{orderId} has been placed successfully.</p>
          <p className="text-gray-400 text-sm mb-8">
            {form.paymentMethod === 'cod' ? 'Pay ₹' + cartTotal.toLocaleString() + ' on delivery.' : 'Payment confirmed!'}
          </p>
          <div className="bg-blue-50 rounded-xl p-4 mb-8 text-left">
            <p className="text-sm text-gray-600"><span className="font-medium">Delivering to:</span> {form.fullName}</p>
            <p className="text-sm text-gray-600">{form.address}, {form.city}</p>
            <p className="text-sm text-gray-600">{form.state} - {form.pincode}</p>
            <p className="text-sm text-gray-600">📞 {form.phone}</p>
          </div>
          <Link href="/products" className="block w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700">
            Continue Shopping →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/products" className="text-2xl font-bold text-blue-600">🛍️ ShopHub</Link>
          <span className="text-gray-500">Checkout</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h2>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🛒</p>
            <p className="text-gray-500 text-xl mb-6">Your cart is empty</p>
            <Link href="/products" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700">
              Go Shopping
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Forms */}
              <div className="lg:col-span-2 space-y-6">
                {/* Delivery Address */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-5">📍 Delivery Address</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          value={form.fullName}
                          onChange={handleChange}
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          required
                          placeholder="10-digit number"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required
                        placeholder="House/Flat No, Street, Area"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                        <input
                          type="text"
                          name="state"
                          value={form.state}
                          onChange={handleChange}
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                        <input
                          type="text"
                          name="pincode"
                          value={form.pincode}
                          onChange={handleChange}
                          required
                          placeholder="6 digits"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-5">💳 Payment Method</h3>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${form.paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="paymentMethod" value="cod" checked={form.paymentMethod === 'cod'} onChange={handleChange} className="accent-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">💵 Cash on Delivery</p>
                        <p className="text-sm text-gray-500">Pay when your order arrives</p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${form.paymentMethod === 'upi' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="paymentMethod" value="upi" checked={form.paymentMethod === 'upi'} onChange={handleChange} className="accent-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">📱 UPI</p>
                        <p className="text-sm text-gray-500">Pay using any UPI app</p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${form.paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="paymentMethod" value="card" checked={form.paymentMethod === 'card'} onChange={handleChange} className="accent-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">💳 Credit / Debit Card</p>
                        <p className="text-sm text-gray-500">Visa, Mastercard, RuPay</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right: Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-5">🧾 Order Summary</h3>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.image_url ? <img src={item.image_url} alt={item.title} className="w-12 h-12 object-cover rounded-lg" /> : <span>📦</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Delivery</span>
                      <span>FREE</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                      <span>Total</span>
                      <span>₹{cartTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <button
  onClick={() => {
    localStorage.setItem('checkout_cart', JSON.stringify(cart));
    router.push('/checkout');
  }}
  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 text-lg"
>
  Proceed to Checkout →
</button>
                  <p className="text-center text-xs text-gray-400 mt-3">🔒 Secure & encrypted checkout</p>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
