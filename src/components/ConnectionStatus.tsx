import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  error: string | null;
  lastUpdated: Date;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  isConnected, 
  error, 
  lastUpdated 
}) => {
  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Connection Error</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
      isConnected 
        ? 'text-green-600 bg-green-50 border-green-200' 
        : 'text-orange-600 bg-orange-50 border-orange-200'
    }`}>
      {isConnected ? (
        <Wifi className="w-4 h-4" />
      ) : (
        <WifiOff className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        {isConnected ? 'Connected to Firebase' : 'Connecting...'}
      </span>
    </div>
  );
};