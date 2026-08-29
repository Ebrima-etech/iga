'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { BiPlus, BiEdit, BiTrash, BiPlane } from 'react-icons/bi';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { TableSkeleton } from '@/components/Common/Skeleton';

interface Airport {
  id: number;
  code: string;
  name: string;
  city: string;
}

interface Flight {
  id: number;
  flight_number: string;
  airline: string;
  departure_airport: number;
  departure_airport_code: string;
  arrival_airport: number;
  arrival_airport_code: string;
  departure_date: string;
  departure_time: string;
  arrival_date: string;
  arrival_time: string;
  aircraft_type: string;
  total_capacity: number;
  assigned_count: number;
  available_seats: number;
  status: 'scheduled' | 'confirmed' | 'departed' | 'completed' | 'cancelled';
  notes: string;
}

export default function FlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    flight_number: '',
    airline: '',
    departure_airport: '',
    arrival_airport: '',
    departure_date: '',
    departure_time: '',
    arrival_date: '',
    arrival_time: '',
    aircraft_type: 'B777',
    total_capacity: 300,
    status: 'scheduled',
    notes: '',
  });

  useEffect(() => {
    fetchFlights();
    fetchAirports();
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

  const fetchAirports = async () => {
    try {
      const response = await api.get('/airports/');
      setAirports(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch airports:', error);
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
      resetForm();
      fetchFlights();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save flight');
    }
  };

  const handleEdit = (flight: Flight) => {
    setFormData({
      flight_number: flight.flight_number,
      airline: flight.airline,
      departure_airport: flight.departure_airport.toString(),
      arrival_airport: flight.arrival_airport.toString(),
      departure_date: flight.departure_date,
      departure_time: flight.departure_time,
      arrival_date: flight.arrival_date,
      arrival_time: flight.arrival_time,
      aircraft_type: flight.aircraft_type,
      total_capacity: flight.total_capacity,
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

  const resetForm = () => {
    setFormData({
      flight_number: '',
      airline: '',
      departure_airport: '',
      arrival_airport: '',
      departure_date: '',
      departure_time: '',
      arrival_date: '',
      arrival_time: '',
      aircraft_type: 'B777',
      total_capacity: 300,
      status: 'scheduled',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-50 text-blue-700',
    confirmed: 'bg-emerald-50 text-emerald-700',
    departed: 'bg-amber-50 text-amber-700',
    completed: 'bg-gray-50 text-gray-700',
    cancelled: 'bg-red-50 text-red-700',
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Flights</h1>
              <p className="text-sm text-gray-600 mt-1">Manage flight schedules and assignments</p>
            </div>
            <button
              onClick={() => {
                setFormData({
                  flight_number: '',
                  airline: '',
                  departure_airport: '',
                  arrival_airport: '',
                  departure_date: '',
                  departure_time: '',
                  arrival_date: '',
                  arrival_time: '',
                  aircraft_type: 'B777',
                  total_capacity: 300,
                  status: 'scheduled',
                  notes: '',
                });
                setEditingId(null);
                setShowForm(true);
              }}
              className="px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <BiPlane size={18} /> Add Flight
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">{editingId ? 'Edit Flight' : 'Add New Flight'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Flight Number (GA101)"
                value={formData.flight_number}
                onChange={(e) => setFormData({ ...formData, flight_number: e.target.value.toUpperCase() })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                required
              />
              <input
                type="text"
                placeholder="Airline"
                value={formData.airline}
                onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                required
              />
              <select
                value={formData.departure_airport}
                onChange={(e) => setFormData({ ...formData, departure_airport: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                required
              >
                <option value="">Departure Airport</option>
                {airports.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} - {a.name}
                  </option>
                ))}
              </select>
              <select
                value={formData.arrival_airport}
                onChange={(e) => setFormData({ ...formData, arrival_airport: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                required
              >
                <option value="">Arrival Airport</option>
                {airports.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} - {a.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={formData.departure_date}
                onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                required
              />
              <input
                type="time"
                value={formData.departure_time}
                onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                required
              />
              <input
                type="date"
                value={formData.arrival_date}
                onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                required
              />
              <input
                type="time"
                value={formData.arrival_time}
                onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                required
              />
              <select
                value={formData.aircraft_type}
                onChange={(e) => setFormData({ ...formData, aircraft_type: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
              >
                <option value="B777">Boeing 777</option>
                <option value="B787">Boeing 787</option>
                <option value="A380">Airbus A380</option>
                <option value="A350">Airbus A350</option>
                <option value="A320">Airbus A320</option>
                <option value="B737">Boeing 737</option>
              </select>
              <input
                type="number"
                placeholder="Capacity"
                value={formData.total_capacity}
                onChange={(e) => setFormData({ ...formData, total_capacity: parseInt(e.target.value) })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                min="1"
                required
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
              >
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="departed">Departed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <textarea
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm lg:col-span-3"
                rows={2}
              />
              <div className="flex gap-3 lg:col-span-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {editingId ? 'Update Flight' : 'Add Flight'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
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
            <TableSkeleton rows={6} columnCount={8} />
          ) : flights.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-600">Flight #</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-600">Route</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-600">Departure</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-600">Aircraft</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-600">Capacity</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-600">Assigned</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-600">Status</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {flights.map((flight) => (
                    <tr key={flight.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-3 font-mono font-medium text-gray-900">{flight.flight_number}</td>
                      <td className="px-6 py-3 text-gray-600">
                        {flight.departure_airport_code} → {flight.arrival_airport_code}
                      </td>
                      <td className="px-6 py-3 text-gray-600">{flight.departure_date} {flight.departure_time}</td>
                      <td className="px-6 py-3 text-gray-600">{flight.aircraft_type}</td>
                      <td className="px-6 py-3 text-gray-600 font-medium">{flight.total_capacity}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(flight.assigned_count / flight.total_capacity) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium">{flight.assigned_count}/{flight.total_capacity}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[flight.status]}`}>
                          {flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-3">
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
                <BiPlane size={18} /> Add First Flight
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
