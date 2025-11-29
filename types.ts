export interface RoomAvailability {
  roomNo: number;
  floor: number;
  category: number;
  isAvailable: boolean;
  leavingDate: string | null; // ISO Date string
}

export interface CustomerDetails {
  id?: string;
  name: string;
  phoneNumber: number;
  age: number;
  roomNo: number;
  leavingDate: string; // ISO Date string
  checkedInAt: string; // ISO Date string
}

export interface RoomCategory {
  id: number;
  name: string;
  price: number;
  description: string;
}

export enum CATEGORY_ID {
  NON_AC = 1,
  AC = 2,
  BEACH_VIEW_NON_AC = 3,
  BEACH_VIEW_AC = 4,
}

// Stats interface for the dashboard
export interface HotelStats {
  totalRooms: number;
  occupiedRooms: number;
  revenue: number; // Mock revenue based on occupancy
  occupancyRate: number;
}