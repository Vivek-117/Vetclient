import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const useDatabase = () => {
    const [data, setData] = useState({
        owners: [],
        pets: [],
        appointments: [],
        treatments: [],
        vaccinations: [],
        bills: [],
        veterinarians: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [
                owners,
                pets,
                appointments,
                treatments,
                vaccinations,
                bills,
                veterinarians
            ] = await Promise.all([
                api.getOwners(),
                api.getPets(),
                api.getAppointments(),
                api.getTreatments(),
                api.getVaccinations(),
                api.getBills(),
                api.getVeterinarians()
            ]);
            
            setData({
                owners,
                pets,
                appointments,
                treatments,
                vaccinations,
                bills,
                veterinarians
            });
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // CRUD operations
    const insert = async (table, record) => {
        try {
            let result;
            switch(table) {
                case 'owners':
                    result = await api.createOwner(record);
                    break;
                case 'pets':
                    result = await api.createPet(record);
                    break;
                case 'appointments':
                    result = await api.createAppointment(record);
                    break;
                case 'treatments':
                    result = await api.createTreatment(record);
                    break;
                case 'vaccinations':
                    result = await api.createVaccination(record);
                    break;
                case 'bills':
                    result = await api.createBill(record);
                    break;
                case 'veterinarians':
                    result = await api.createVeterinarian(record);
                    break;
                default:
                    throw new Error(`Unknown table: ${table}`);
            }
            await fetchAll(); // Refresh data
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const remove = async (table, id) => {
        try {
            switch(table) {
                case 'owners':
                    await api.deleteOwner(id);
                    break;
                case 'pets':
                    await api.deletePet(id);
                    break;
                case 'appointments':
                    await api.deleteAppointment(id);
                    break;
                case 'veterinarians':
                    await api.deleteVeterinarian(id);
                    break;
                default:
                    throw new Error(`Unknown table: ${table}`);
            }
            await fetchAll();
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const update = async (table, id, updates) => {
        try {
            if (table === 'bills') {
                await api.updateBill(id, updates);
            }
            await fetchAll();
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    return {
        data,
        loading,
        error,
        refresh: fetchAll,
        insert,
        update,
        remove
    };
};