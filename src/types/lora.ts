export interface LoRaReading {
  timestamp: string;
  RSSIbob: number;
  RSSIalice: number;
}

export interface LoRaStatus {
  current: LoRaReading;
  history: LoRaReading[];
}

export type SignalStrength = 'excellent' | 'good' | 'fair' | 'poor' | 'offline';