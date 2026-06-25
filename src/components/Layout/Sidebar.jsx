// components/Layout/Sidebar.jsx
import AdminSidebar from './AdminSidebar';
import VetSidebar from './VetSidebar';
import NurseSidebar from './NurseSidebar';
import ReceptionSidebar from './ReceptionSidebar';
import PharmacistSidebar from './PharmacistSidebar';

const Sidebar = ({ currentView, setCurrentView, role }) => {
    switch(role) {
        case 'Admin':
            return <AdminSidebar currentView={currentView} setCurrentView={setCurrentView} />;
        case 'Veterinarian':
            return <VetSidebar currentView={currentView} setCurrentView={setCurrentView} />;
        case 'Nurse':
            return <NurseSidebar currentView={currentView} setCurrentView={setCurrentView} />;
        case 'Pharmacist':
            return <PharmacistSidebar currentView={currentView} setCurrentView={setCurrentView} />;
        default:
            return <ReceptionSidebar currentView={currentView} setCurrentView={setCurrentView} />;
    }
};

export default Sidebar;