'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Clock,
  Search,
  Download,
  Eye,
  X,
  Trash2,
  CheckCircle,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { useShop } from '@/components/site-shell';
import { formatCurrency } from '@/lib/shop-data';
import type { Order } from '@/lib/types';

export default function AdminDashboardPro() {
  const { orders, settings, adminAuthenticated, setAdminAuthenticated, deleteOrder } = useShop();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'value'>('recent');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setIsRefreshing(true);
      // Trigger re-fetch by toggling state
      setTimeout(() => setIsRefreshing(false), 500);
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.length; // All orders are pending until marked complete
    const averageOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;
    const todayOrders = orders.filter((o) => {
      const today = new Date().toDateString();
      const orderDate = new Date(o.createdAt).toDateString();
      return today === orderDate;
    }).length;

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      averageOrderValue,
      todayOrders,
    };
  }, [orders]);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = orders.filter(
      (order) =>
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.phone.includes(searchQuery) ||
        order.id.includes(searchQuery)
    );

    switch (sortBy) {
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'value':
        return filtered.sort((a, b) => b.total - a.total);
      case 'recent':
      default:
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [orders, searchQuery, sortBy]);

  // Handle delete order
  const handleDeleteOrder = async (orderId: string) => {
    if (!deletePassword) {
      alert('Please enter your admin password');
      return;
    }

    const success = await deleteOrder(orderId, deletePassword);
    if (success) {
      setDeleteConfirm(null);
      setDeletePassword('');
    } else {
      alert('Incorrect password or failed to delete order');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setAdminAuthenticated(false);
    window.localStorage.setItem('artique-admin-auth', JSON.stringify(false));
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{settings.brandName}</h1>
            <p className="text-sm text-slate-600 mt-1">Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                autoRefresh
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <RefreshCw size={18} className={autoRefresh ? 'animate-spin' : ''} />
              Auto-Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Revenue */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Revenue</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Orders</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalOrders}</p>
                <p className="text-xs text-slate-500 mt-2">{stats.todayOrders} today</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <ShoppingCart size={24} />
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Pending Orders</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.pendingOrders}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                <Clock size={24} />
              </div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Avg Order Value</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {formatCurrency(stats.averageOrderValue)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl text-green-600">
                <BarChart3 size={24} />
              </div>
            </div>
          </div>

          {/* Growth */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Status</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {autoRefresh ? '🔄' : '⏸️'}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {autoRefresh ? 'Live Sync' : 'Manual'}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                <Eye size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table Section */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="border-b border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Recent Orders</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 font-semibold">
                  {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                </span>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by customer name, phone, or order ID..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'oldest' | 'value')}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="recent">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="value">Highest Value</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingCart size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm font-mono font-semibold text-slate-900">{order.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{order.customerName}</div>
                        <div className="text-xs text-slate-500">{order.address}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{order.phone}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{formatCurrency(order.total)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600 hover:text-slate-900"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteConfirm(order.id);
                              setDeletePassword('');
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg transition text-red-600 hover:text-red-700"
                            title="Delete Order"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-amber-50 to-slate-50 border-b border-slate-200 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Order Details</h2>
                <p className="text-sm text-slate-600 mt-1">Order ID: {selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={24} className="text-slate-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8">
              {/* Customer Information */}
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-amber-500 rounded" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 rounded-xl p-6">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 mb-1">Customer Name</p>
                    <p className="text-lg font-bold text-slate-900">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 mb-1">Phone Number</p>
                    <p className="text-lg font-bold text-slate-900">{selectedOrder.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-semibold text-slate-600 mb-1">Delivery Address</p>
                    <p className="text-lg font-bold text-slate-900">{selectedOrder.address || 'Not provided'}</p>
                  </div>
                  {selectedOrder.notes && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-semibold text-slate-600 mb-1">Special Instructions</p>
                      <p className="text-base text-slate-700">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Order Items */}
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-500 rounded" />
                  Ordered Items
                </h3>
                <div className="space-y-3 bg-slate-50 rounded-xl p-6">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between pb-3 border-b border-slate-200 last:border-b-0">
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <div className="text-sm text-slate-600 mt-1 space-y-1">
                          <p>Color: {item.color || 'Not specified'}</p>
                          <p>Size: {item.size || 'Not specified'}</p>
                          <p>Quantity: {item.quantity}</p>
                          {item.customText && <p>Custom Text: {item.customText}</p>}
                          {item.customImageUrl && <p>Reference Image: ✓</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{formatCurrency(item.price)}</p>
                        <p className="text-sm text-slate-600 mt-1">each</p>
                        <p className="font-bold text-amber-600 mt-2">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Order Summary */}
              <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-slate-900">Order Total</span>
                  <span className="text-3xl font-bold text-amber-600">{formatCurrency(selectedOrder.total)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Order Date: {formatDate(selectedOrder.createdAt)}</span>
                  <span>Items: {selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    const text = `Order: ${selectedOrder.id}\n\nCustomer: ${selectedOrder.customerName}\nPhone: ${selectedOrder.phone}\nAddress: ${selectedOrder.address}\n\nItems:\n${selectedOrder.items
                      .map((item) => `- ${item.quantity}x ${item.name} (${item.color}, ${item.size})`)
                      .join('\n')}\n\nTotal: ${formatCurrency(selectedOrder.total)}`;
                    navigator.clipboard.writeText(text);
                    alert('Order details copied to clipboard!');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition"
                >
                  <Download size={18} />
                  Copy Details
                </button>
                <button
                  onClick={() => {
                    const whatsappNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
                    const message = encodeURIComponent(
                      `📦 Order Confirmation\n\nOrder ID: ${selectedOrder.id}\nCustomer: ${selectedOrder.customerName}\n\nItems:\n${selectedOrder.items
                        .map((item) => `• ${item.quantity}x ${item.name}`)
                        .join('\n')}\n\nTotal: ${formatCurrency(selectedOrder.total)}\n\nDelivery Address: ${selectedOrder.address}`
                    );
                    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition"
                >
                  Send via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Delete Order?</h2>
            <p className="text-slate-600 mb-6">
              This action cannot be undone. Enter your admin password to confirm deletion.
            </p>

            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Admin password"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteConfirm(null);
                  setDeletePassword('');
                }}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-900 font-semibold rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteOrder(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
