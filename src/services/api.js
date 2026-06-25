const API_URL = 'http://localhost:5000/api';

// Helper for API calls
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    };
    
    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }
    
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }
    
    return data;
}

// API methods
export const api = {
    // Auth
    login: (username, password) => fetchAPI('/login', {
        method: 'POST',
        body: { username, password }
    }),
    
    //Dashboard
    getDashboardStats: () => fetchAPI('/dashboard/stats'),

    // Owners
    getOwners: () => fetchAPI('/owners'),
    createOwner: (owner) => fetchAPI('/owners', { method: 'POST', body: owner }),
    deleteOwner: (id) => fetchAPI(`/owners/${id}`, { method: 'DELETE' }),
    
    // Pets
    getPets: () => fetchAPI('/pets'),
    createPet: (pet) => fetchAPI('/pets', { method: 'POST', body: pet }),
    deletePet: (id) => fetchAPI(`/pets/${id}`, { method: 'DELETE' }),
    
    // Appointments
    getAppointments: () => fetchAPI('/appointments'),
    createAppointment: (appt) => fetchAPI('/appointments', { method: 'POST', body: appt }),
    deleteAppointment: (id) => fetchAPI(`/appointments/${id}`, { method: 'DELETE' }),
    updateAppointmentStatus: (id, status) => fetchAPI(`/appointments/${id}/status`, {method: 'PUT', body: { Status: status }}),
    rescheduleAppointment: (id,appt) => fetchAPI(`/appointments/${id}/reschedule`, {method: 'PUT', body: appt}),

    
    // Treatments
    getTreatments: () => fetchAPI('/treatments'),
    createTreatment: (treatment) => fetchAPI('/treatments', { method: 'POST', body: treatment }),
    
    // Vaccinations
    getVaccinations: () => fetchAPI('/vaccinations'),
    createVaccination: (vax) => fetchAPI('/vaccinations', { method: 'POST', body: vax }),
    
    // Bills
    getBills: () => fetchAPI('/bills'),
    createBill: (bill) => fetchAPI('/bills', { method: 'POST', body: bill }),
    updateBill: (id, updates) => fetchAPI(`/bills/${id}`, { method: 'PUT', body: updates }),
    
    // Veterinarians
    getVeterinarians: () => fetchAPI('/veterinarians'),
    getVeterinarian: (id) => fetchAPI(`/veterinarians/${id}`),
    getVetAppointments: (id) => fetchAPI(`/veterinarians/${id}/appointments`),
    createVeterinarian: (vet) => fetchAPI('/veterinarians', { method: 'POST', body: vet }),
    updateVeterinarian: (id, vet) => fetchAPI(`/veterinarians/${id}`, { method: 'PUT', body: vet }),
    deleteVeterinarian: (id) => fetchAPI(`/veterinarians/${id}`, { method: 'DELETE' }),

    // Medicines
    getMedicines: () => fetchAPI('/medicines'),
    createMedicine: (data) => fetchAPI('/medicines', { method: 'POST', body: data }),

    // Treatments (updated)
    getTreatment: (id) => fetchAPI(`/treatments/${id}`),
    updateTreatment: (id, data) => fetchAPI(`/treatments/${id}`, { method: 'PUT', body: data }),
    // Medicines
    getMedicines: () => fetchAPI('/medicines'),
    getLowStock: () => fetchAPI('/medicines/low-stock'),
    getMedicineHistory: (id) => fetchAPI(`/medicines/${id}/history`),
    createMedicine: (data) => fetchAPI('/medicines', { method: 'POST', body: data }),
    updateMedicine: (id, data) => fetchAPI(`/medicines/${id}`, { method: 'PUT', body: data }),
    updateMedicineStock: (id, data) => fetchAPI(`/medicines/${id}/stock`, { method: 'PUT', body: data }),
    deleteMedicine: (id) => fetchAPI(`/medicines/${id}`, { method: 'DELETE' }),
};