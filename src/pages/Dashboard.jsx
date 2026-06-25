import React from 'react';
import { useDatabase } from '../hooks/useDatabase';
import StatCard from '../components/Common/StatCard';



const Dashboard = () => {
  const { data } = useDatabase();

  const stats = {
    owners: data.owners?.length || 0,
    pets: data.pets?.length || 0,
    appointments: data.appointments?.length || 0,
    todayAppointments: data.appointments?.filter(a => 
        a.Date === new Date().toLocaleDateString('en-CA')
    ).length || 0,
    pendingBills: data.bills?.filter(b => b.Status === 'Pending').length || 0,
    totalRevenue: data.bills?.reduce((sum, b) => sum + (parseFloat(b.Amount) || 0), 0) || 0
  };



  const recentAppointments = [...(data.appointments || [])]
    .sort((a, b) => b.AppointmentID - a.AppointmentID)
    .slice(0, 5);

  const recentBills = [...(data.bills || [])]
    .sort((a, b) => b.BillID - a.BillID)
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your veterinary clinic</p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Owners" value={stats.owners} icon="👤" color="bg-teal-600" />
        <StatCard title="Registered Pets" value={stats.pets} icon="🐾" color="bg-emerald-600" />
        <StatCard title="Today's Appointments" value={stats.todayAppointments} icon="📅" color="bg-cyan-600" />
        <StatCard title="Pending Bills" value={stats.pendingBills} icon="💰" color="bg-amber-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Recent Appointments</h3>
            <span className="text-sm text-teal-600 font-medium">{stats.appointments} total</span>
          </div>
          <div className="space-y-3">
            {recentAppointments.map(appt => {
              const pet = data.pets?.find(p => p.PetID === appt.PetID);
              const vet = data.veterinarians?.find(v => v.VetID === appt.VetID);
              return (
                <div key={appt.AppointmentID} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 font-bold">
                      {pet?.Name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{pet?.Name || 'Unknown Pet'}</p>
                      <p className="text-sm text-gray-500">{appt.Date} at {appt.Time}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                    {vet?.Name?.split(' ')[1] || 'Unknown'}
                  </span>
                </div>
              );
            })}
            {recentAppointments.length === 0 && (
              <p className="text-gray-400 text-center py-8">No appointments scheduled</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Recent Bills</h3>
            <span className="text-sm text-emerald-600 font-medium">₹{stats.totalRevenue.toFixed(2)} revenue</span>
          </div>
          <div className="space-y-3">
            {recentBills.map(bill => {
              const owner = data.owners?.find(o => o.OwnerID === bill.OwnerID);
              return (
                <div key={bill.BillID} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 font-bold">
                      ₹
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{owner?.Name || 'Unknown Owner'}</p>
                      <p className="text-sm text-gray-500">{bill.Date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">₹{bill.Amount}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      bill.Status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {bill.Status}
                    </span>
                  </div>
                </div>
              );
            })}
            {recentBills.length === 0 && (
              <p className="text-gray-400 text-center py-8">No bills generated yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;