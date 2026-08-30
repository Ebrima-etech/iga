'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { BiArrowBack, BiCheck, BiX } from 'react-icons/bi';
import { useHajjYear } from '@/lib/stores/hajjYearStore';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface Hotel {
  id: number;
  name: string;
  city: string;
  total_rooms: number;
}

interface Assignment {
  id: number;
  pilgrim_name: string;
  room_number: string;
  check_in_date: string;
  check_out_date: string;
}

const steps = [
  { id: 1, title: 'Hotel Selection', description: 'Choose accommodation facility' },
  { id: 2, title: 'Assignment Rules', description: 'Configure grouping preferences' },
  { id: 3, title: 'Review', description: 'Verify assignments before confirmation' },
];

export default function RoomAssignmentPage() {
  const router = useRouter();
  const { selectedHajjYear } = useHajjYear();
  const [currentStep, setCurrentStep] = useState(1);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    hotel_id: '',
    check_in_date: new Date().toISOString().split('T')[0],
    days_stay: 3,
    people_per_room: 2,
    gender_segregation: true,
  });

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await api.get('/hotels/?status=active');
      setHotels(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch hotels:', error);
      toast.error('Failed to load hotels');
    }
  };

  const handleNext = async () => {
    if (currentStep === 2) {
      // Generate assignments
      await generateAssignments();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const generateAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.post('/room-assignments/auto-assign/', {
        hotel_id: formData.hotel_id,
        check_in_date: formData.check_in_date,
        days_stay: formData.days_stay,
        people_per_room: formData.people_per_room,
        gender_segregation: formData.gender_segregation,
        hajj_year: selectedHajjYear,
      });

      setAssignments(response.data.assignments || []);
      setCurrentStep(3);
    } catch (error: any) {
      console.error('Assignment generation failed:', error);
      toast.error(error.response?.data?.error || 'Failed to generate assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      // Assignments are already created in auto-assign
      toast.success(`${assignments.length} pilgrims assigned successfully!`);
      router.push('/dashboard/accommodations/room-assignments');
    } catch (error) {
      toast.error('Failed to confirm assignments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
            >
              <BiArrowBack size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Room Assignment Wizard</h1>
              <p className="text-sm text-gray-600 mt-1">Automatically assign pilgrims to hotel rooms</p>
            </div>
          </div>
        </div>

        {/* Steps Indicator */}
        <div className="mb-8">
          <div className="flex gap-4">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentStep >= step.id ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.id ? <BiCheck size={20} /> : step.id}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-600">{step.description}</p>
                </div>
                {step.id < steps.length && (
                  <div className={`flex-1 h-0.5 ${currentStep > step.id ? 'bg-black' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Hotel Selection */}
        {currentStep === 1 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Select Hotel</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hotel</label>
                <select
                  value={formData.hotel_id}
                  onChange={(e) => setFormData({ ...formData, hotel_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  required
                >
                  <option value="">Choose a hotel...</option>
                  {hotels.map((hotel) => (
                    <option key={hotel.id} value={hotel.id}>
                      {hotel.name} ({hotel.city}) - {hotel.total_rooms} rooms
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => handleNext()}
                disabled={!formData.hotel_id}
                className="px-6 py-2 bg-black hover:bg-gray-900 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Assignment Rules */}
        {currentStep === 2 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Configure Assignment Rules</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                <input
                  type="date"
                  value={formData.check_in_date}
                  onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Days of Stay</label>
                <input
                  type="number"
                  value={formData.days_stay}
                  onChange={(e) => setFormData({ ...formData, days_stay: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">People Per Room</label>
                <select
                  value={formData.people_per_room}
                  onChange={(e) => setFormData({ ...formData, people_per_room: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                >
                  <option value={1}>1 person</option>
                  <option value={2}>2 people</option>
                  <option value={3}>3 people</option>
                  <option value={4}>4 people</option>
                </select>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="gender_segregation"
                  checked={formData.gender_segregation}
                  onChange={(e) => setFormData({ ...formData, gender_segregation: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="gender_segregation" className="text-sm text-gray-700">
                  Segregate rooms by gender (same gender per room)
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => handleNext()}
                disabled={loading}
                className="px-6 py-2 bg-black hover:bg-gray-900 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {loading ? 'Generating...' : 'Generate Assignments'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Review Assignments</h2>
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-emerald-700">
                <span className="font-semibold">{assignments.length}</span> pilgrims have been assigned to rooms
              </p>
            </div>

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Pilgrim Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Room</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Check-in</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Check-out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignments.slice(0, 20).map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">{assignment.pilgrim_name}</td>
                      <td className="px-4 py-3 text-gray-600">{assignment.room_number}</td>
                      <td className="px-4 py-3 text-gray-600">{assignment.check_in_date}</td>
                      <td className="px-4 py-3 text-gray-600">{assignment.check_out_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {assignments.length > 20 && (
                <p className="text-sm text-gray-600 mt-2">...and {assignments.length - 20} more</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => handleConfirm()}
                disabled={loading}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <BiCheck size={18} /> Confirm & Create Assignments
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
