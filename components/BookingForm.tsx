import React, { useState } from 'react';
import { hotelService } from '../services/hotelService';
import { ROOM_CATEGORIES, MAX_FLOORS } from '../constants';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface BookingFormProps {
  onSuccess: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    age: '',
    floor: 1,
    category: 1,
    daysOfStay: 1,
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    const age = parseInt(formData.age);
    if (age < 18) {
      setStatus('error');
      setMessage('You must be 18 or above to book a room.');
      return;
    }

    try {
      const leavingDate = new Date();
      leavingDate.setDate(leavingDate.getDate() + parseInt(formData.daysOfStay.toString()));

      const roomNo = await hotelService.allocateRoom(
        {
          name: formData.name,
          phoneNumber: parseInt(formData.phoneNumber),
          age: age,
          leavingDate: leavingDate.toISOString(),
        },
        parseInt(formData.floor.toString()),
        parseInt(formData.category.toString())
      );

      if (roomNo) {
        setStatus('success');
        setMessage(`Room Assigned: ${roomNo}`);
        setFormData({ name: '', phoneNumber: '', age: '', floor: 1, category: 1, daysOfStay: 1 });
        onSuccess();
      } else {
        setStatus('error');
        setMessage('No rooms available for this floor and category. Please try another.');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('An error occurred during booking.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-semibold mb-4 text-slate-800">New Reservation</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Guest Name</label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Phone Number</label>
            <input
              required
              type="number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="1234567890"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Age</label>
          <input
            required
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="Age"
          />
        </div>

        <hr className="my-2 border-slate-100" />

        {/* Room Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Preferred Floor</label>
            <select
              name="floor"
              value={formData.floor}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {Array.from({ length: MAX_FLOORS }, (_, i) => i + 1).map(f => (
                <option key={f} value={f}>Floor {f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Room Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {Object.values(ROOM_CATEGORIES).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name} (${cat.price})</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Duration (Days)</label>
          <input
            required
            type="number"
            min="1"
            name="daysOfStay"
            value={formData.daysOfStay}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' && <Loader2 className="animate-spin h-5 w-5" />}
            {status === 'loading' ? 'Processing...' : 'Allocate Room'}
          </button>
        </div>

        {status === 'success' && (
          <div className="p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 text-sm">
            <CheckCircle className="h-5 w-5" />
            {message}
          </div>
        )}

        {status === 'error' && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
            <XCircle className="h-5 w-5" />
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default BookingForm;