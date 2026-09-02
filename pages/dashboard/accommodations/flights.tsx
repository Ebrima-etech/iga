'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { BiPlus, BiEdit, BiTrash, BiPhone } from 'react-icons/bi';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { KabaaTableSkeleton } from '@/components/Common/Skeleton';

interface Flight {
  id: number;
  airline: string;
  flight_number: string;
  departure_city: string;
  arrival_city: string;
  departure_date: string;
  arrival_date: string;
  capacity: number;
  booked_seats: number;
  status: 'active' | 'inactive' | 'cancelled';
  notes: string;
  created_at: string;
}

export default function FlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    airline: '',
    flight_number: '',
    departure_city: '',
    arrival_city: '',
    departure_date: '',
    arrival_date: '',
    capacity: 1,
    status: 'active',
    notes: '',
  });

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const response = await api.get('/flights/');
      setFlights(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch flights:', error);
      toast.error('Failed to load flights');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/flights/${editingId}/`, formData);
        toast.success('Flight updated successfully!');
      } else {
        await api.post('/flights/', formData);
        toast.success('Flight added successfully!');
      }
      setFormData({ airline: '', flight_number: '', departure_city: '', arrival_city: '', departure_date: '', arrival_date: '', capacity: 1, status: 'active', notes: '' });
      setEditingId(null);
      setShowForm(false);
      fetchFlights();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save flight');
    }
  };

  const handleEdit = (flight: Flight) => {
    setFormData({
      airline: flight.airline,
      flight_number: flight.flight_number,
      departure_city: flight.departure_city,
      arrival_city: flight.arrival_city,
      departure_date: flight.departure_date,
      arrival_date: flight.arrival_date,
      capacity: flight.capacity,
      status: flight.status,
      notes: flight.notes,
    });
    setEditingId(flight.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this flight?')) return;
    try {
      await api.delete(`/flights/${id}/`);
      toast.success('Flight deleted');
      fetchFlights();
    } catch (error) {
      toast.error('Failed to delete flight');
    }
  };

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700',
    inactive: 'bg-gray-50 text-gray-700',
    cancelled: 'bg-red-50 text-red-700',
  };

  const getAvailableSeats = (flight: Flight) => flight.capacity - flight.booked_seats;

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Flights</h1>
              <p className="text-sm text-gray-600 mt-1">Manage flight arrangements for pilgrims</p>
            </div>
            <button
              onClick={() => {
                setFormData({ airline: '', flight_number: '', departure_city: '', arrival_city: '', departure_date: '', arrival_date: '', capacity: 1, status: 'active', notes: '' });
                setEditingId(null);
                setShowForm(true);
              }}
              className="px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <BiPlus size={18} /> Add Flight
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">{editingId ? 'Edit Flight' : 'Add New Flight'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Airline Name"
                value={formData.airline}
                onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                required
              />
              <input
                type="text"
                placeholder="Flight Number"
                value={formData.flight_number}
                onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                required
              />
              <input
                type="text"
                placeholder="Departure City"
                value={formData.departure_city}
                onChange={(e) => setFormData({ ...formData, departure_city: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                required
              />
              <input
                type="text"
                placeholder="Arrival City"
                value={formData.arrival_city}
                onChange={(e) => setFormData({ ...formData, arrival_city: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                required
              />
              <input
                type="datetime-local"
                placeholder="Departure Date"
                value={formData.departure_date}
                onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                required
              />
              <input
                type="datetime-local"
                placeholder="Arrival Date"
                value={formData.arrival_date}
                onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                required
              />
              <input
                type="number"
                placeholder="Capacity"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
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
                <option value="cancelled">Cancelled</option>
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
                  {editingId ? 'Update Flight' : 'Add Flight'}
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

        {/* Flights Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {loading ? (
            <KabaaTableSkeleton rows={5} columnCount={8} />
          ) : flights.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Flight</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Departure</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Arrival</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Seats</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {flights.map((flight) => (
                    <tr key={flight.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {flight.airline} {flight.flight_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{flight.departure_city} → {flight.arrival_city}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(flight.departure_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(flight.arrival_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="font-medium">{getAvailableSeats(flight)}</span>/{flight.capacity}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[flight.status]}`}>
                          {flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(flight)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
                          >
                            <BiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(flight.id)}
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
              <p className="text-gray-500 text-sm mb-4">No flights added yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <BiPlus size={18} /> Add First Flight
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
