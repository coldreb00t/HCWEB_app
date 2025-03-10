export interface Measurement {
  id: string;
  client_id: string;
  date: string;
  weight?: number;
  height?: number;
  body_fat_percentage?: number;
  created_at: string;
  body_measurements?: BodyMeasurement[];
}

export interface BodyMeasurement {
  id: string;
  measurement_id: string;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  calves?: number;
  shoulders?: number;
  created_at: string;
}

export interface MeasurementPhoto {
  id: string;
  client_id: string;
  photo_url: string;
  date: string;
  type: 'front' | 'side' | 'back' | 'other';
  notes?: string;
  created_at: string;
}

export interface MeasurementStats {
  currentWeight: number | null;
  initialWeight: number | null;
  weightChange: number | null;
  bodyFatPercentage?: number | null;
  bodyMeasurements?: {
    chest?: number[];
    waist?: number[];
    hips?: number[];
    arms?: number[];
    thighs?: number[];
  };
  dates?: string[];
} 