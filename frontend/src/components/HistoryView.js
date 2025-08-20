import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';

function HistoryView() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axiosInstance.get('/dhcp/history');
        setHistory(res.data);
        setError('');
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Erreur lors du chargement de l\'historique';
        setError(errorMessage);
        console.error('Erreur:', errorMessage, 'Statut:', err.response?.status);
      }
    };
    fetchHistory();
  }, []);

  const getActionColor = (action) => {
    switch (action.toLowerCase()) {
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 rounded-full px-2 py-1 text-xs font-semibold';
      case 'assigned':
        return 'bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs font-semibold';
      case 'freed':
        return 'bg-red-100 text-red-800 rounded-full px-2 py-1 text-xs font-semibold';
      default:
        return 'bg-gray-100 text-gray-800 rounded-full px-2 py-1 text-xs font-semibold';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-purple-700">
        Historique des Attributions
      </h1>

      {error && (
        <div className="text-red-700 bg-red-100 p-3 rounded mb-4 border border-red-300">
          {error}
        </div>
      )}

      {history.length === 0 && !error ? (
        <p className="text-gray-600">Aucun historique trouvé.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow border border-purple-200 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-100">
          <table className="min-w-full divide-y divide-purple-200">
            {/* ✅ palette violet/rose */}
            <thead className="bg-purple-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">IP</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">MAC</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100">
              {history.map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 transition-colors"
                >
                  <td className="px-4 py-2">
                    <span className={getActionColor(entry.action)}>
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-4 py-2">{entry.ip}</td>
                  <td className="px-4 py-2">{entry.mac || 'N/A'}</td>
                  <td className="px-4 py-2">
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default HistoryView;
