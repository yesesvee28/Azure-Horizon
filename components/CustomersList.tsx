import React from 'react';
import { CustomerDetails } from '../types';
import { formatDate } from '../constants';

interface CustomersListProps {
  customers: CustomerDetails[];
}

const CustomersList: React.FC<CustomersListProps> = ({ customers }) => {
  if (customers.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500">
        No recent customer records found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
       <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Leaving Date</th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
            {customers.map((customer, idx) => (
                <tr key={customer.id || idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{customer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{customer.phoneNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{customer.age}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">{customer.roomNo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(customer.checkedInAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(customer.leavingDate)}</td>
                </tr>
            ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomersList;