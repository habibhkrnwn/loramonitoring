import { useState, useEffect, useCallback } from 'react';
import { LoRaReading, LoRaStatus } from '../types/lora';
import { LoRaService } from '../services/loraService';

export const useLoRaData = () => {
  const [data, setData] = useState<LoRaStatus>({
    current: {
      timestamp: new Date().toISOString().replace(/[-:]/g, '').slice(0, 15),
      RSSIbob: 0,
      RSSIalice: 0,
    },
    history: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isConnected, setIsConnected] = useState(false);

  const loraService = LoRaService.getInstance();

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const newData = await loraService.getLoRaStatus();
      setData(newData);
      setLastUpdated(new Date());
      setIsConnected(true);
    } catch (err) {
      console.error('Failed to load LoRa data:', err);
      setError('Failed to connect to Firebase database');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [loraService]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await loadData();
  }, [loadData]);

  useEffect(() => {
    // Initial data load
    loadData();

    // Set up real-time listener
    const listenerId = loraService.subscribeToUpdates((newData) => {
      setData(newData);
      setLastUpdated(new Date());
      setIsConnected(true);
      setError(null);
    });

    // Cleanup listener on unmount
    return () => {
      loraService.unsubscribeFromUpdates(listenerId);
    };
  }, [loadData, loraService]);

  // Fallback polling every 30 seconds if real-time updates fail
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isConnected) {
        loadData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, loadData]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    isConnected,
  };
};