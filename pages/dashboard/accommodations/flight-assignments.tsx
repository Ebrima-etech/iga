'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { BiPlus, BiDownload, BiTrash, BiArrowBack } from 'react-icons/bi';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { TableSkeleton } from '@/components/Common/Skeleton';

interface FlightAssignment {
  id: number;
  pilgrim_name: string;
  flight_number: string;
  departure_date: string;
  seat_number: string;
  boarding_group: string;
  status: string;
}

export default function FlightAssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<FlightAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [flights, setFlights] = useState<any[]>([]);

  const [filters, setFilters] = useState({ flight: '', status: '', boarding_group: '' });

  useEffect(() => {
    fetchAssignments();
    fetchFlights();
  }, [filters]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      let url = '/flight-assignments/';
      const params = new URLSearchParams();
      if (filters.flight) params.append('flight', filters.flight);
      if (filters.status) params.append('status', filters.status);
      if (filters.boarding_group) params.append('boarding_group', filters.boarding_group);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await api.get(url);
      setAssignments(response.data.results || response.data);
    } catch (error) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchFlights = async () => {
    try {
      const response = await api.get('/flights/');
      setFlights(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch flights');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this assignment?')) return;
    try {
      await api.delete(`/flight-assignments/${id}/`);
      toast.success('Assignment removed');
      fetchAssignments();
    } catch (error) {
      toast.error('Failed to remove assignment');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Pilgrim', 'Flight', 'Seat', 'Boarding', 'Status'].join(','),
      ...assignments.map((a) => [a.pilgrim_name, a.flight_number, a.seat_number, a.boarding_group, a.status].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flight-assignments-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Exported');
  };

  const statusColors: Record<string, string> = {
    assigned: 'bg-blue-50 text-blue-700',
    checked_in: 'bg-emerald-50 text-emerald-700',
    boarded: 'bg-gray-50 text-gray-700',
    cancelled: 'bg-red-50 text-red-700',
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600">
                <BiArrowBack size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-semibold text-gray-900">Flight Assignments</h1>
                <p className="text-sm text-gray-600 mt-1">{assignments.length} pilgrims assigned</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <BiDownload size={18} /> Export
              </button>
              <button
                onClick={() => router.push('/dashboard/accommodations/flight-assignment')}
                className="px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <BiPlus size={18} /> New Assignment
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.flight}
              onChange={(e) => setFilters({ ...filters, flight: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
            >
              <option value="">All Flights</option>
              {flights.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.flight_number}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
            >
              <option value="">All Status</option>
              <option value="assigned">Assigned</option>
              <option value="checked_in">Checked In</option>
              <option value="boarded">Boarded</option>
            </select>

            <select
              value={filters.boarding_group}
              onChange={(e) => setFilters({ ...filters, boarding_group: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
            >
              <option value="">All Groups</option>
              <option value="A">Group A</option>
              <option value="B">Group B</option>
              <option value="C">Group C</option>
            </select>

            <button
              onClick={() => setFilters({ flight: '', status: '', boarding_group: '' })}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {loading ? (
            <TableSkeleton rows={8} columnCount={6} />
          ) : assignments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Pilgrim</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Flight</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Seat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Group</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{a.pilgrim_name}</td>
                      <td className="px-6 py-3 text-sm font-mono text-gray-600">{a.flight_number}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{a.departure_date}</td>
                      <td className="px-6 py-3 text-sm font-mono text-gray-600">{a.seat_number}</td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-600">{a.boarding_group}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[a.status]}`}>
                          {a.status.charAt(0).toUpperCase() + a.status.slice(1).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <button onClick={() => handleDelete(a.id)} className="p-2 hover:bg-red-50 rounded-lg transition text-red-600">
                          <BiTrash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 text-sm mb-4">No assignments yet</p>
              <button
                onClick={() => router.push('/dashboard/accommodations/flight-assignment')}
                className="px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <BiPlus size={18} /> Create First Assignment
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
