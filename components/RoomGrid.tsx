import React from 'react';
import { RoomAvailability } from '../types';
import { ROOM_CATEGORIES, MAX_FLOORS, formatDate } from '../constants';
import { User, Check } from 'lucide-react';

interface RoomGridProps {
  rooms: RoomAvailability[];
}

const RoomGrid: React.FC<RoomGridProps> = ({ rooms }) => {
  // Group by floor
  const floors = Array.from({ length: MAX_FLOORS }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {floors.map(floor => {
        const floorRooms = rooms.filter(r => r.floor === floor).sort((a, b) => a.roomNo - b.roomNo);
        return (
          <div key={floor} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm">F{floor}</span>
              Floor {floor}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {floorRooms.map(room => (
                <div 
                  key={room.roomNo} 
                  className={`relative p-3 rounded-lg border flex flex-col items-center justify-between h-28 transition-all hover:shadow-md
                    ${room.isAvailable 
                      ? 'bg-green-50 border-green-200 hover:border-green-300' 
                      : 'bg-red-50 border-red-200 hover:border-red-300'}`}
                >
                  <div className="text-xs font-semibold text-slate-500 uppercase text-center leading-tight mb-1">
                    {ROOM_CATEGORIES[room.category].name}
                  </div>
                  
                  <div className="text-xl font-bold text-slate-800">{room.roomNo}</div>
                  
                  <div className={`mt-1 flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full
                    ${room.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {room.isAvailable ? (
                      <>
                        <Check className="w-3 h-3" />
                        Available
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3" />
                        Occupied
                      </>
                    )}
                  </div>
                  
                  {!room.isAvailable && room.leavingDate && (
                    <div title={`Leaving: ${formatDate(room.leavingDate)}`} className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RoomGrid;