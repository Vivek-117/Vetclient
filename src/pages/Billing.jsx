import React, { useState } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import Modal from '../components/Common/Modal';
import Input from '../components/Common/Input';

const Billing = () => {
  const { data, insert, update } = useDatabase();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    OwnerID: '',
    Amount: '',
    Date: '',
    Description: ''
  });

  const filteredBills = data.bills?.filter(bill => {
    const owner = data.owners?.find(o => o.OwnerID === bill.OwnerID);
    const searchLower = search.toLowerCase();
    
    const matchesSearch = 
      owner?.Name?.toLowerCase().includes(searchLower) ||
      bill.Description?.toLowerCase().includes(searchLower) ||
      bill.BillID?.toString().includes(search) ||
      bill.Date?.includes(search);
    
    const matchesStatus = statusFilter === 'All' || bill.Status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const bills = [...filteredBills].sort((a, b) => b.BillID - a.BillID);
  
  
  const totalRevenue = bills.reduce((sum, b) => sum + (parseFloat(b.Amount) || 0), 0);
  const pendingCount = bills.filter(b => b.Status === 'Pending').length;
  const paidCount = bills.filter(b => b.Status === 'Paid').length;

  const handleSubmit = (e) => {
    e.preventDefault();
    insert('bills', {
      ...formData,
      OwnerID: parseInt(formData.OwnerID),
      Amount: parseFloat(formData.Amount),
      Status: 'Pending'
    });
    setIsModalOpen(false);
    setFormData({ OwnerID: '', Amount: '', Date: '', Description: '' });
  };

  const markAsPaid = (id) => {
    update('bills', id, { Status: 'Paid' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Billing & Invoices</h2>
          <p className="text-gray-500 text-sm mt-1">Generate and manage payment records</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-teal-700 transition-all hover:shadow-lg flex items-center gap-2"
        >
          <span className="text-xl">+</span> Generate Bill
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex gap-4">
        <input 
          type="text" 
          placeholder="Search by owner, description, invoice #, or date..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
        </select>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {bills.map(bill => {
            const owner = data.owners?.find(o => o.OwnerID === bill.OwnerID);
            return (
              <div key={bill.BillID} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-gray-500 font-mono">Invoice #{bill.BillID}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        bill.Status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {bill.Status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">{owner?.Name || 'Unknown Owner'}</h3>
                    <p className="text-sm text-gray-500">{bill.Date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-800">₹{bill.Amount}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 bg-gray-50 p-3 rounded-lg">{bill.Description}</p>
                
                {bill.Status === 'Pending' && (
                  <button 
                    onClick={() => markAsPaid(bill.BillID)}
                    className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    Mark as Paid
                  </button>
                )}
              </div>
            );
          })}
          
          {bills.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-400 text-lg">No bills generated yet</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-bold mb-2 opacity-90">Total Revenue</h3>
            <p className="text-4xl font-bold mb-1">₹{totalRevenue.toFixed(2)}</p>
            <p className="text-teal-100 text-sm">{bills.length} total invoices</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-800 mb-4">Payment Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 text-lg">⏳</div>
                  <div>
                    <p className="font-medium text-gray-800">Pending</p>
                    <p className="text-xs text-gray-500">Awaiting payment</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-amber-600">{pendingCount}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-lg">✓</div>
                  <div>
                    <p className="font-medium text-gray-800">Paid</p>
                    <p className="text-xs text-gray-500">Completed payments</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600">{paidCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate New Bill">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Owner" 
            name="OwnerID" 
            type="select" 
            value={formData.OwnerID}
            onChange={(e) => setFormData({...formData, OwnerID: e.target.value})}
            required 
            options={data.owners?.map(o => ({value: o.OwnerID, label: o.Name})) || []} 
          />
          <Input 
            label="Amount (₹)" 
            name="Amount" 
            type="number" 
            step="0.01"
            value={formData.Amount}
            onChange={(e) => setFormData({...formData, Amount: e.target.value})}
            required 
            placeholder="0.00" 
          />
          <Input 
            label="Date" 
            name="Date" 
            type="date" 
            value={formData.Date}
            onChange={(e) => setFormData({...formData, Date: e.target.value})}
            required 
          />
          <Input 
            label="Description" 
            name="Description" 
            type="textarea" 
            value={formData.Description}
            onChange={(e) => setFormData({...formData, Description: e.target.value})}
            placeholder="Services rendered, items billed, treatment details..."
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-700 hover:shadow-lg transition-all"
            >
              Generate Bill
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Billing;