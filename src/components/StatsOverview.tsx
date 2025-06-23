import React from 'react';
import { BarChart3, TrendingUp, Clock, Zap } from 'lucide-react';
import { LoRaReading } from '../types/lora';

interface StatsOverviewProps {
  history: LoRaReading[];
  current: LoRaReading;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ history, current }) => {
  const calculateStats = () => {
    const bobReadings = history.map(r => r.RSSIbob);
    const aliceReadings = history.map(r => r.RSSIalice);
    
    const bobAvg = bobReadings.reduce((a, b) => a + b, 0) / bobReadings.length;
    const aliceAvg = aliceReadings.reduce((a, b) => a + b, 0) / aliceReadings.length;
    
    const bobMin = Math.min(...bobReadings);
    const bobMax = Math.max(...bobReadings);
    const aliceMin = Math.min(...aliceReadings);
    const aliceMax = Math.max(...aliceReadings);
    
    return {
      bobAvg: bobAvg.toFixed(1),
      aliceAvg: aliceAvg.toFixed(1),
      bobRange: `${bobMin.toFixed(1)} to ${bobMax.toFixed(1)}`,
      aliceRange: `${aliceMin.toFixed(1)} to ${aliceMax.toFixed(1)}`,
      totalReadings: history.length,
    };
  };

  const stats = calculateStats();

  const statCards = [
    {
      icon: BarChart3,
      title: 'Total Readings',
      value: stats.totalReadings.toString(),
      subtitle: 'Data points collected',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      icon: TrendingUp,
      title: 'Bob Average',
      value: `${stats.bobAvg} dBm`,
      subtitle: `Range: ${stats.bobRange} dBm`,
      color: 'text-green-600 bg-green-50 border-green-200',
    },
    {
      icon: Zap,
      title: 'Alice Average',
      value: `${stats.aliceAvg} dBm`,
      subtitle: `Range: ${stats.aliceRange} dBm`,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      icon: Clock,
      title: 'Uptime',
      value: '99.8%',
      subtitle: 'System availability',
      color: 'text-orange-600 bg-orange-50 border-orange-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className={`p-6 rounded-xl border-2 ${stat.color} transition-all duration-300 hover:shadow-lg`}>
          <div className="flex items-center space-x-3 mb-3">
            <stat.icon className="w-6 h-6" />
            <h3 className="font-semibold text-sm opacity-80">{stat.title}</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs opacity-70">{stat.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
};