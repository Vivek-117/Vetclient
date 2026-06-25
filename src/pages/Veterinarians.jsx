import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Common/Modal';
import Input from '../components/Common/Input';

const Veterinarians = () => {
    const [veterinarians, setVeterinarians] = useState([]);
    const [selectedVet, setSelectedVet] = useState(null);
    const [vetDetails, setVetDetails] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [formData, setFormData] = useState({
        Name: '',
        Qualification: '',
        Phone: ''
    });

    useEffect(() => {
        fetchVeterinarians();
    }, []);

    const fetchVeterinarians = async () => {
        try {
            const data = await api.getVeterinarians();
            setVeterinarians(data);
        } catch (error) {
            console.error('Failed to fetch veterinarians:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.createVeterinarian(formData);
            setFormData({ Name: '', Qualification: '', Phone: '' });
            setIsModalOpen(false);
            fetchVeterinarians();
        } catch (error) {
            alert('Failed to create veterinarian: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this veterinarian?')) return;
        try {
            await api.deleteVeterinarian(id);
            fetchVeterinarians();
        } catch (error) {
            alert('Failed to delete: ' + error.message);
        }
    };

    const viewDetails = async (vet) => {
        try {
            const details = await api.getVeterinarian(vet.VetID);
            setSelectedVet(vet);
            setVetDetails(details);
            setIsDetailsOpen(true);
        } catch (error) {
            alert('Failed to load details: ' + error.message);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'Scheduled': return 'bg-blue-100 text-blue-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Veterinarian Management</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage doctors and view their schedules</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)} 
                    className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-teal-700 transition-all hover:shadow-lg flex items-center gap-2"
                >
                    <span className="text-xl">+</span> Add Veterinarian
                </button>
            </div>

            {/* Veterinarians Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {veterinarians.map(vet => (
                    <div 
                        key={vet.VetID} 
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => viewDetails(vet)}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl flex items-center justify-center text-3xl">
                                👨‍⚕️
                            </div>
                            <div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(vet.VetID);
                                    }}
                                    className="bg-red-me text-white hover:bg-red-50 px-6 py-2 rounded-lg transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-800 mb-1">{vet.Name}</h3>
                        <p className="text-teal-600 font-medium text-sm mb-3">{vet.Qualification}</p>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                                <span>📞</span> {vet.Phone}
                            </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-800">{vet.appointment_count || 0}</p>
                                <p className="text-xs text-gray-500">Total Appointments</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-teal-600">{vet.today_appointments || 0}</p>
                                <p className="text-xs text-gray-500">Today</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {veterinarians.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-400 text-lg">No veterinarians registered</p>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Veterinarian">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input 
                        label="Full Name" 
                        name="Name" 
                        value={formData.Name}
                        onChange={(e) => setFormData({...formData, Name: e.target.value})}
                        required 
                        placeholder="Dr. John Smith"
                    />
                    <Input 
                        label="Qualification" 
                        name="Qualification" 
                        value={formData.Qualification}
                        onChange={(e) => setFormData({...formData, Qualification: e.target.value})}
                        required 
                        placeholder="BVSc & AH,M.V.Sc, Ph.D"
                    />
                    <Input 
                        label="Phone Number" 
                        name="Phone" 
                        value={formData.Phone}
                        onChange={(e) => setFormData({...formData, Phone: e.target.value})}
                        required 
                        placeholder="9999999999"
                    />
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="bg-red-me px-6 py-2.5 text-white hover:bg-gray-100 rounded-lg font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-700"
                        >
                            Add Veterinarian
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Veterinarian Details Modal */}
            <Modal 
                isOpen={isDetailsOpen} 
                onClose={() => setIsDetailsOpen(false)} 
                title={selectedVet?.Name}
                maxWidth="max-w-4xl"
            >
                {vetDetails && (
                    <div className="space-y-6">
                        {/* Vet Info Header */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="w-20 h-20 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl flex items-center justify-center text-4xl text-white">
                                👨‍⚕️
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">{vetDetails.Name}</h3>
                                <p className="text-teal-600 font-medium">{vetDetails.Qualification}</p>
                                <p className="text-gray-500 text-sm mt-1">📞 {vetDetails.Phone}</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-xl text-center">
                                <p className="text-3xl font-bold text-blue-600">{vetDetails.appointments?.length || 0}</p>
                                <p className="text-sm text-gray-600">Total Appointments</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-xl text-center">
                                <p className="text-3xl font-bold text-green-600">
                                    {vetDetails.appointments?.filter(a => a.Status === 'Completed').length || 0}
                                </p>
                                <p className="text-sm text-gray-600">Completed</p>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-xl text-center">
                                <p className="text-3xl font-bold text-amber-600">
                                    {vetDetails.appointments?.filter(a => a.Status === 'Scheduled').length || 0}
                                </p>
                                <p className="text-sm text-gray-600">Upcoming</p>
                            </div>
                        </div>

                        {/* Appointments List */}
                        <div>
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                📅 Appointments History
                            </h4>
                            <div className="bg-gray-50 rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium text-gray-600">Date & Time</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-600">Pet</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-600">Owner</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {vetDetails.appointments?.map(appt => (
                                            <tr key={appt.AppointmentID} className="bg-white">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900">{appt.Date}</div>
                                                    <div className="text-gray-500">{appt.Time}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span>{appt.pet_type === 'Dog' ? '🐕' : appt.pet_type === 'Cat' ? '🐈' : '🐾'}</span>
                                                        <span className="font-medium">{appt.pet_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{appt.owner_name}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appt.Status)}`}>
                                                        {appt.Status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!vetDetails.appointments || vetDetails.appointments.length === 0) && (
                                            <tr>
                                                <td colSpan="4" className="px-4 py-8 text-center text-gray-400">
                                                    No appointments found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Treatments Given */}
                        {vetDetails.treatments && vetDetails.treatments.length > 0 && (
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    💉 Treatments Performed
                                </h4>
                                <div className="space-y-2">
                                    {vetDetails.treatments.map(treatment => (
                                        <div key={treatment.TreatmentID} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-800">{treatment.pet_name}</p>
                                                <p className="text-sm text-gray-500">{treatment.Description}</p>
                                            </div>
                                            <span className="font-bold text-teal-600">₹{treatment.Cost}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Veterinarians;