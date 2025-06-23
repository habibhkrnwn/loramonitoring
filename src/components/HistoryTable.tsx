import React, { useState } from 'react';
import { Download, Calendar, Clock, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { LoRaReading } from '../types/lora';
import { formatTimestamp, getSignalStrength, exportToCSV } from '../utils/signalUtils';
import { LoRaService } from '../services/loraService';

interface HistoryTableProps {
  history: LoRaReading[];
  onDataDeleted?: () => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ history, onDataDeleted }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = history.slice(startIndex, startIndex + itemsPerPage);

  const loraService = LoRaService.getInstance();

  const handleExportCSV = () => {
    const exportData = history.map(reading => ({
      timestamp: formatTimestamp(reading.timestamp),
      raw_timestamp: reading.timestamp,
      rssi_bob: reading.RSSIbob,
      rssi_alice: reading.RSSIalice,
      bob_signal_strength: getSignalStrength(reading.RSSIbob),
      alice_signal_strength: getSignalStrength(reading.RSSIalice),
    }));
    
    const filename = `lora-history-${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(exportData, filename);
  };

  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    try {
      await loraService.deleteAllData();
      setShowDeleteConfirm(false);
      if (onDataDeleted) {
        onDataDeleted();
      }
    } catch (error) {
      console.error('Failed to delete data:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getRSSITrend = (current: number, previous: number): 'up' | 'down' | 'same' => {
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'same';
  };

  // Generate page numbers for responsive pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Signal History</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete All</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete All Data</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete all LoRa data from Firebase? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllData}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-2 sm:px-4 py-3 text-left text-sm font-semibold text-gray-600">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">Timestamp</span>
                  <span className="sm:hidden">Time</span>
                </div>
              </th>
              <th className="px-2 sm:px-4 py-3 text-center text-sm font-semibold text-gray-600">Bob RSSI</th>
              <th className="px-2 sm:px-4 py-3 text-center text-sm font-semibold text-gray-600">Alice RSSI</th>
              <th className="px-2 sm:px-4 py-3 text-center text-sm font-semibold text-gray-600 hidden md:table-cell">Bob Status</th>
              <th className="px-2 sm:px-4 py-3 text-center text-sm font-semibold text-gray-600 hidden md:table-cell">Alice Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedHistory.map((reading, index) => {
              const prevReading = history[startIndex + index - 1];
              const bobTrend = prevReading ? getRSSITrend(reading.RSSIbob, prevReading.RSSIbob) : 'same';
              const aliceTrend = prevReading ? getRSSITrend(reading.RSSIalice, prevReading.RSSIalice) : 'same';
              const bobStrength = getSignalStrength(reading.RSSIbob);
              const aliceStrength = getSignalStrength(reading.RSSIalice);

              return (
                <tr key={reading.timestamp} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-2 sm:px-4 py-3 text-sm font-medium text-gray-900">
                    <div className="truncate">
                      <span className="hidden sm:inline">{formatTimestamp(reading.timestamp)}</span>
                      <span className="sm:hidden">{formatTimestamp(reading.timestamp).split(' ')[1]}</span>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                      <span className="font-mono text-xs sm:text-sm">{reading.RSSIbob.toFixed(1)}</span>
                      <span className="hidden sm:inline text-xs">dBm</span>
                      {bobTrend === 'up' && <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />}
                      {bobTrend === 'down' && <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />}
                    </div>
                    <div className="md:hidden mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        bobStrength === 'excellent' ? 'bg-green-100 text-green-800' :
                        bobStrength === 'good' ? 'bg-blue-100 text-blue-800' :
                        bobStrength === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                        bobStrength === 'poor' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {bobStrength}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                      <span className="font-mono text-xs sm:text-sm">{reading.RSSIalice.toFixed(1)}</span>
                      <span className="hidden sm:inline text-xs">dBm</span>
                      {aliceTrend === 'up' && <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />}
                      {aliceTrend === 'down' && <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />}
                    </div>
                    <div className="md:hidden mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        aliceStrength === 'excellent' ? 'bg-green-100 text-green-800' :
                        aliceStrength === 'good' ? 'bg-blue-100 text-blue-800' :
                        aliceStrength === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                        aliceStrength === 'poor' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {aliceStrength}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-center hidden md:table-cell">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      bobStrength === 'excellent' ? 'bg-green-100 text-green-800' :
                      bobStrength === 'good' ? 'bg-blue-100 text-blue-800' :
                      bobStrength === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                      bobStrength === 'poor' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {bobStrength}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-center hidden md:table-cell">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      aliceStrength === 'excellent' ? 'bg-green-100 text-green-800' :
                      aliceStrength === 'good' ? 'bg-blue-100 text-blue-800' :
                      aliceStrength === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                      aliceStrength === 'poor' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {aliceStrength}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Responsive Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <p className="text-sm text-gray-600 text-center sm:text-left">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, history.length)} of {history.length} entries
          </p>
          
          <div className="flex items-center space-x-1">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center px-2 sm:px-3 py-2 rounded bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Previous</span>
            </button>

            {/* Page Numbers */}
            <div className="flex space-x-1">
              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <span className="px-2 py-2 text-gray-400">...</span>
                  ) : (
                    <button
                      onClick={() => setCurrentPage(page as number)}
                      className={`px-2 sm:px-3 py-2 rounded transition-colors text-sm ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center px-2 sm:px-3 py-2 rounded bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200 transition-colors"
            >
              <span className="hidden sm:inline mr-1">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};