import { RoomCategory, CATEGORY_ID } from './types';

export const ROOM_CATEGORIES: Record<number, RoomCategory> = {
  [CATEGORY_ID.NON_AC]: { id: 1, name: 'Non AC', price: 50, description: 'Standard room, budget friendly.' },
  [CATEGORY_ID.AC]: { id: 2, name: 'AC', price: 80, description: 'Climate controlled comfort.' },
  [CATEGORY_ID.BEACH_VIEW_NON_AC]: { id: 3, name: 'Beach View Non AC', price: 100, description: 'Stunning views, natural breeze.' },
  [CATEGORY_ID.BEACH_VIEW_AC]: { id: 4, name: 'Beach View AC', price: 150, description: 'Premium comfort with ocean views.' },
};

export const MAX_FLOORS = 5;

// Helper to format date consistent with Java logic
export const formatDate = (dateString: string | null) => {
  if (!dateString || dateString === 'null') return 'N/A';
  return new Date(dateString).toLocaleString();
};

// SQL Schema matching the Java Classes provided by user
export const SUPABASE_SCHEMA_INSTRUCTIONS = `
-- 1. Create tables if they don't exist (matching Java Class naming)
create table if not exists "rooms" (
  "roomNo" bigint primary key,
  "isAvailable" boolean default true,
  "leavingDate" text
);

create table if not exists "customerDetails" (
  "id" uuid default gen_random_uuid() primary key,
  "name" text not null,
  "phoneNumber" bigint not null,
  "age" int not null,
  "roomNo" bigint references "rooms"("roomNo"),
  "leavingDate" text
);

-- 2. RESET & ENABLE PERMISSIONS (Fixes RLS Errors)
-- We drop existing policies first to avoid "policy already exists" errors when re-running.

alter table "rooms" enable row level security;
drop policy if exists "Allow all access to rooms" on "rooms";
create policy "Allow all access to rooms" on "rooms" for all using (true) with check (true);

alter table "customerDetails" enable row level security;
drop policy if exists "Allow all access to customerDetails" on "customerDetails";
create policy "Allow all access to customerDetails" on "customerDetails" for all using (true) with check (true);
`;