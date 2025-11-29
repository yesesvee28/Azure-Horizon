import { supabase, isSupabaseConfigured } from './supabaseClient';
import { RoomAvailability, CustomerDetails, CATEGORY_ID } from '../types';
import { MAX_FLOORS } from '../constants';

// In-memory fallback if Supabase keys aren't provided
let localRooms: RoomAvailability[] = [];
let localCustomers: CustomerDetails[] = [];

// Helper to generate the static room structure defined in the Java logic
const generateStaticRooms = (): RoomAvailability[] => {
  const rooms: RoomAvailability[] = [];
  for (let floor = 1; floor <= MAX_FLOORS; floor++) {
    // Category 1: xx01, xx02
    rooms.push({ roomNo: floor * 100 + 1, floor, category: CATEGORY_ID.NON_AC, isAvailable: true, leavingDate: null });
    rooms.push({ roomNo: floor * 100 + 2, floor, category: CATEGORY_ID.NON_AC, isAvailable: true, leavingDate: null });
    // Category 2: xx03, xx04
    rooms.push({ roomNo: floor * 100 + 3, floor, category: CATEGORY_ID.AC, isAvailable: true, leavingDate: null });
    rooms.push({ roomNo: floor * 100 + 4, floor, category: CATEGORY_ID.AC, isAvailable: true, leavingDate: null });
    // Category 3: xx05, xx06
    rooms.push({ roomNo: floor * 100 + 5, floor, category: CATEGORY_ID.BEACH_VIEW_NON_AC, isAvailable: true, leavingDate: null });
    rooms.push({ roomNo: floor * 100 + 6, floor, category: CATEGORY_ID.BEACH_VIEW_NON_AC, isAvailable: true, leavingDate: null });
    // Category 4: xx07, xx08
    rooms.push({ roomNo: floor * 100 + 7, floor, category: CATEGORY_ID.BEACH_VIEW_AC, isAvailable: true, leavingDate: null });
    rooms.push({ roomNo: floor * 100 + 8, floor, category: CATEGORY_ID.BEACH_VIEW_AC, isAvailable: true, leavingDate: null });
  }
  return rooms;
};

// Helper to derive floor and category from roomNo (Replicating Java logic)
const getRoomMeta = (roomNo: number) => {
  const floor = Math.floor(roomNo / 100);
  const remainder = roomNo % 100;
  let category = 1;
  if (remainder >= 1 && remainder <= 2) category = 1;
  else if (remainder >= 3 && remainder <= 4) category = 2;
  else if (remainder >= 5 && remainder <= 6) category = 3;
  else if (remainder >= 7 && remainder <= 8) category = 4;
  return { floor, category };
};

// Initialize Local Mock Data
if (!isSupabaseConfigured) {
  localRooms = generateStaticRooms();
}

