import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Common/Input';

const Login = () => {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const success = login(formData.username, formData.password);
    if (!success) {
      setError('Invalid username or password');
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 p-4">
      <div className="bg-white rounded-3xl py-12 shadow-2xl p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-3xl mx-auto flex items-center justify-center text-white text-4xl mb-4 shadow-xl">
            <img src="logo.png" width="250" height="200"></img>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Paw Care</h1>
          <p className="text-gray-500">Caring for the pets</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Username" 
            name="username" 
            value={formData.username}
            onChange={handleChange}
            required 
            placeholder="Enter username"
          />
          <Input 
            label="Password" 
            name="password" 
            type="password"
            value={formData.password}
            onChange={handleChange}
            required 
            placeholder="Enter password"
          />
          
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-2 rounded-xl font-semibold text-lg mt-6 hover:shadow-lg hover:shadow-teal-600/30 transition-all hover:-translate-y-0.5"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;