'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { BiPlus, BiDownload, BiTrash, BiArrowBack } from 'react-icons/bi';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { TableSkeleton } from '@/components/Common/Skeleton';

interface RoomAssignment {
  id: number;
  pilgrim_name: string;
  pilgrim_gender: string;
  room_number: string;
  hotel_name: string;
  check_in_date: string;
  check_out_date: string;
  days_stay: number;
  status: string;
}

interface Filters {
  hotel: string;
  status: string;
  check_in_date: string;
}

export default function RoomAssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<RoomAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState<any[]>([]);

  const [filters, setFilters] = useState<Filters>({
    hotel: '',
    status: '',
    check_in_date: '',
  });

  useEffect(() => {
    fetchAssignments();
    fetchHotels();
  }, [filters]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      let url = '/room-assignments/';
      const params = new URLSearchParams();

      if (filters.hotel) params.append('room__hotel', filters.hotel);
      if (filters.status) params.append('status', filters.status);
      if (filters.check_in_date) params.append('check_in_date', filters.check_in_date);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await api.get(url);
      setAssignments(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchHotels = async () => {
    try {
      const response = await api.get('/hotels/?status=active');
      setHotels(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch hotels:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return;
    try {
      await api.delete(`/room-assignments/${id}/`);
      toast.success('Assignment removed');
      fetchAssignments();
    } catch (error) {
      toast.error('Failed to remove assignment');
    }
  };

  const handleExport = async () => {
    try {
      const data = assignments.map((a) => ({
        'Pilgrim Name': a.pilgrim_name,
        'Gender': a.pilgrim_gender,
        'Room': a.room_number,
        'Hotel': a.hotel_name,
        'Check-in': a.check_in_date,
        'Check-out': a.check_out_date,
        'Status': a.status,
      }));

      const csv = [
        Object.keys(data[0]).join(','),
        ...data.map((row) => Object.values(row).map((v) => `"${v}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `room-assignments-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast.success('Assignments exported');
    } catch (error) {
      toast.error('Failed to export assignments');
    }
  };

  const genderColors: Record<string, string> = {
    M: 'bg-blue-50 text-blue-700',
    F: 'bg-pink-50 text-pink-700',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700',
    checked_out: 'bg-gray-50 text-gray-700',
    cancelled: 'bg-red-50 text-red-700',
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
              >
                <BiArrowBack size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-semibold text-gray-900">Room Assignments</h1>
                <p className="text-sm text-gray-600 mt-1">{assignments.length} pilgrims assigned</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleExport()}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <BiDownload size={18} /> Export
              </button>
              <button
                onClick={() => router.push('/dashboard/accommodations/room-assignment')}
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
              value={filters.hotel}
              onChange={(e) => setFilters({ ...filters, hotel: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
            >
              <option value="">All Hotels</option>
              {hotels.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="checked_out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <input
              type="date"
              value={filters.check_in_date}
              onChange={(e) => setFilters({ ...filters, check_in_date: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />

            <button
              onClick={() =>
                setFilters({
                  hotel: '',
                  status: '',
                  check_in_date: '',
                })
              }
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {loading ? (
            <TableSkeleton rows={8} columnCount={8} />
          ) : assignments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Pilgrim Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Hotel</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Check-in</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Check-out</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{assignment.pilgrim_name}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${genderColors[assignment.pilgrim_gender]}`}>
                          {assignment.pilgrim_gender === 'M' ? 'Male' : 'Female'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm font-mono text-gray-900">{assignment.room_number}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{assignment.hotel_name}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{assignment.check_in_date}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{assignment.check_out_date}</td>
                      <td className="px-6 py-3 text-sm text-gray-600 text-center">{assignment.days_stay}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[assignment.status]}`}>
                          {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <button
                          onClick={() => handleDelete(assignment.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                        >
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
                onClick={() => router.push('/dashboard/accommodations/room-assignment')}
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