export const hotelService = {
  
  // Initialize Database (Seed)
  initializeRooms: async (): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      try {
        // Check if rooms exist. We use try-catch here so initialization failure (e.g. RLS) doesn't break the app.
        const { count, error: countError } = await supabase.from('rooms').select('*', { count: 'exact', head: true });
        
        if (countError) {
          // If RLS error (42501), warn user specifically
          if (countError.code === '42501') {
            console.warn("RLS Permission Error during initialization. Please run the SQL setup script.");
            throw new Error("DATABASE_RLS_ERROR");
          }
          console.warn("Warning checking rooms table:", JSON.stringify(countError));
          return;
        }

        if (count === 0) {
          console.log("Seeding rooms...");
          // Only insert the fields present in the user's schema (matching Java class)
          const staticRooms = generateStaticRooms().map(r => ({
            roomNo: r.roomNo,
            isAvailable: r.isAvailable,
            leavingDate: r.leavingDate
          }));
          
          const { error } = await supabase.from('rooms').insert(staticRooms);
          if (error) {
             console.error("Error seeding rooms:", JSON.stringify(error, null, 2));
             if (error.code === '42501') {
                throw new Error("DATABASE_RLS_ERROR");
             }
          } else {
             console.log("Rooms seeded successfully.");
          }
        }
      } catch (err) {
        // Rethrow known RLS errors so UI can handle them
        if (err instanceof Error && err.message === 'DATABASE_RLS_ERROR') {
          throw err;
        }
        console.warn("Unexpected error initializing rooms (non-fatal):", err);
      }
    } else {
      // Reset local mock
      localRooms = generateStaticRooms();
      localCustomers = [];
    }
  },

  // Get all rooms
  getRooms: async (): Promise<RoomAvailability[]> => {
    // 1. Check expiry first (Java: updateRoomStatusAfterExpiry)
    try {
        await hotelService.updateRoomStatusAfterExpiry();
    } catch (e) {
        console.warn("Failed to update expiry status:", e);
    }

    if (isSupabaseConfigured && supabase) {
      // NOTE: Using double quotes for camelCase columns is essential in Postgres/Supabase
      const { data, error } = await supabase
        .from('rooms')
        .select('"roomNo", "isAvailable", "leavingDate"')
        .order('roomNo');
      
      if (error) {
        if (error.code === '42501') throw new Error("DATABASE_RLS_ERROR");
        throw error;
      }
      if (!data) return [];
      
      return data.map((r: any) => {
        const { floor, category } = getRoomMeta(r.roomNo);
        return {
          roomNo: r.roomNo,
          floor: floor,
          category: category,
          isAvailable: r.isAvailable,
          leavingDate: r.leavingDate
        };
      });
    } else {
      return [...localRooms];
    }
  },

  // Get customers
  getCustomers: async (): Promise<CustomerDetails[]> => {
    if (isSupabaseConfigured && supabase) {
      // Use 'customerDetails' table and double quotes for camelCase columns
      const { data, error } = await supabase
        .from('customerDetails')
        .select('"name", "phoneNumber", "age", "roomNo", "leavingDate"');
        
      if (error) {
        if (error.code === '42501') throw new Error("DATABASE_RLS_ERROR");
        throw error;
      }
      if (!data) return [];

      return data.map((c: any, index: number) => ({
        id: index.toString(), // No ID in Java class, generating temporary one
        name: c.name,
        phoneNumber: c.phoneNumber,
        age: c.age,
        roomNo: c.roomNo,
        leavingDate: c.leavingDate,
        checkedInAt: new Date().toISOString() // Not stored in schema, mock for UI
      }));
    } else {
      return [...localCustomers];
    }
  },

  // Allocate Room (Java: allocateRoom)
  allocateRoom: async (
    customer: Omit<CustomerDetails, 'id' | 'roomNo' | 'checkedInAt'>,
    floor: number,
    category: number
  ): Promise<number | null> => {
    
    // Logic: Find first available room matching floor and category
    if (isSupabaseConfigured && supabase) {
      // Fetch all available rooms first (since floor/category aren't in DB to filter by)
      const { data: rooms, error } = await supabase
        .from('rooms')
        .select('"roomNo"')
        .eq('isAvailable', true);

      if (error) throw error;

      // Filter in memory to find one that matches requested floor/category
      const matchingRoom = rooms?.find((r: any) => {
        const meta = getRoomMeta(r.roomNo);
        return meta.floor === floor && meta.category === category;
      });

      if (!matchingRoom) return null;

      const roomNo = matchingRoom.roomNo;
      const leavingDateStr = customer.leavingDate;

      // Update room
      const { error: updateError } = await supabase
        .from('rooms')
        .update({ isAvailable: false, leavingDate: leavingDateStr })
        .eq('roomNo', roomNo);

      if (updateError) {
        if (updateError.code === '42501') throw new Error("Permissions missing. Please run the SQL in Setup tab.");
        throw updateError;
      }

      // Create customer record in 'customerDetails'
      const { error: insertError } = await supabase
        .from('customerDetails')
        .insert({
          name: customer.name,
          phoneNumber: customer.phoneNumber,
          age: customer.age,
          roomNo: roomNo,
          leavingDate: leavingDateStr
        });

      if (insertError) throw insertError;

      return roomNo;

    } else {
      // Local Mock Logic
      const roomIndex = localRooms.findIndex(r => 
        r.floor === floor && 
        r.category === category && 
        r.isAvailable
      );

      if (roomIndex === -1) return null;

      const room = localRooms[roomIndex];
      // Update room
      localRooms[roomIndex] = {
        ...room,
        isAvailable: false,
        leavingDate: customer.leavingDate
      };

      // Add customer
      localCustomers.unshift({
        ...customer,
        id: Math.random().toString(36).substr(2, 9),
        roomNo: room.roomNo,
        checkedInAt: new Date().toISOString()
      });

      return room.roomNo;
    }
  },

  // Update Status (Java: updateRoomStatusAfterExpiry)
  updateRoomStatusAfterExpiry: async (): Promise<void> => {
    const now = new Date();

    if (isSupabaseConfigured && supabase) {
      // Fetch occupied rooms
      // Use double quotes for column names
      const { data: occupiedRooms, error } = await supabase
        .from('rooms')
        .select('"roomNo", "leavingDate"')
        .eq('isAvailable', false);
      
      if (error) {
          if (error.code === '42501') return; // Silent return on RLS during polling
          console.warn("Error fetching rooms for expiry check:", JSON.stringify(error, null, 2));
          return;
      }

      if (occupiedRooms && occupiedRooms.length > 0) {
        const expiredIds = occupiedRooms
          .filter((r: any) => r.leavingDate && new Date(r.leavingDate) < now)
          .map((r: any) => r.roomNo);

        if (expiredIds.length > 0) {
          const { error: updateError } = await supabase
            .from('rooms')
            .update({ isAvailable: true, leavingDate: null })
            .in('roomNo', expiredIds);
          
          if (updateError) console.error("Error updating expired rooms:", JSON.stringify(updateError, null, 2));
        }
      }
    } else {
      localRooms.forEach(r => {
        if (!r.isAvailable && r.leavingDate && new Date(r.leavingDate) < now) {
          r.isAvailable = true;
          r.leavingDate = null;
        }
      });
    }
  }
};