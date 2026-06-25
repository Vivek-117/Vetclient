import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = ({ currentView, setCurrentView }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'owners', label: 'Owners', icon: '👤' },
    { id: 'pets', label: 'Pets', icon: '🐾' },
    { id: 'veterinarians', label: 'Veterinarians', icon: '👨‍⚕️' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'medical', label: 'Medical Records', icon: '💉' },
    { id: 'medicine', label: 'Medicine Stock', icon: '💊' },
    { id: 'billing', label: 'Billing', icon: '💰' }
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-200 fixed h-full z-10 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
            <img src="logo.png" width="105" height="70"></img>
          </div>
          <div>
            <h1 className="font-bold text-xl text-gray-800">Paw Care</h1>
            <p className="text-xs text-gray-500">Caring for the pets</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              currentView === item.id 
                ? 'bg-teal-50 text-teal-700 border-r-4 border-teal-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{user?.username}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="w-full py-2.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors border border-red-200"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;