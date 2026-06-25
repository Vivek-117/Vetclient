// Database Service using localStorage - implements all entities from ER Diagram
const DB = {
  init: () => {
    if (!localStorage.getItem('petcare_db')) {
      localStorage.setItem('petcare_db', JSON.stringify({
        owners: [],
        pets: [],
        appointments: [],
        treatments: [],
        vaccinations: [],
        bills: [],
        medicines: [],
        veterinarians: [
          { VetID: 1, Name: "Dr. Sarah Johnson", Qualification: "DVM", Phone: "555-0101" },
          { VetID: 2, Name: "Dr. Michael Chen", Qualification: "DVM, MS", Phone: "555-0102" },
          { VetID: 3, Name: "Dr. Emily Williams", Qualification: "DVM", Phone: "555-0103" }
        ],
        users: [{ username: 'admin', password: 'admin', role: 'admin' }]
      }));
    }
  },

  get: () => JSON.parse(localStorage.getItem('petcare_db')),

  set: (data) => localStorage.setItem('petcare_db', JSON.stringify(data)),

  // Generic CRUD operations matching schema
  insert: (table, record) => {
    const db = DB.get();
    const idKey = table === 'veterinarians' ? 'VetID' : 
                  table === 'users' ? 'id' :
                  `${table.slice(0, -1)}ID`;
    const id = Date.now();
    record[idKey] = id;
    db[table].push(record);
    DB.set(db);
    return record;
  },

  update: (table, id, updates) => {
    const db = DB.get();
    const idKey = table === 'veterinarians' ? 'VetID' : 
                  table === 'users' ? 'id' :
                  `${table.slice(0, -1)}ID`;
    const idx = db[table].findIndex(r => r[idKey] === id);
    if (idx !== -1) {
      db[table][idx] = { ...db[table][idx], ...updates };
      DB.set(db);
    }
    return db[table][idx];
  },

  delete: (table, id) => {
    const db = DB.get();
    const idKey = table === 'veterinarians' ? 'VetID' : 
                  table === 'users' ? 'id' :
                  `${table.slice(0, -1)}ID`;
    db[table] = db[table].filter(r => r[idKey] !== id);
    DB.set(db);
  },

  query: (table, filterFn) => {
    const db = DB.get();
    return filterFn ? db[table].filter(filterFn) : db[table];
  },

  // Specialized queries
  getOwnerPets: (ownerId) => {
    const db = DB.get();
    return db.pets.filter(p => p.OwnerID === ownerId);
  },

  getPetAppointments: (petId) => {
    const db = DB.get();
    return db.appointments.filter(a => a.PetID === petId);
  },

  getAppointmentTreatments: (appointmentId) => {
    const db = DB.get();
    return db.treatments.filter(t => t.AppointmentID === appointmentId);
  },

  getOwnerBills: (ownerId) => {
    const db = DB.get();
    return db.bills.filter(b => b.OwnerID === ownerId);
  }
};

export default DB;