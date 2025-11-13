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
  city: string;
  state: string;
  zipCode: string;
}


export interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  bio?: string;
  serviceIds: string[];
  // These are not in firestore yet, but needed for card
  rating?: number;
  reviews?: number;
  avatarUrl?: string;
  coverImageUrl?: string;
}
