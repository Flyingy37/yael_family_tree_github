export enum EventType {
    FLIGHT = 'FLIGHT',
    HOTEL = 'HOTEL',
    ACTIVITY = 'ACTIVITY',
    FOOD = 'FOOD',
    TRANSPORT = 'TRANSPORT',
    SPORT = 'SPORT',
    SHOPPING = 'SHOPPING',
    FREE_TIME = 'FREE_TIME'
  }
  
  export interface TripEvent {
    id: string;
    time: string;
    title: string;
    description?: string;
    location?: string;
    type: EventType;
    link?: string; // Map link or general link
    notes?: string;
    attendees?: string[]; // If specific people only
    coords?: [number, number]; // [lat, lng]
    image?: string; // Image URL
    // New fields
    contactPhone?: string;
    paymentStatus?: 'PAID' | 'UNPAID';
    paymentLink?: string;
  }
  
  export interface TripDay {
    date: string;
    dayName: string;
    theme?: string;
    events: TripEvent[];
  }
  
  export interface Traveler {
    name: string;
    role?: string;
    icon?: string;
  }
  
  export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
    groundingLinks?: { title: string; uri: string }[];
  }