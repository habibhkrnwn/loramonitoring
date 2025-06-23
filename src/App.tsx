import React from 'react';
import { RefreshCw, Radio, Shield, AlertTriangle } from 'lucide-react';
import { useLoRaData } from './hooks/useLoRaData';
import { StatusCard } from './components/StatusCard';
import { HistoryTable } from './components/HistoryTable';
import { StatsOverview } from './components/StatsOverview';
import { ConnectionStatus } from './components/ConnectionStatus';
import { formatTimestamp } from './utils/signalUtils';

function App() {
  const { data, isLoading, error, lastUpdated, refreshData, isConnected } = useLoRaData();

  const handleDataDeleted = () => {
    // Refresh data after deletion
    refreshData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-6 gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Radio className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">LoRa Monitor</h1>
                  <p className="text-sm text-gray-600">Heltec Packet Monitoring System</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
              <ConnectionStatus 
                isConnected={isConnected} 
                error={error} 
                lastUpdated={lastUpdated} 
              />
              <div className="text-left sm:text-right">
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {lastUpdated.toLocaleString()}
                </p>
              </div>
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 w-full sm:w-auto"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-medium">Connection Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Status */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-6">
            <Shield className="w-6 h-6 text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-800">Current Status</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span>{isConnected ? 'Live Data' : 'Offline'}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <StatusCard
              title="Signal from Bob"
              rssi={data.current.RSSIbob}
              deviceName="Heltec Node B"
            />
            <StatusCard
              title="Signal from Alice"
              rssi={data.current.RSSIalice}
              deviceName="Heltec Node A"
            />
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Latest Reading</h3>
                <p className="text-gray-600">
                  Captured at {formatTimestamp(data.current.timestamp)}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm text-gray-600 mb-1">Firebase Status</p>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Overview */}
        <StatsOverview history={data.history} current={data.current} />

        {/* History */}
        <section>
          <HistoryTable history={data.history} onDataDeleted={handleDataDeleted} />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 text-center sm:text-left">
              © 2025 LoRa Monitoring System. Real-time Firebase integration.
            </p>
            <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-gray-600">
              <span>Real-time updates</span>
              <span className="hidden sm:inline">•</span>
              <span>Data retention: {data.history.length} readings</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;