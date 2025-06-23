import { ref, get, onValue, off, remove } from 'firebase/database';
import { database } from '../config/firebase';
import { LoRaReading, LoRaStatus } from '../types/lora';

export class LoRaService {
  private static instance: LoRaService;
  private listeners: Map<string, (data: LoRaStatus) => void> = new Map();

  static getInstance(): LoRaService {
    if (!LoRaService.instance) {
      LoRaService.instance = new LoRaService();
    }
    return LoRaService.instance;
  }

  // Convert Firebase timestamp format to our format
  private parseTimestamp(timestamp: string): string {
    // If already in correct format, return as is
    if (timestamp.includes('T') && timestamp.length === 15) {
      return timestamp;
    }
    
    // Handle various timestamp formats that might come from Firebase
    try {
      const date = new Date(timestamp);
      return date.toISOString().replace(/[-:]/g, '').slice(0, 15);
    } catch {
      return timestamp;
    }
  }

  // Fetch current status from Firebase
  async getCurrentStatus(): Promise<LoRaReading | null> {
    try {
      const latestRef = ref(database, 'heltec-packets/latest');
      const snapshot = await get(latestRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        return {
          timestamp: this.parseTimestamp(data.timestamp),
          RSSIbob: parseFloat(data.RSSIbob) || 0,
          RSSIalice: parseFloat(data.RSSIalice) || 0,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching current status:', error);
      return null;
    }
  }

  // Fetch historical data from Firebase
  async getHistoricalData(): Promise<LoRaReading[]> {
    try {
      const packetsRef = ref(database, 'heltec-packets');
      const snapshot = await get(packetsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const history: LoRaReading[] = [];
        
        // Process all timestamp folders except 'latest'
        Object.keys(data).forEach(key => {
          if (key !== 'latest' && data[key]) {
            const reading = data[key];
            history.push({
              timestamp: this.parseTimestamp(reading.timestamp || key),
              RSSIbob: parseFloat(reading.RSSIbob) || 0,
              RSSIalice: parseFloat(reading.RSSIalice) || 0,
            });
          }
        });
        
        // Sort by timestamp (newest first)
        return history.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      }
      return [];
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  }

  // Get complete LoRa status (current + history)
  async getLoRaStatus(): Promise<LoRaStatus> {
    try {
      const [current, history] = await Promise.all([
        this.getCurrentStatus(),
        this.getHistoricalData()
      ]);

      // If no current data, use the latest from history
      const currentReading = current || (history.length > 0 ? history[0] : {
        timestamp: new Date().toISOString().replace(/[-:]/g, '').slice(0, 15),
        RSSIbob: 0,
        RSSIalice: 0,
      });

      return {
        current: currentReading,
        history: history
      };
    } catch (error) {
      console.error('Error fetching LoRa status:', error);
      // Return empty data structure on error
      return {
        current: {
          timestamp: new Date().toISOString().replace(/[-:]/g, '').slice(0, 15),
          RSSIbob: 0,
          RSSIalice: 0,
        },
        history: []
      };
    }
  }

  // Delete all data from Firebase
  async deleteAllData(): Promise<void> {
    try {
      const packetsRef = ref(database, 'heltec-packets');
      await remove(packetsRef);
      console.log('All LoRa data deleted successfully');
    } catch (error) {
      console.error('Error deleting data:', error);
      throw new Error('Failed to delete data from Firebase');
    }
  }

  // Delete specific timestamp data
  async deleteTimestampData(timestamp: string): Promise<void> {
    try {
      const timestampRef = ref(database, `heltec-packets/${timestamp}`);
      await remove(timestampRef);
      console.log(`Data for timestamp ${timestamp} deleted successfully`);
    } catch (error) {
      console.error('Error deleting timestamp data:', error);
      throw new Error(`Failed to delete data for timestamp ${timestamp}`);
    }
  }

  // Set up real-time listener for data changes
  subscribeToUpdates(callback: (data: LoRaStatus) => void): string {
    const listenerId = Math.random().toString(36).substr(2, 9);
    this.listeners.set(listenerId, callback);

    // Listen to the entire heltec-packets node
    const packetsRef = ref(database, 'heltec-packets');
    
    const unsubscribe = onValue(packetsRef, async (snapshot) => {
      try {
        const data = await this.getLoRaStatus();
        callback(data);
      } catch (error) {
        console.error('Error in real-time update:', error);
      }
    });

    // Store the unsubscribe function
    (this.listeners.get(listenerId) as any).unsubscribe = unsubscribe;

    return listenerId;
  }

  // Remove real-time listener
  unsubscribeFromUpdates(listenerId: string): void {
    const listener = this.listeners.get(listenerId);
    if (listener && (listener as any).unsubscribe) {
      (listener as any).unsubscribe();
    }
    this.listeners.delete(listenerId);
  }

  // Manual refresh method
  async refreshData(): Promise<LoRaStatus> {
    return await this.getLoRaStatus();
  }
}