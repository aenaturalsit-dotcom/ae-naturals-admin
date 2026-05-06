// src/app/admin/orders/AdminTrackingLogs.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { RefreshCcw, FileJson, AlertCircle } from 'lucide-react';
import apiClient from '@/lib/api-client'; // Adjust import based on your setup

export const AdminTrackingLogs = ({ orderId, currentStatus }: { orderId: string, currentStatus: string }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [selectedPayload, setSelectedPayload] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const { data } = await apiClient.get(`/admin/orders/${orderId}/tracking-logs`);
      // 🔥 FIX: Guarantee that we are setting an array in state. 
      // If the backend returns undefined, null, or a plain object, fallback to [].
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch tracking logs', error);
      setLogs([]); // Fallback to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchLogs();
    }
  }, [orderId]);

  const handleRetryShipment = async () => {
    if (!confirm('Are you sure you want to re-queue this order for shipment creation?')) return;
    
    setRetrying(true);
    try {
      await apiClient.post(`/admin/fulfillment/retry/${orderId}`);
      alert('Shipment retry queued successfully. Check back in a minute.');
      fetchLogs();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to retry shipment');
    } finally {
      setRetrying(false);
    }
  };

  if (loading) return <div className="p-4 text-gray-500 animate-pulse">Loading audit trail...</div>;

  // 🔥 FIX: Secondary safety net before rendering
  const safeLogs = Array.isArray(logs) ? logs : [];

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden mt-6">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50 border-b border-gray-200">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Tracking Audit Trail</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Historical log of all courier webhooks and system events.</p>
        </div>
        
        {/* Retry Button - Only show if order is stuck in PENDING or FAILED */}
        {(currentStatus === 'PENDING' || currentStatus === 'FAILED') && (
          <button
            onClick={handleRetryShipment}
            disabled={retrying}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Queuing...' : 'Retry Shipment Creation'}
          </button>
        )}
      </div>

      {safeLogs.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p>No tracking events recorded yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payload</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {safeLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(log.eventTimestamp), 'MMM dd, yyyy HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${log.source === 'COURIER_WEBHOOK' ? 'bg-blue-100 text-blue-800' : 
                        log.source === 'ADMIN_MANUAL' ? 'bg-purple-100 text-purple-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {log.source.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.status}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={log.message}>
                    {log.message}
                    {log.location && <span className="block text-xs text-gray-400">{log.location}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.rawPayload && (
                      <button 
                        onClick={() => setSelectedPayload(JSON.stringify(log.rawPayload, null, 2))}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        <FileJson className="h-4 w-4 mr-1" /> View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Raw Payload Modal */}
      {selectedPayload && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Raw Webhook Payload</h3>
              <button onClick={() => setSelectedPayload(null)} className="text-gray-400 hover:text-gray-500">✕</button>
            </div>
            <div className="p-4 overflow-y-auto bg-gray-900 text-gray-100 font-mono text-xs rounded-b-lg">
              <pre>{selectedPayload}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};