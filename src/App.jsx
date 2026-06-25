import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Layout/Sidebar';
import ConnectionTest from './components/ConnectionTest';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Owners from './pages/Owners';
import Pets from './pages/Pets';
import Appointments from './pages/Appointments';
import Medical from './pages/Medical';
import Billing from './pages/Billing';
import Veterinarians from './pages/Veterinarians';
import MedicineStock from './pages/MedicineStock';

const AppContent = () => {
    const { user, loading, role } = useAuth();
    const [currentView, setCurrentView] = useState('dashboard');
    
    useEffect(() => {
        if (user) {
            setCurrentView('dashboard');
        }
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} role={role}/>
            <main className="flex-1 md:ml-72 p-4 md:p-8 overflow-auto">
                <div className="max-w-6xl mx-auto">
                    {currentView === 'dashboard' && <Dashboard />}
                    {currentView === 'owners' && <Owners />}
                    {currentView === 'pets' && <Pets />}
                    {currentView === 'appointments' && <Appointments />}
                    {currentView === 'medical' && <Medical />}
                    {currentView === 'billing' && <Billing />}
                    {currentView === 'test' && <ConnectionTest />}
                    {currentView === 'veterinarians' && <Veterinarians />}
                    {currentView === 'medicine' && <MedicineStock />}
                </div>
            </main>
        </div>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;