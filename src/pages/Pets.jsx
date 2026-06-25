import React, { useState } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import Modal from '../components/Common/Modal';
import Input from '../components/Common/Input';

const Pets = () => {
  const { data, insert, remove } = useDatabase();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [petType, setPetType] = useState('Dog');
  const [formData, setFormData] = useState({
    Name: '',
    Age: '',
    Gender: 'Male',
    OwnerID: '',
    Breed: '',
    IsTrained: false,
    IsIndoor: false,
    FurLength: '',
    PetCategory: '',
    SpecialCareInstructions: ''
  });

  const filteredPets = data.pets?.filter(p => {
    const owner = data.owners?.find(o => o.OwnerID === p.OwnerID);
    const petNameMatch = p.Name?.toLowerCase().includes(search.toLowerCase());
    const ownerNameMatch = owner?.Name?.toLowerCase().includes(search.toLowerCase());
    
    return petNameMatch || ownerNameMatch;
  }) || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    const petData = {
      Name: formData.Name,
      Age: parseInt(formData.Age),
      Gender: formData.Gender,
      OwnerID: parseInt(formData.OwnerID),
      Type: petType
    };

    // Add specialization attributes
    if (petType === 'Dog') {
      petData.Breed = formData.Breed;
      petData.IsTrained = formData.IsTrained;
    } else if (petType === 'Cat') {
      petData.Breed = formData.Breed;
      petData.IsIndoor = formData.IsIndoor;
      petData.FurLength = formData.FurLength;
    } else {
      petData.PetCategory = formData.PetCategory;
      petData.SpecialCareInstructions = formData.SpecialCareInstructions;
    }

    insert('pets', petData);
    setIsModalOpen(false);
    setFormData({
      Name: '', Age: '', Gender: 'Male', OwnerID: '',
      Breed: '', IsTrained: false, IsIndoor: false,
      FurLength: '', PetCategory: '', SpecialCareInstructions: ''
    });
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const getPetIcon = (type) => {
    if (type === 'Dog') return '🐕';
    if (type === 'Cat') return '🐈';
    return '🐾';
  };

  const getPetDetails = (pet) => {
    if (pet.Type === 'Dog') return `${pet.Breed} • ${pet.IsTrained ? 'Trained' : 'Not trained'}`;
    if (pet.Type === 'Cat') return `${pet.Breed} • ${pet.IsIndoor ? 'Indoor' : 'Outdoor'} • ${pet.FurLength} fur`;
    return pet.PetCategory || 'Other pet';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pet Management</h2>
          <p className="text-gray-500 text-sm mt-1">Register and manage pets with specialization</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-teal-700 transition-all hover:shadow-lg flex items-center gap-2"
        >
          <span className="text-xl">+</span> Register Pet
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <input 
            type="text" 
            placeholder="Search pets by name, or owner..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div className="grid gap-4">
          {filteredPets.map(pet => {
            const owner = data.owners?.find(o => o.OwnerID === pet.OwnerID);
            return (
              <div 
                key={pet.PetID} 
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl flex items-center justify-center text-3xl">
                      {getPetIcon(pet.Type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-800">{pet.Name}</h3>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                          {pet.Type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{getPetDetails(pet)} • {pet.Age} years • {pet.Gender}</p>
                      <p className="text-sm text-teal-600 mt-1 font-medium">Owner: {owner?.Name || 'Unknown'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => remove('pets', pet.PetID)}
                    className="bg-red-me text-white hover:text-red-800 text-sm font-medium px-6 py-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
          
          {filteredPets.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-400 text-lg">No pets registered yet</p>
              <p className="text-gray-400 text-sm mt-1">Add your first pet to get started</p>
            </div>
          )}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Pet" maxWidth="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Pet Name" name="Name" value={formData.Name} onChange={handleChange} required placeholder="Buddy" />
            <Input label="Pet Type" name="Type" type="select" value={petType} onChange={(e) => setPetType(e.target.value)} required options={[
              {value: 'Dog', label: '🐕 Dog'},
              {value: 'Cat', label: '🐈 Cat'},
              {value: 'Other', label: '🐾 Other'}
            ]} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="Age (years)" name="Age" type="number" value={formData.Age} onChange={handleChange} required placeholder="2" />
            <Input label="Gender" name="Gender" type="select" value={formData.Gender} onChange={handleChange} required options={[
              {value: 'Male', label: 'Male'},
              {value: 'Female', label: 'Female'}
            ]} />
            <Input label="Owner" name="OwnerID" type="select" value={formData.OwnerID} onChange={handleChange} required options={
              data.owners?.map(o => ({value: o.OwnerID, label: o.Name})) || []
            } />
          </div>

          {/* Specialization fields */}
          {petType === 'Dog' && (
            <div className="">
              <Input label="Breed" name="Breed" value={formData.Breed} onChange={handleChange} placeholder="Golden Retriever" />
              <label className="flex items-center gap-2">
                <input type="checkbox" name="IsTrained" checked={formData.IsTrained} onChange={handleChange} className="w-4 h-4 text-teal-600 rounded" />
                <span className="text-sm text-gray-700">Is trained</span>
              </label>
            </div>
          )}

          {petType === 'Cat' && (
            <div className="">
              <Input label="Breed" name="Breed" value={formData.Breed} onChange={handleChange} placeholder="Persian" />
              <Input label="Fur Length" name="FurLength" type="select" value={formData.FurLength} onChange={handleChange} options={[
                {value: 'Short', label: 'Short'},
                {value: 'Medium', label: 'Medium'},
                {value: 'Long', label: 'Long'}
              ]} />
              <label className="flex items-center gap-2">
                <input type="checkbox" name="IsIndoor" checked={formData.IsIndoor} onChange={handleChange} className="w-4 h-4 text-teal-600 rounded" />
                <span className="text-sm text-gray-700">Indoor cat</span>
              </label>
            </div>
          )}

          {petType === 'Other' && (
            <div className="">
              <Input label="Category" name="PetCategory" value={formData.PetCategory} onChange={handleChange} placeholder="Bird, Reptile, etc." />
              <Input label="Special Care Instructions" name="SpecialCareInstructions" type="textarea" value={formData.SpecialCareInstructions} onChange={handleChange} placeholder="Any special requirements..." />
            </div>
          )}

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
              Register Pet
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Pets;