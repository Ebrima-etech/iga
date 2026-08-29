'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { BiArrowBack, BiCheck, BiPlane } from 'react-icons/bi';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface Airport {
  id: number;
  code: string;
  name: string;
  city: string;
}

interface Assignment {
  id: number;
  pilgrim_name: string;
  flight_number: string;
  seat_number: string;
  boarding_group: string;
}

const steps = [
  { id: 1, title: 'Flight Selection', description: 'Choose departure and destination' },
  { id: 2, title: 'Assignment Rules', description: 'Configure assignment preferences' },
  { id: 3, title: 'Review', description: 'Verify assignments before confirmation' },
];

export default function FlightAssignmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [formData, setFormData] = useState({
    departure_date: new Date().toISOString().split('T')[0],
    arrival_airport_id: '',
    people_per_flight: 400,
    priority: 'fifo',
  });

  useEffect(() => {
    fetchAirports();
  }, []);

  const fetchAirports = async () => {
    try {
      const response = await api.get('/airports/');
      setAirports(response.data.results || response.data);
    } catch (error) {
      toast.error('Failed to load airports');
    }
  };

  const fetchFlights = async () => {
    try {
      const response = await api.get(`/flights/available-flights/?departure_date=${formData.departure_date}&arrival_airport_id=${formData.arrival_airport_id}`);
      setFlights(response.data);
    } catch (error) {
      toast.error('Failed to load available flights');
    }
  };

  const handleNext = async () => {
    if (currentStep === 2) {
      await generateAssignments();
    } else {
      if (currentStep === 1 && !formData.arrival_airport_id) {
        toast.error('Please select an airport');
        return;
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const generateAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.post('/flight-assignments/auto-assign/', {
        departure_date: formData.departure_date,
        arrival_airport_id: formData.arrival_airport_id,
        people_per_flight: formData.people_per_flight,
        priority: formData.priority,
      });

      setAssignments(response.data.assignments || []);
      setCurrentStep(3);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    toast.success(`${assignments.length} pilgrims assigned successfully!`);
    router.push('/dashboard/accommodations/flight-assignments');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600">
              <BiArrowBack size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Flight Assignment Wizard</h1>
              <p className="text-sm text-gray-600 mt-1">Automatically assign pilgrims to flights</p>
            </div>
          </div>
        </div>

        {/* Steps */}
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
              </div>
            ))}
          </div>
        </div>

        {/* Step 1 */}
        {currentStep === 1 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Select Flight Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Departure Date</label>
                <input
                  type="date"
                  value={formData.departure_date}
                  onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destination Airport</label>
                <select
                  value={formData.arrival_airport_id}
                  onChange={(e) => setFormData({ ...formData, arrival_airport_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  required
                >
                  <option value="">Choose destination...</option>
                  {airports.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} - {a.name} ({a.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => handleNext()}
                disabled={!formData.arrival_airport_id}
                className="px-6 py-2 bg-black hover:bg-gray-900 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Configure Assignment Rules</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">People Per Flight</label>
                <input
                  type="number"
                  value={formData.people_per_flight}
                  onChange={(e) => setFormData({ ...formData, people_per_flight: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                >
                  <option value="fifo">First In First Out</option>
                  <option value="family">Families Together</option>
                  <option value="age">Age Priority (Elderly First)</option>
                </select>
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

        {/* Step 3 */}
        {currentStep === 3 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Review Assignments</h2>
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-emerald-700">
                <span className="font-semibold">{assignments.length}</span> pilgrims have been assigned to flights
              </p>
            </div>

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Pilgrim</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Flight</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Seat</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Boarding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignments.slice(0, 15).map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">{a.pilgrim_name}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono">{a.flight_number}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono">{a.seat_number}</td>
                      <td className="px-4 py-3 text-gray-600 font-medium">{a.boarding_group}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {assignments.length > 15 && <p className="text-sm text-gray-600 mt-2">...and {assignments.length - 15} more</p>}
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
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <BiCheck size={18} /> Confirm Assignments
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
