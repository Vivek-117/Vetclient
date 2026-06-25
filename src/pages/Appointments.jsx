import React, { useState } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { api } from '../services/api';
import Modal from '../components/Common/Modal';
import Input from '../components/Common/Input';

const Appointments = () => {
  const { data, insert, refresh } = useDatabase();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    Date: '',
    Time: '',
    PetID: '',
    VetID: '',
    Notes: ''
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    AppointmentID: null,
    Date: '',
    Time: ''
  });

  const filteredAppointments = data.appointments?.filter(appt => {
    const pet = data.pets?.find(p => p.PetID === appt.PetID);
    const owner = data.owners?.find(o => o.OwnerID === pet?.OwnerID);
    const vet = data.veterinarians?.find(v => v.VetID === appt.VetID);
    
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      pet?.Name?.toLowerCase().includes(searchLower) ||
      owner?.Name?.toLowerCase().includes(searchLower) ||
      vet?.Name?.toLowerCase().includes(searchLower) ||
      appt.Date?.includes(search);
    
    const matchesStatus = statusFilter === 'All' || appt.Status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const sortedAppointments = [...filteredAppointments]
    .sort((a, b) => new Date(a.Date) - new Date(b.Date));
  const handleSubmit = (e) => {
    e.preventDefault();
    insert('appointments', {
      ...formData,
      PetID: parseInt(formData.PetID),
      VetID: parseInt(formData.VetID),
      Status: 'Scheduled'
    });
    setIsModalOpen(false);
    setFormData({ Date: '', Time: '', PetID: '', VetID: '', Notes: '' });
  };

  const handleDone = async (id) => {
    if (!confirm('Mark this appointment as completed?')) return;
    try {
        await api.updateAppointmentStatus(id, 'Completed');
        
        refresh();
    } catch (error) {
        alert('Failed to update: ' + error.message);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Mark this appointment as cancelled?')) return;
    try {
        await api.updateAppointmentStatus(id, 'Cancelled');
        
        refresh();
    } catch (error) {
        alert('Failed to update: ' + error.message);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openRescheduleModal = (appt) => {
  setRescheduleData({
    AppointmentID: appt.AppointmentID,
    Date: appt.Date,
    Time: appt.Time
  });
  setIsRescheduleModalOpen(true);
};

const handleRescheduleSubmit = async (e) => {
  e.preventDefault();
  try {
    await api.rescheduleAppointment(rescheduleData.AppointmentID, {
      Date: rescheduleData.Date,
      Time: rescheduleData.Time,
      Status: 'Scheduled'
    });
    setIsRescheduleModalOpen(false);
    setRescheduleData({ AppointmentID: null, Date: '', Time: '' });
    refresh();
  } catch (error) {
    alert('Failed to reschedule: ' + error.message);
  }
};

const handleRescheduleChange = (e) => {
  setRescheduleData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
          <h2 className="text-2xl font-bold text-gray-800">Appointment Management</h2>
          <p className="text-gray-500 text-sm mt-1">Schedule and manage veterinary appointments</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-teal-700 transition-all hover:shadow-lg flex items-center gap-2"
        >
          <span className="text-xl">+</span> Schedule Appointment
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex gap-4">
        <input 
          type="text" 
          placeholder="Search by pet, owner, vet, or date..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        /><br></br>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
        >
          <option value="All">All Status</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Pet</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Owner</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Veterinarian</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedAppointments.map(appt => {
                const pet = data.pets?.find(p => p.PetID === appt.PetID);
                const owner = data.owners?.find(o => o.OwnerID === pet?.OwnerID);
                const vet = data.veterinarians?.find(v => v.VetID === appt.VetID);
                
                return (
                  <tr key={appt.AppointmentID} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{appt.Date}</div>
                      <div className="text-sm text-gray-500">{appt.Time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{pet?.Type === 'Dog' ? '🐕' : pet?.Type === 'Cat' ? '🐈' : '🐾'}</span>
                        <span className="font-medium text-gray-900">{pet?.Name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{owner?.Name || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{vet?.Name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{vet?.Qualification}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appt.Status)}`}>
                        {appt.Status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {appt.Status === 'Scheduled' && (
                        <>
                          <button
                            onClick={() => handleDone(appt.AppointmentID)}
                            className="bg-ice-me py-2 rounded-lg px-6 text-white hover:text-red-800 text-sm font-medium hover:underline"
                          >
                            ✓ Done
                          </button>
                          <button
                            onClick={() => handleCancel(appt.AppointmentID)}
                            className="bg-red-me py-2 rounded-lg px-6 text-white hover:text-red-800 text-sm font-medium hover:underline"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => openRescheduleModal(appt)}
                            className="bg-teal-600 py-2 rounded-lg px-4 text-white hover:bg-blue-700 text-sm font-medium"
                          >
                            ↻ Reschedule
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {sortedAppointments.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">No appointments scheduled</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule New Appointment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" name="Date" type="date" value={formData.Date} onChange={handleChange} required />
            <Input label="Time" name="Time" type="time" value={formData.Time} onChange={handleChange} required />
          </div>
          
          <Input 
            label="Pet" 
            name="PetID" 
            type="select" 
            value={formData.PetID} 
            onChange={handleChange} 
            required 
            options={data.pets?.map(p => {
              const owner = data.owners?.find(o => o.OwnerID === p.OwnerID);
              return {value: p.PetID, label: `${p.Name} (${owner?.Name || 'Unknown Owner'})`};
            }) || []} 
          />
          
          <Input 
            label="Veterinarian" 
            name="VetID" 
            type="select" 
            value={formData.VetID} 
            onChange={handleChange} 
            required 
            options={data.veterinarians?.map(v => ({value: v.VetID, label: `${v.Name} - ${v.Qualification}`})) || []} 
          />
          
          <Input 
            label="Notes / Reason for Visit" 
            name="Notes" 
            type="textarea" 
            value={formData.Notes} 
            onChange={handleChange} 
            placeholder="Symptoms, concerns, or reason for appointment..."
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
              className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-700 hover:shadow-lg transition-all"
            >
              Schedule Appointment
            </button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={isRescheduleModalOpen} onClose={() => setIsRescheduleModalOpen(false)} title="Reschedule Appointment">
        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="New Date" 
              name="Date" 
              type="date" 
              value={rescheduleData.Date} 
              onChange={handleRescheduleChange} 
              required 
            />
            <Input 
              label="New Time" 
              name="Time" 
              type="time" 
              value={rescheduleData.Time} 
              onChange={handleRescheduleChange} 
              required 
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={() => setIsRescheduleModalOpen(false)} 
              className="px-6 py-2.5 text-white bg-red-me rounded-lg font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-ice-me text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 hover:shadow-lg transition-all"
            >
              Reschedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Appointments;