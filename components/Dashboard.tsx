import React from 'react';
import { RoomAvailability } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ROOM_CATEGORIES } from '../constants';
import { BedDouble, Users, DollarSign, Percent } from 'lucide-react';

interface DashboardProps {
  rooms: RoomAvailability[];
}

const Dashboard: React.FC<DashboardProps> = ({ rooms }) => {
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => !r.isAvailable).length;
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
  
  // Calculate mock revenue
  const revenue = rooms.reduce((acc, room) => {
    return !room.isAvailable ? acc + ROOM_CATEGORIES[room.category].price : acc;
  }, 0);

  // Data for Category Chart
  const categoryData = Object.values(ROOM_CATEGORIES).map(cat => {
    const catRooms = rooms.filter(r => r.category === cat.id);
    const occupied = catRooms.filter(r => !r.isAvailable).length;
    return {
      name: cat.name,
      Occupied: occupied,
      Available: catRooms.length - occupied,
      amt: occupied // for simple weighing
    };
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <BedDouble className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Rooms</p>
            <p className="text-2xl font-bold text-slate-800">{totalRooms}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Guests In-House</p>
            <p className="text-2xl font-bold text-slate-800">{occupiedRooms}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Daily Revenue</p>
            <p className="text-2xl font-bold text-slate-800">${revenue}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 rounded-full bg-amber-100 text-amber-600">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Occupancy Rate</p>
            <p className="text-2xl font-bold text-slate-800">{occupancyRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy by Category */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Occupancy by Category</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={categoryData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis hide />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Occupied" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="Available" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Room Status Overview</h3>
            <div className="h-64 flex justify-center items-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={[
                            { name: 'Occupied', value: occupiedRooms },
                            { name: 'Available', value: totalRooms - occupiedRooms },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        <Cell key="cell-occupied" fill="#f43f5e" />
                        <Cell key="cell-available" fill="#10b981" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;