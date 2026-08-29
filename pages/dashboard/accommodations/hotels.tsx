'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { BiPlus, BiEdit, BiTrash, BiMapPin, BiPhone, BiMail } from 'react-icons/bi';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { KabaaTableSkeleton } from '@/components/Common/Skeleton';

interface Hotel {
  id: number;
  name: string;
  location: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  total_rooms: number;
  rooms_count: number;
  status: 'active' | 'inactive' | 'maintenance';
  notes: string;
  created_at: string;
}

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    total_rooms: 1,
    status: 'active',
    notes: '',
  });

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hotels/');
      setHotels(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch hotels:', error);
      toast.error('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/hotels/${editingId}/`, formData);
        toast.success('Hotel updated successfully!');
      } else {
        await api.post('/hotels/', formData);
        toast.success('Hotel added successfully!');
      }
      setFormData({ name: '', location: '', city: '', country: '', phone: '', email: '', total_rooms: 1, status: 'active', notes: '' });
      setEditingId(null);
      setShowForm(false);
      fetchHotels();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save hotel');
    }
  };

  const handleEdit = (hotel: Hotel) => {
    setFormData({
      name: hotel.name,
      location: hotel.location,
      city: hotel.city,
      country: hotel.country,
      phone: hotel.phone,
      email: hotel.email,
      total_rooms: hotel.total_rooms,
      status: hotel.status,
      notes: hotel.notes,
    });
    setEditingId(hotel.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return;
    try {
      await api.delete(`/hotels/${id}/`);
      toast.success('Hotel deleted');
      fetchHotels();
    } catch (error) {
      toast.error('Failed to delete hotel');
    }
  };

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700',
    inactive: 'bg-gray-50 text-gray-700',
    maintenance: 'bg-amber-50 text-amber-700',
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Hotels</h1>
              <p className="text-sm text-gray-600 mt-1">Manage accommodation facilities for pilgrims</p>
            </div>
            <button
              onClick={() => {
                setFormData({ name: '', location: '', city: '', country: '', phone: '', email: '', total_rooms: 1, status: 'active', notes: '' });
                setEditingId(null);
                setShowForm(true);
              }}
              className="px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <BiPlus size={18} /> Add Hotel
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">{editingId ? 'Edit Hotel' : 'Add New Hotel'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Hotel Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                required
              />
              <input
                type="text"
                placeholder="Location/Address"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                required
              />
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                required
              />
              <input
                type="text"
                placeholder="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
              <input
                type="number"
                placeholder="Total Rooms"
                value={formData.total_rooms}
                onChange={(e) => setFormData({ ...formData, total_rooms: parseInt(e.target.value) })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                min="1"
                required
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <textarea
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm md:col-span-2"
                rows={3}
              />
              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {editingId ? 'Update Hotel' : 'Add Hotel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Hotels Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {loading ? (
            <KabaaTableSkeleton rows={5} columnCount={7} />
          ) : hotels.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Hotel Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">City</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Rooms</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {hotels.map((hotel) => (
                    <tr key={hotel.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{hotel.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                        <BiMapPin size={16} className="text-gray-400" /> {hotel.location}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{hotel.city}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="font-medium">{hotel.rooms_count}</span>/{hotel.total_rooms}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[hotel.status]}`}>
                          {hotel.status.charAt(0).toUpperCase() + hotel.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex flex-col gap-1">
                          {hotel.phone && <span className="flex items-center gap-1"><BiPhone size={14} /> {hotel.phone}</span>}
                          {hotel.email && <span className="flex items-center gap-1"><BiMail size={14} /> {hotel.email}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(hotel)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
                          >
                            <BiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(hotel.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                          >
                            <BiTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 text-sm mb-4">No hotels added yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <BiPlus size={18} /> Add First Hotel
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
