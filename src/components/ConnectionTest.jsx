import React, { useState, useEffect } from 'react';

const ConnectionTest = () => {
    const [status, setStatus] = useState('checking'); // checking, connected, error
    const [details, setDetails] = useState(null);

    useEffect(() => {
        testConnection();
    }, []);

    const testConnection = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/test');
            const data = await response.json();
            
            if (response.ok) {
                setStatus('connected');
                setDetails(data);
            } else {
                setStatus('error');
                setDetails(data);
            }
        } catch (error) {
            setStatus('error');
            setDetails({ error: error.message });
        }
    };

    const testAllEndpoints = async () => {
        const endpoints = [
            { name: 'Owners', url: '/owners' },
            { name: 'Pets', url: '/pets' },
            { name: 'Appointments', url: '/appointments' },
            { name: 'Bills', url: '/bills' },
            { name: 'Veterinarians', url: '/veterinarians' }
        ];

        const results = await Promise.all(
            endpoints.map(async (ep) => {
                try {
                    const res = await fetch(`http://localhost:5000/api${ep.url}`);
                    const data = await res.json();
                    return { 
                        name: ep.name, 
                        status: res.ok ? '✅ OK' : '❌ Failed',
                        count: Array.isArray(data) ? data.length : 0
                    };
                } catch (err) {
                    return { name: ep.name, status: '❌ Error', count: 0 };
                }
            })
        );

        return results;
    };

    const [endpointStatus, setEndpointStatus] = useState([]);

    const runFullTest = async () => {
        setStatus('checking');
        const results = await testAllEndpoints();
        setEndpointStatus(results);
        setStatus('completed');
    };

    return (
        <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 max-w-2xl mx-auto mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🔌 Database Connection Test</h2>
            
            {/* Main Status */}
            <div className={`p-4 rounded-xl mb-4 ${
                status === 'connected' ? 'bg-green-50 border border-green-200' :
                status === 'error' ? 'bg-red-50 border border-red-200' :
                'bg-amber-50 border border-amber-200'
            }`}>
                <div className="flex items-center gap-3">
                    <span className="text-2xl">
                        {status === 'connected' ? '✅' :
                         status === 'error' ? '❌' : '⏳'}
                    </span>
                    <div>
                        <p className="font-bold text-gray-800">
                            {status === 'connected' ? 'Connected to MySQL' :
                             status === 'error' ? 'Connection Failed' :
                             'Checking connection...'}
                        </p>
                        {details?.solution && (
                            <p className="text-sm text-green-600">MySQL responded: 1 + 1 = {details.solution}</p>
                        )}
                        {details?.error && (
                            <p className="text-sm text-red-600">Error: {details.error}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-4">
                <button 
                    onClick={testConnection}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                    Test Connection
                </button>
                <button 
                    onClick={runFullTest}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                    Test All Endpoints
                </button>
            </div>

            {/* Endpoint Results */}
            {endpointStatus.length > 0 && (
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-700 mb-2">API Endpoints:</h3>
                    {endpointStatus.map((ep, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-700">{ep.name}</span>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500">{ep.count} records</span>
                                <span className={`font-bold ${
                                    ep.status.includes('✅') ? 'text-green-600' : 'text-red-600'
                                }`}>{ep.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Debug Info */}
            <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm">
                <p className="font-bold text-gray-700 mb-2">Configuration:</p>
                <ul className="space-y-1 text-gray-600 font-mono text-xs">
                    <li>Backend URL: http://localhost:5000</li>
                    <li>Database: petcare_db</li>
                    <li>MySQL Host: localhost:3306</li>
                    <li>localStorage: {localStorage.length} items (should be 0)</li>
                </ul>
            </div>
        </div>
    );
};

export default ConnectionTest;