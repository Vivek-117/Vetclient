import React, { useState } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import Modal from '../components/Common/Modal';
import Input from '../components/Common/Input';

const Owners = () => {
  const { data, insert, remove } = useDatabase();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    Name: '',
    Phone: '',
    Email: '',
    Address: ''
  });

  const filteredOwners = data.owners?.filter(o => 
    o.Name?.toLowerCase().includes(search.toLowerCase()) || 
    o.Phone?.includes(search) ||
    o.Email?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    insert('owners', formData);
    setFormData({ Name: '', Phone: '', Email: '', Address: '' });
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Owner Management</h2>
          <p className="text-gray-500 text-sm mt-1">Manage pet owners and their information</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-teal-700 transition-all hover:shadow-lg flex items-center gap-2"
        >
          <span className="text-xl">+</span> Add Owner
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <input 
            type="text" 
            placeholder="Search owners by name, phone, or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pets</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOwners.map(owner => {
                const petCount = data.pets?.filter(p => p.OwnerID === owner.OwnerID).length || 0;
                return (
                  <tr key={owner.OwnerID} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">#{owner.OwnerID}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{owner.Name}</div>
                      <div className="text-sm text-gray-500">{owner.Address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{owner.Phone}</div>
                      <div className="text-sm text-gray-500">{owner.Email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                        {petCount} {petCount === 1 ? 'pet' : 'pets'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => remove('owners', owner.OwnerID)}
                        className="bg-red-me text-white px-6 py-2 rounded-lg hover:text-red-800 text-sm font-medium hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredOwners.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg mb-2">No owners found</p>
              <p className="text-sm">Try adjusting your search or add a new owner</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Owner">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" name="Name" value={formData.Name} onChange={handleChange} required placeholder="John Doe" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone Number" name="Phone" value={formData.Phone} onChange={handleChange} required placeholder="9999999999" />
            <Input label="Email Address" name="Email" type="email" value={formData.Email} onChange={handleChange} required placeholder="john@example.com" />
          </div>
          <Input label="Address" name="Address" value={formData.Address} onChange={handleChange} placeholder="123 Main St, City, State" />
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="bg-red-me px-6 py-2.5 text-white hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition-all hover:shadow-lg"
            >
              Save Owner
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Owners;