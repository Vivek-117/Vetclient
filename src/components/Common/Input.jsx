import React from 'react';

const Input = ({ label, type = "text", value, onChange, required, placeholder, options, name }) => {
  const baseClasses = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all";
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {type === 'select' ? (
        <select 
          name={name}
          value={value} 
          onChange={onChange} 
          className={baseClasses}
          required={required}
        >
          <option value="">Select {label}</option>
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea 
          name={name}
          value={value} 
          onChange={onChange} 
          placeholder={placeholder} 
          className={baseClasses}
          rows="3"
          required={required}
        />
      ) : (
        <input 
          type={type}
          name={name}
          value={value} 
          onChange={onChange} 
          placeholder={placeholder} 
          className={baseClasses}
          required={required}
        />
      )}
    </div>
  );
};

export default Input;