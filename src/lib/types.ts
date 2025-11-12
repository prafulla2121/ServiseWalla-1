export interface Booking {
  id: string;
  userId: string;
  workerId: string;
  serviceId: string;
  bookingDate: string; // Stored as ISO string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  // Customer info
  name: string;
  email: string;
  phone: string;
  address: string;
}
