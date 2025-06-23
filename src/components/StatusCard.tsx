import React from 'react';
import { Wifi, WifiOff, Activity, Radio, RadioIcon } from 'lucide-react';
import { getSignalStrength, getSignalColor } from '../utils/signalUtils';

interface StatusCardProps {
  title: string;
  rssi: number;
  deviceName: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({ title, rssi, deviceName }) => {
  const strength = getSignalStrength(rssi);
  const colorClasses = getSignalColor(strength);
  const isOnline = strength !== 'offline';
  const isCommunicating = rssi > -100 && rssi < 0; // Valid RSSI range indicates communication

  // Determine communication status
  const getCommunicationStatus = () => {
    if (!isCommunicating) return { status: 'No Communication', color: 'text-red-600' };
    if (strength === 'excellent' || strength === 'good') return { status: 'Strong Communication', color: 'text-green-600' };
    if (strength === 'fair') return { status: 'Moderate Communication', color: 'text-yellow-600' };
    if (strength === 'poor') return { status: 'Weak Communication', color: 'text-orange-600' };
    return { status: 'No Communication', color: 'text-red-600' };
  };

  const commStatus = getCommunicationStatus();

  return (
    <div className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${colorClasses}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {isOnline ? (
            <Wifi className="w-6 h-6" />
          ) : (
            <WifiOff className="w-6 h-6" />
          )}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 opacity-70" />
          {isCommunicating ? (
            <Radio className="w-5 h-5 animate-pulse" />
          ) : (
            <RadioIcon className="w-5 h-5 opacity-50" />
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm opacity-80">Device:</span>
          <span className="font-medium">{deviceName}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm opacity-80">RSSI:</span>
          <span className="text-2xl font-bold">{rssi.toFixed(1)} dBm</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm opacity-80">Signal:</span>
          <span className="font-medium capitalize">{strength}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm opacity-80">Status:</span>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isCommunicating ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className={`font-medium text-sm ${commStatus.color}`}>
              {commStatus.status}
            </span>
          </div>
        </div>
      </div>
      
      {/* Signal strength indicator */}
      <div className="mt-4 flex space-x-1">
        {[1, 2, 3, 4, 5].map((bar) => (
          <div
            key={bar}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              bar <= (['offline', 'poor', 'fair', 'good', 'excellent'].indexOf(strength) + 1)
                ? 'bg-current opacity-100'
                : 'bg-current opacity-20'
            }`}
          />
        ))}
      </div>

      {/* Communication indicator */}
      <div className="mt-3 text-center">
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
          isCommunicating 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isCommunicating ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span>{isCommunicating ? 'Communicating' : 'Not Communicating'}</span>
        </div>
      </div>
    </div>
  );
};