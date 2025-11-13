export interface Booking {
  id: string;
  userId: string;
  workerId: string;
  serviceId: string;
  bookingDate: string; // Stored as ISO string
  status: 'pending' | 'confirmed' | 'en-route' | 'in-progress' | 'completed' | 'cancelled';
  completionCode?: string; // 4-digit code to confirm completion
  // Customer info
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  reviewSubmitted?: boolean;
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
  // Review aggragate data
  reviewCount?: number;
  averageRating?: number;
  // These are not in firestore yet, but needed for card
  rating?: number;
  reviews?: number;
  avatarUrl?: string;
  coverImageUrl?: string;
}

export interface Review {
    id: string;
    workerId: string;
    userId: string;
    userName: string;
    userPhotoURL?: string;
    rating: number; // 1-5
    comment: string;
    createdAt: string; // ISO string
}
    
