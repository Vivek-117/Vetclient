import React, { useState, useEffect } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { api } from '../services/api';
import Modal from '../components/Common/Modal';
import Input from '../components/Common/Input';

const Medical = () => {
    const { data, insert, refresh } = useDatabase();
    const [medicines, setMedicines] = useState([]);
    const [activeTab, setActiveTab] = useState('treatments');
    const [treatmentModal, setTreatmentModal] = useState(false);
    const [vaccineModal, setVaccineModal] = useState(false);
    const [viewPrescriptionModal, setViewPrescriptionModal] = useState(false);
    const [selectedTreatment, setSelectedTreatment] = useState(null);
    
    const [treatmentForm, setTreatmentForm] = useState({
        AppointmentID: '',
        Description: '',
        Cost: '',
        Prescriptions: []
    });

    const [vaccineForm, setVaccineForm] = useState({
      PetID: '',
      VaccineName: '',
      Date: '',
      NextDueDate: ''
    });

    const handleVaccineSubmit = (e) => {
      e.preventDefault();
      insert('vaccinations', {
        ...vaccineForm,
        PetID: parseInt(vaccineForm.PetID)
      });
      setVaccineModal(false);
      setVaccineForm({ PetID: '', VaccineName: '', Date: '', NextDueDate: '' });
    };
    const [search, setSearch] = useState('');
    const [petFilter, setPetFilter] = useState('All');
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingTreatment, setEditingTreatment] = useState(null);

    const [currentPrescription, setCurrentPrescription] = useState({
        MedicineID: '',
        QuantityUsed: 1,
    });

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            const meds = await api.getMedicines();
            setMedicines(meds);
        } catch (error) {
            console.error('Failed to fetch medicines:', error);
        }
    };

    const openEditModal = (treatment) => {
        setEditingTreatment(treatment);
        setTreatmentForm({
            AppointmentID: treatment.AppointmentID,
            Description: treatment.Description,
            Cost: treatment.Cost,
            Prescriptions: treatment.prescriptions?.map(p => ({
                MedicineID: p.MedicineID,
                MedicineName: p.MedicineName,
                Unit: p.Unit,
                QuantityUsed: p.QuantityUsed,
            })) || []
        });
        setEditModalOpen(true);
    };

    const handleAddPrescription = () => {
        if (!currentPrescription.MedicineID) return;
        
        const medicine = medicines.find(m => m.MedicineID == currentPrescription.MedicineID);
        
        setTreatmentForm(prev => ({
            ...prev,
            Prescriptions: [...prev.Prescriptions, {
                ...currentPrescription,
                MedicineName: medicine.MedicineName,
                Unit: medicine.Unit
            }]
        }));
        
        setCurrentPrescription({
            MedicineID: '',
            QuantityUsed: 1,
        });
    };

    const removePrescription = (index) => {
        setTreatmentForm(prev => ({
            ...prev,
            Prescriptions: prev.Prescriptions.filter((_, i) => i !== index)
        }));
    };

    const handleTreatmentSubmit = async (e) => {
        e.preventDefault();
        
        // Calculate total cost
        const medicinesCost = treatmentForm.Prescriptions.reduce((sum, p) => {
            const med = medicines.find(m => m.MedicineID == p.MedicineID);
            return sum + (med?.Price || 0) * p.QuantityUsed;
        }, 0);
        
        const totalCost = parseFloat(treatmentForm.Cost) + medicinesCost;
        
        await insert('treatments', {
            ...treatmentForm,
            Cost: totalCost
        });
        
        setTreatmentModal(false);
        setTreatmentForm({
            AppointmentID: '',
            Description: '',
            Cost: '',
            Prescriptions: []
        });
    };

    const handleUpdateTreatment = async (e) => {
        e.preventDefault();
        await api.updateTreatment(editingTreatment.TreatmentID, treatmentForm);
        setEditModalOpen(false);
        setEditingTreatment(null);
        setTreatmentForm({
            AppointmentID: '',
            Description: '',
            Cost: '',
            Prescriptions: []
        });
        refresh();
    };

    const viewPrescription = (treatment) => {
        setSelectedTreatment(treatment);
        setViewPrescriptionModal(true);
    };

    const treatmentsByAppointment = data.treatments?.reduce((acc, t) => {
        const apptId = t.AppointmentID || 'unassigned';
        if (!acc[apptId]) acc[apptId] = [];
        acc[apptId].push(t);
        return acc;
    }, {});

    const vaccinations = [...(data.vaccinations || [])]
    .filter(v => {
        const pet = data.pets?.find(p => p.PetID === v.PetID);
        const matchesSearch = 
        v.VaccineName?.toLowerCase().includes(search.toLowerCase()) ||
        pet?.Name?.toLowerCase().includes(search.toLowerCase());
        const matchesPet = petFilter === 'All' || pet?.PetID?.toString() === petFilter;
        return matchesSearch && matchesPet;
    })
    .sort((a, b) => b.VaccineID - a.VaccineID);

    const filteredTreatmentsByAppointment = Object.entries(treatmentsByAppointment || {}).filter(([apptId, treatments]) => {
    const firstTreatment = treatments[0];
    const matchesSearch = 
        firstTreatment.pet_name?.toLowerCase().includes(search.toLowerCase()) ||
        firstTreatment.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
        firstTreatment.vet_name?.toLowerCase().includes(search.toLowerCase()) ||
        firstTreatment.appointment_date?.includes(search);
    const matchesPet = petFilter === 'All' || firstTreatment.PetID?.toString() === petFilter;
    return matchesSearch && matchesPet;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Medical Records</h2>
                    <p className="text-gray-500 text-sm mt-1">Treatments with prescriptions</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setTreatmentModal(true)} 
                        className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-teal-700"
                    >
                        + Add Treatment
                    </button>
                    <button 
                        onClick={() => setVaccineModal(true)} 
                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700"
                    >
                        + Vaccination
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex gap-4">
                <input 
                    type="text" 
                    placeholder={activeTab === 'treatments' ? "Search by pet, owner, vet, or date..." : "Search by vaccine or pet name..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
            </div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                <button 
                    onClick={() => setActiveTab('treatments')} 
                    className={`px-6 py-2 rounded-lg font-medium ${activeTab === 'treatments' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600'}`}
                >
                    Treatments & Prescriptions
                </button>
                <button 
                    onClick={() => setActiveTab('vaccinations')} 
                    className={`px-6 py-2 rounded-lg font-medium ${activeTab === 'vaccinations' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600'}`}
                >
                    Vaccinations
                </button>
            </div>

            {activeTab === 'treatments' ? (
                <div className="space-y-4">
                    {filteredTreatmentsByAppointment.map(([apptId, treatments]) => {
                        const firstTreatment = treatments[0];
                        return (
                            <div key={apptId} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">
                                            {firstTreatment.pet_name || 'Unknown Pet'}
                                            <span className="ml-2 text-sm font-normal text-gray-500">
                                                ({firstTreatment.pet_type})
                                            </span>
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            📅 {firstTreatment.appointment_date} at {firstTreatment.appointment_time}
                                        </p>
                                        <p className="text-sm text-teal-600">
                                            👤 {firstTreatment.owner_name} • 🩺 {firstTreatment.vet_name}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    {treatments.map(t => (
                                        <div key={t.TreatmentID} className="p-4 bg-gray-50 rounded-xl">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-medium text-gray-800">{t.Description}</p>
                                                    <p className="text-sm text-gray-500">Treatment #{t.TreatmentID}</p>
                                                    <span className='ml-2 text-sm font-semibold'>₹{t.Cost}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => viewPrescription(t)}
                                                        className="bg-teal-600 text-sm text-white hover:underline rounded-lg"
                                                    >
                                                        💊 View Prescription ({t.prescriptions?.length || 0} items)
                                                    </button>
                                                    <button 
                                                        onClick={() => openEditModal(t)}
                                                        className="bg-ice-me px-6 text-sm text-white hover:underline rounded-lg"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {t.prescriptions?.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <p className="text-xs font-semibold text-gray-500 mb-2">PRESCRIPTION:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {t.prescriptions.map((pres, idx) => {
                                                            const medicine = medicines.find(m => m.MedicineID === pres.MedicineID);
                                                            const itemCost = medicine ? medicine.Price * pres.QuantityUsed : 0;
                                                            
                                                            return (
                                                                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                                                                    {pres.MedicineName} x{pres.QuantityUsed} <p></p>
                                                                    <span className="ml-2 font-semibold">₹{itemCost.toFixed(2)}</span>
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="pt-2 border-t border-gray-200">
                                                <p className="text-sm font-bold text-gray-800"><br></br>
                                                    Total: ₹ 
                                                    <span className="ml-2">
                                                        {(
                                                            t.prescriptions.reduce((sum, pres) => {
                                                                const medicine = medicines.find(m => m.MedicineID === pres.MedicineID);
                                                                return sum + (medicine ? medicine.Price * pres.QuantityUsed : 0);
                                                            }, 0) + parseFloat(t.Cost || 0)
                                                        ).toFixed(2)}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    
                    {(filteredTreatmentsByAppointment.length === 0) && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">
                        <p className="text-lg">No treatments found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                    )}
                </div>
            ) : (
                // Vaccinations tab
                <div className="grid gap-4">
                    {(vaccinations || []).map(vax => {
                        const pet = data.pets?.find(p => p.PetID === vax.PetID);
                        return (
                            <div key={vax.VaccineID} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl">💉</div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-lg">{vax.VaccineName}</h4>
                                            <p className="text-gray-600">Pet: {pet?.Name || 'Unknown'} • Date: {vax.Date}</p>
                                            {vax.NextDueDate && <p className="text-sm text-amber-600 mt-1">Next due: {vax.NextDueDate}</p>}
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium h-6 flex items-center justify-center">
                                        Completed
                                    </span>                                
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Treatment Modal with Prescription */}
            <Modal isOpen={treatmentModal} onClose={() => setTreatmentModal(false)} title="Add Treatment & Prescription" maxWidth="max-w-3xl">
                <form onSubmit={handleTreatmentSubmit} className="space-y-4">
                    <Input 
                        label="Select Appointment" 
                        name="AppointmentID" 
                        type="select" 
                        value={treatmentForm.AppointmentID}
                        onChange={(e) => setTreatmentForm({...treatmentForm, AppointmentID: e.target.value})}
                        required 
                        options={data.appointments
                            ?.filter(a => a.Status === 'Scheduled' || a.Status === 'In Progress')
                            .map(a => {
                                const pet = data.pets?.find(p => p.PetID === a.PetID);
                                return {
                                    value: a.AppointmentID, 
                                    label: `${a.Date} - ${pet?.Name || 'Unknown'} (${a.Status})`
                                };
                            }) || []} 
                    />
                    
                    <Input 
                        label="Treatment Description" 
                        name="Description" 
                        type="textarea" 
                        value={treatmentForm.Description}
                        onChange={(e) => setTreatmentForm({...treatmentForm, Description: e.target.value})}
                        required 
                        placeholder="Diagnosis, procedure, notes..."
                    />
                    
                    <Input 
                        label="Treatment Cost (₹)" 
                        name="Cost" 
                        type="number" 
                        step="0.01"
                        value={treatmentForm.Cost}
                        onChange={(e) => setTreatmentForm({...treatmentForm, Cost: e.target.value})}
                        placeholder="Consultation/procedure fee only (medicines added below)"
                    />

                    {/* Prescription Section */}
                    <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            💊 Prescription
                            {treatmentForm.Prescriptions.length > 0 && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                    {treatmentForm.Prescriptions.length} items
                                </span>
                            )}
                        </h4>
                        
                        {/* Current Prescriptions List */}
                        {treatmentForm.Prescriptions.map((pres, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg mb-2">
                                <div>
                                    <p className="font-medium">{pres.MedicineName} x{pres.QuantityUsed}</p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => removePrescription(idx)}
                                    className="bg-red-me text-white hover:bg-red-100 p-2 rounded"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        
                        {/* Add New Prescription */}
                        <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <Input 
                                    label="Medicine" 
                                    name="MedicineID" 
                                    type="select"
                                    value={currentPrescription.MedicineID}
                                    onChange={(e) => setCurrentPrescription({...currentPrescription, MedicineID: e.target.value})}
                                    options={medicines.map(m => ({
                                        value: m.MedicineID,
                                        label: `${m.MedicineName} (Stock: ${m.StockQuantity} ${m.Unit}, ₹${m.Price})`
                                    }))}
                                />
                                <Input 
                                    label="Quantity" 
                                    name="QuantityUsed" 
                                    type="number"
                                    min="1"
                                    value={currentPrescription.QuantityUsed}
                                    onChange={(e) => setCurrentPrescription({...currentPrescription, QuantityUsed: parseInt(e.target.value) || 1})}
                                />
                            </div>
                            <button 
                                type="button"
                                onClick={handleAddPrescription}
                                disabled={!currentPrescription.MedicineID}
                                className="w-full py-2 bg-emerald-700 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                + Add to Prescription
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setTreatmentModal(false)} className="bg-red-me px-6 py-2.5 text-white hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button 
                            type="submit" 
                            className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-700"
                            disabled={!treatmentForm.AppointmentID || !treatmentForm.Description}
                        >
                            Save Treatment & Prescription
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Prescription Modal */}
            <Modal isOpen={viewPrescriptionModal} onClose={() => setViewPrescriptionModal(false)} title="Prescription Details">
                {selectedTreatment && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-600">Treatment</p>
                            <p className="font-bold text-gray-800">{selectedTreatment.Description}</p>
                            <p className="text-sm text-teal-600 mt-1">Total: ₹{selectedTreatment.Cost}</p>
                        </div>
                        
                        <h4 className="font-bold text-gray-800">Prescribed Medicines:</h4>
                        <div className="space-y-3">
                            {selectedTreatment.prescriptions?.map((pres, idx) => (
                                <div key={idx} className="p-4 border border-gray-200 rounded-xl">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-gray-800 text-lg">{pres.MedicineName}</p>
                                            <p className="text-gray-600">Quantity: {pres.QuantityUsed} {pres.Unit}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>
            
            {/* Edit Treatment Modal */}
            <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Treatment & Prescription" maxWidth="max-w-3xl">
                <form onSubmit={handleUpdateTreatment} className="space-y-4">
                    {/* Same form content as add modal, just change submit button text */}
                    <Input 
                        label="Treatment Description" 
                        name="Description" 
                        type="textarea" 
                        value={treatmentForm.Description}
                        onChange={(e) => setTreatmentForm({...treatmentForm, Description: e.target.value})}
                        required 
                    />
                    <Input 
                        label="Treatment Cost (₹)" 
                        name="Cost" 
                        type="number" 
                        step="0.01"
                        value={treatmentForm.Cost}
                        onChange={(e) => setTreatmentForm({...treatmentForm, Cost: e.target.value})}
                    />

                    {/* Same prescription section as add modal */}
                    <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-bold text-gray-800 mb-3">
                            💊 Prescription ({treatmentForm.Prescriptions.length} items)
                        </h4>
                        
                        {treatmentForm.Prescriptions.map((pres, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg mb-2">
                                <div>
                                    <p className="font-medium">{pres.MedicineName} x{pres.QuantityUsed}</p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => removePrescription(idx)}
                                    className="bg-red-me text-white hover:bg-red-100 p-2 rounded"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        
                        {/* Same add prescription form as before */}
                        <div className="bg-gray-50 p-4 rounded-xl space-y-3 mt-3">
                            <div className="grid grid-cols-2 gap-3">
                                <Input 
                                    label="Medicine" 
                                    name="MedicineID" 
                                    type="select"
                                    value={currentPrescription.MedicineID}
                                    onChange={(e) => setCurrentPrescription({...currentPrescription, MedicineID: e.target.value})}
                                    options={medicines.map(m => ({
                                        value: m.MedicineID,
                                        label: `${m.MedicineName} (Stock: ${m.StockQuantity})`
                                    }))}
                                />
                                <Input 
                                    label="Quantity" 
                                    name="QuantityUsed" 
                                    type="number"
                                    min="1"
                                    value={currentPrescription.QuantityUsed}
                                    onChange={(e) => setCurrentPrescription({...currentPrescription, QuantityUsed: parseInt(e.target.value) || 1})}
                                />
                            </div>
                            <button 
                                type="button"
                                onClick={handleAddPrescription}
                                disabled={!currentPrescription.MedicineID}
                                className="w-full py-2 bg-emerald-700 text-white rounded-lg disabled:bg-gray-300"
                            >
                                + Add Medicine to Prescription
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={() => setEditModalOpen(false)} className="px-6 py-2.5 text-white bg-red-me rounded-lg">Cancel</button>
                        <button type="submit" className="bg-ice-me text-white px-6 py-2.5 rounded-lg font-medium hover:bg-amber-700 border-none">                            Update Treatment
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={vaccineModal} onClose={() => setVaccineModal(false)} title="Record Vaccination">
              <form onSubmit={handleVaccineSubmit} className="space-y-4">
                <Input 
                  label="Pet" 
                  name="PetID" 
                  type="select" 
                  value={vaccineForm.PetID}
                  onChange={(e) => setVaccineForm({...vaccineForm, PetID: e.target.value})}
                  required 
                  options={data.pets?.map(p => ({value: p.PetID, label: p.Name})) || []} 
                />
                <Input 
                  label="Vaccine Name" 
                  name="VaccineName" 
                  value={vaccineForm.VaccineName}
                  onChange={(e) => setVaccineForm({...vaccineForm, VaccineName: e.target.value})}
                  required 
                  placeholder="Rabies, DHPP, FVRCP, etc." 
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Date Given" 
                    name="Date" 
                    type="date" 
                    value={vaccineForm.Date}
                    onChange={(e) => setVaccineForm({...vaccineForm, Date: e.target.value})}
                    required 
                  />
                  <Input 
                    label="Next Due Date" 
                    name="NextDueDate" 
                    type="date" 
                    value={vaccineForm.NextDueDate}
                    onChange={(e) => setVaccineForm({...vaccineForm, NextDueDate: e.target.value})}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setVaccineModal(false)} className="px-6 py-2.5 text-white bg-red-me rounded-lg">Cancel</button>
                  <button type="submit" className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-emerald-700">Record Vaccination</button>
                </div>
              </form>
            </Modal>

        </div>
    );
};

export default Medical;