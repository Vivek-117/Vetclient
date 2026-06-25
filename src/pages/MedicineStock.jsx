import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Common/Modal';
import Input from '../components/Common/Input';

const MedicineStock = () => {
    const [medicines, setMedicines] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [filter, setFilter] = useState('all'); // all, low, out
    const [search, setSearch] = useState('');

    const [formData, setFormData] = useState({
        MedicineName: '',
        Price: '',
        StockQuantity: 0,
        Unit: 'tablets'
    });

    const [stockForm, setStockForm] = useState({
        QuantityChange: 1,
        Reason: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [allMeds, low] = await Promise.all([
                api.getMedicines(),
                api.getLowStock()
            ]);
            setMedicines(allMeds);
            setLowStock(low);
        } catch (error) {
            console.error('Failed to fetch medicines:', error);
        }
    };


    const handleAdd = async (e) => {
        e.preventDefault();
        await api.createMedicine(formData);
        setIsAddModalOpen(false);
        setFormData({
            MedicineName: '',
            Price: '',
            StockQuantity: 0,
            Unit: 'tablets'
        });
        fetchData();
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        await api.updateMedicine(selectedMedicine.MedicineID, formData);
        setIsEditModalOpen(false);
        fetchData();
    };

    const handleStockUpdate = async (e) => {
        e.preventDefault();
        await api.updateMedicineStock(selectedMedicine.MedicineID, {
            QuantityChange: parseInt(stockForm.QuantityChange),
            Reason: stockForm.Reason
        });
        setIsStockModalOpen(false);
        setStockForm({ QuantityChange: 1, Reason: '' });
        fetchData();
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure? This will delete the medicine permanently.')) return;
        try {
            await api.deleteMedicine(id);
            fetchData();
        } catch (error) {
            alert('Failed to delete: ' + error.message);
        }
    };

    const openEdit = (medicine) => {
        setSelectedMedicine(medicine);
        setFormData({
            MedicineName: medicine.MedicineName,
            Price: medicine.Price,
            StockQuantity: medicine.StockQuantity,
            Unit: medicine.Unit
        });
        setIsEditModalOpen(true);
    };

    const openStock = (medicine) => {
        setSelectedMedicine(medicine);
        setStockForm({ QuantityChange: 1, Reason: '' });
        setIsStockModalOpen(true);
    };


    const filteredMedicines = medicines.filter(m => {
        const matchesSearch = m.MedicineName?.toLowerCase().includes(search.toLowerCase());
        if (filter === 'low') return matchesSearch && m.stock_status === 'Low Stock';
        if (filter === 'out') return matchesSearch && m.stock_status === 'Out of Stock';
        return matchesSearch;
    });


    const getStatusColor = (status) => {
        switch(status) {
            case 'Out of Stock': return 'bg-red-100 text-red-700 border-red-200';
            case 'Low Stock': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-green-100 text-green-700 border-green-200';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Out of Stock': return '❌';
            case 'Low Stock': return '⚠️';
            default: return '✅';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Medicine Stock</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage inventory and track usage</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)} 
                    className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-teal-700 transition-all hover:shadow-lg flex items-center gap-2"
                >
                    <span className="text-xl">+</span> Add Medicine
                </button>
            </div>

            {/* Alerts & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500">Total Medicines</p>
                    <p className="text-2xl font-bold text-gray-800">{medicines.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <p className="text-sm text-green-600">In Stock</p>
                    <p className="text-2xl font-bold text-green-700">
                        {medicines.filter(m => m.stock_status === 'In Stock').length}
                    </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <p className="text-sm text-amber-600">Low Stock</p>
                    <p className="text-2xl font-bold text-amber-700">
                        {medicines.filter(m => m.stock_status === 'Low Stock').length}
                    </p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                    <p className="text-sm text-red-600">Out of Stock</p>
                    <p className="text-2xl font-bold text-red-700">
                        {medicines.filter(m => m.stock_status === 'Out of Stock').length}
                    </p>
                </div>
            </div>

            {/* Low Stock Alert */}
            {lowStock.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
                    <h3 className="font-bold text-red-800 flex items-center gap-2 mb-2">
                        ⚠️ Low Stock Alert
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {lowStock.map(med => (
                            <span className="px-3 py-1 bg-white text-red-700 rounded-lg text-sm border border-red-200">
                                {med.MedicineName} ({med.StockQuantity} {med.Unit} - below 10)
                            </span>
                        ))}
                    </div>
                </div>
            )}
            <br></br>
            {/* Filter Tabs */}
            <div className="flex gap-2">
                {[
                    { id: 'all', label: 'All Medicines', count: medicines.length },
                    { id: 'low', label: 'Low Stock', count: medicines.filter(m => m.stock_status === 'Low Stock').length },
                    { id: 'out', label: 'Out of Stock', count: medicines.filter(m => m.stock_status === 'Out of Stock').length }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            filter === tab.id 
                                ? 'bg-teal-600 text-white' 
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>
            <br></br>
            {/* Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <input 
                    type="text" 
                    placeholder="Search medicines by name..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
            </div>
            <br></br>
            {/* Medicines Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMedicines.map(med => (
                    <div 
                        key={med.MedicineID} 
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center text-2xl">
                                    💊
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{med.MedicineName}</h3>
                                    <p className="text-sm text-teal-600 font-medium">₹{med.Price} per {med.Unit}</p>
                                </div>
                            </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center justify-center gap-1 ${getStatusColor(med.stock_status)}`}>
                                    <span>{getStatusIcon(med.stock_status)}</span>
                                    <span>{med.stock_status}</span>
                                </span>
                        </div>

                        {/* Stock Bar */}
                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Stock Level</span>
                                <span className="font-bold text-gray-800">{med.StockQuantity} {med.Unit}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all ${
                                        med.stock_status === 'Out of Stock' ? 'bg-red-500' :
                                        med.stock_status === 'Low Stock' ? 'bg-amber-500' : 'bg-green-500'
                                    }`}
                                    style={{ 
                                        width: `${Math.min((med.StockQuantity / (med.MinStockLevel * 2)) * 100, 100)}%` 
                                    }}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => openStock(med)}
                                className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-700 hover:shadow-lg transition-all"
                            >
                                📦 Stock
                            </button>
                            <button 
                                onClick={() => openEdit(med)}
                                className="bg-ice-me text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-700 hover:shadow-lg transition-all"
                            >
                                ✏️ Edit
                            </button>
                        </div>
                        
                        <button 
                            onClick={() => handleDelete(med.MedicineID)}
                            className="bg-red-me w-full mt-2 py-2 text-white hover:bg-red-50 rounded-lg text-sm font-medium"
                        >
                            🗑️ Delete Medicine
                        </button>
                    </div>
                ))}
            </div>

            {filteredMedicines.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-400 text-lg">No medicines found</p>
                </div>
            )}

            {/* Add Medicine Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Medicine">
                <form onSubmit={handleAdd} className="space-y-4">
                    <Input label="Medicine Name" name="MedicineName" value={formData.MedicineName} onChange={(e) => setFormData({...formData, MedicineName: e.target.value})} required />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Price (₹)" name="Price" type="number" step="0.01" value={formData.Price} onChange={(e) => setFormData({...formData, Price: e.target.value})} required />
                        <Input label="Unit" name="Unit" value={formData.Unit} onChange={(e) => setFormData({...formData, Unit: e.target.value})} placeholder="tablets, ml, vials" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Initial Stock" name="StockQuantity" type="number" value={formData.StockQuantity} onChange={(e) => setFormData({...formData, StockQuantity: parseInt(e.target.value) || 0})} />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="bg-red-me px-6 py-2.5 text-white hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-700">Add Medicine</button>
                    </div>
                </form>
            </Modal>

            {/* Edit Medicine Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit: ${selectedMedicine?.MedicineName}`}>
                <form onSubmit={handleEdit} className="space-y-4">
                    <Input label="Medicine Name" name="MedicineName" value={formData.MedicineName} onChange={(e) => setFormData({...formData, MedicineName: e.target.value})} required />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Price (₹)" name="Price" type="number" step="0.01" value={formData.Price} onChange={(e) => setFormData({...formData, Price: e.target.value})} required />
                        <Input label="Unit" name="Unit" value={formData.Unit} onChange={(e) => setFormData({...formData, Unit: e.target.value})} required />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-red-me px-6 py-2.5 text-white hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-amber-700">Save Changes</button>
                    </div>
                </form>
            </Modal>

            {/* Update Stock Modal */}
            <Modal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} title={`Update Stock: ${selectedMedicine?.MedicineName}`}>
                <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600">Current Stock</p>
                    <p className="text-3xl font-bold text-gray-800">{selectedMedicine?.StockQuantity} <span className="text-lg font-normal">{selectedMedicine?.Unit}</span></p>
                </div>
                <form onSubmit={handleStockUpdate} className="space-y-4">
                    <Input 
                        label="Quantity Change" 
                        name="QuantityChange" 
                        type="number"
                        value={stockForm.QuantityChange}
                        onChange={(e) => setStockForm({...stockForm, QuantityChange: e.target.value})}
                        required 
                    />
                    <p className="text-sm text-gray-500">
                        💡 Use positive numbers to add stock, negative to remove (e.g., -5)
                    </p>
                    <Input 
                        label="Reason" 
                        name="Reason" 
                        type="textarea"
                        value={stockForm.Reason}
                        onChange={(e) => setStockForm({...stockForm, Reason: e.target.value})}
                        placeholder="New delivery, Expired, Used in treatment #123, etc."
                        required 
                    />
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={() => setIsStockModalOpen(false)} className="bg-red-me px-6 py-2.5 text-white hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-700">Update Stock</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MedicineStock;