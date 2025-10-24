export interface Pollution {
  id: number;
  title: string;
  type: 'Plastique' | 'Chimique' | 'Dépôt sauvage' | 'Eau' | 'Air' | 'Autre';
  description: string;
  dateObservation: Date;
  location: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'reported' | 'in-progress' | 'resolved';
  reportedDate?: Date;
}
