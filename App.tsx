import React, { useEffect, useState } from 'react';
import { hotelService } from './services/hotelService';
import { RoomAvailability, CustomerDetails } from './types';
import { isSupabaseConfigured } from './services/supabaseClient';
import { SUPABASE_SCHEMA_INSTRUCTIONS } from './constants';
import { LayoutDashboard, Hotel, BookOpen, Users, Database, AlertCircle, ShieldAlert } from 'lucide-react';

import BookingForm from './components/BookingForm';
import RoomGrid from './components/RoomGrid';
import Dashboard from './components/Dashboard';
import CustomersList from './components/CustomersList';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'booking' | 'rooms' | 'customers' | 'setup'>('dashboard');
  const [rooms, setRooms] = useState<RoomAvailability[]>([]);
  const [customers, setCustomers] = useState<CustomerDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState(false);

  const formatError = (e: any): string => {
      if (typeof e === 'string') return e;
      if (e instanceof Error) return e.message;
      if (typeof e === 'object' && e !== null) {
          // Attempt to extract known Supabase fields
          if (e.message) return e.message;
          if (e.error_description) return e.error_description;
          if (e.details) return `${e.message || 'Error'}: ${e.details}`;
          // Fallback to stringify
          try {
              return JSON.stringify(e, null, 2);
          } catch (jsonErr) {
              return "Unknown Error (Object could not be stringified)";
          }
      }
      return "An unexpected error occurred";
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      setPermissionError(false);
      
      // Attempt to initialize/seed rooms. 
      try {
        await hotelService.initializeRooms();
      } catch (initError) {
        if (initError instanceof Error && initError.message === 'DATABASE_RLS_ERROR') {
            setPermissionError(true);
            setActiveTab('setup');
        } else {
            console.warn("Initialization skipped due to error:", initError);
        }
      }

      // Fetch Data
      const [roomsData, customersData] = await Promise.all([
        hotelService.getRooms(),
        hotelService.getCustomers()
      ]);
      
      setRooms(roomsData);
      setCustomers(customersData);

    } catch (e: any) {
      console.error("Failed to load data:", e);
      if (e.message === 'DATABASE_RLS_ERROR' || (e.code && e.code === '42501')) {
          setPermissionError(true);
          setActiveTab('setup'); // Force user to setup tab to fix it
      } else {
          setError(formatError(e));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh expiry status every minute
    const interval = setInterval(() => loadData(), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleBookingSuccess = () => {
    loadData();
    setActiveTab('rooms');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-slate-800">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Hotel className="text-blue-400" />
            Azure Horizon
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Hotel Manager</p>
        </div>
        
        <nav className="mt-6 px-3 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab('booking')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'booking' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <BookOpen className="w-5 h-5" />
            New Booking
          </button>

          <button 
            onClick={() => setActiveTab('rooms')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'rooms' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <Hotel className="w-5 h-5" />
            Room Status
          </button>

          <button 
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'customers' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <Users className="w-5 h-5" />
            Customers
          </button>

          <div className="pt-8 mt-8 border-t border-slate-800">
            <button 
              onClick={() => setActiveTab('setup')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'setup' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
            >
              <Database className="w-5 h-5" />
              Database Setup
            </button>
          </div>
        </nav>

        {!isSupabaseConfigured && (
           <div className="mx-4 mt-auto mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
             <p className="text-xs text-yellow-400 font-semibold mb-1">Demo Mode</p>
             <p className="text-xs text-slate-400">
               Running with local data. Configure Supabase in code to persist data.
             </p>
           </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-50">
        <div className="max-w-7xl mx-auto">
          
          <header className="mb-8 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800 capitalize">
              {activeTab === 'setup' ? 'Database Configuration' : activeTab}
            </h2>
            <div className="text-sm text-slate-500">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </header>

          {permissionError && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <ShieldAlert className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                      <h3 className="text-lg font-bold text-slate-800">Database Permissions Missing</h3>
                      <p className="text-slate-600 text-sm mt-1">
                          Your database tables exist, but the application cannot read or write to them due to Row Level Security (RLS) policies.
                      </p>
                      <p className="text-slate-600 text-sm mt-2 font-medium">
                          Please run the SQL script below in your Supabase SQL Editor to fix this.
                      </p>
                  </div>
              </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <div className="inline-flex p-3 rounded-full bg-red-100 text-red-600 mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Failed to Load Data</h3>
              <p className="text-slate-600 mb-6 font-mono text-sm whitespace-pre-wrap max-w-2xl mx-auto text-left bg-white p-4 rounded border border-red-100 overflow-x-auto">
                {error}
              </p>
              <button 
                onClick={loadData}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="fade-in">
              {activeTab === 'dashboard' && <Dashboard rooms={rooms} />}
              
              {activeTab === 'booking' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <BookingForm onSuccess={handleBookingSuccess} />
                  </div>
                  <div className="lg:col-span-2">
                     <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Room Availability</h3>
                     <RoomGrid rooms={rooms} />
                  </div>
                </div>
              )}
              
              {activeTab === 'rooms' && <RoomGrid rooms={rooms} />}
              
              {activeTab === 'customers' && <CustomersList customers={customers} />}

              {activeTab === 'setup' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold mb-4">Supabase Integration Guide</h3>
                  
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                       <span className={`w-3 h-3 rounded-full ${isSupabaseConfigured ? 'bg-green-500' : 'bg-red-500'}`}></span>
                       <span className="font-medium text-slate-700">Status: {isSupabaseConfigured ? 'Connected' : 'Not Configured (Using Local Mock)'}</span>
                    </div>
                    <p className="text-slate-600 mb-4">
                      To persist data, create a project at <a href="https://supabase.com" target="_blank" className="text-blue-600 hover:underline">Supabase.com</a> and add your URL/Key to the environment variables.
                    </p>
                  </div>

                  <h4 className="font-medium text-slate-800 mb-2 flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      SQL Schema & Permissions
                  </h4>
                  <p className="text-sm text-slate-500 mb-2">Copy and run this in your Supabase SQL Editor to create tables and <strong>fix permission errors</strong>:</p>
                  <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm font-mono select-all">
                    {SUPABASE_SCHEMA_INSTRUCTIONS}
                  </pre>
                  <p className="text-xs text-slate-500 mt-2">
                      Note: Select all text above, copy it, and paste it into the SQL Editor in your Supabase dashboard. Click "Run".
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;