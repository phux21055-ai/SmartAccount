
export interface RoomType {
  name: string;
  pricePerNight: number;
  rooms: string[];
  bedInfo: string;
  amenities: string[];
}

export const EXTRA_GUEST_PRICE = 300;

export const DEFAULT_ROOM_TYPES: RoomType[] = [
  { 
    name: 'Deluxe Double Room (A)', 
    pricePerNight: 800, 
    rooms: ['1', '2', '3', '5', '6', '7', '8', '9'], 
    bedInfo: 'เตียง 5 ฟุต + โซฟาตัว L',
    amenities: ['ทีวี', 'ตู้เย็น', 'ผ้าเช็ดตัว', 'ไดร์เป่าผม', 'กาต้มน้ำ', 'เครื่องทำน้ำอุ่น', 'เครื่องปรับอากาศ', 'ผ้าห่ม', 'WIFI']
  },
  { 
    name: 'Deluxe Double Room (B)', 
    pricePerNight: 750, 
    rooms: ['13'], 
    bedInfo: 'เตียง 5 ฟุต + โต๊ะชุด',
    amenities: ['ทีวี', 'ตู้เย็น', 'ผ้าเช็ดตัว', 'ไดร์เป่าผม', 'กาต้มน้ำ', 'เครื่องทำน้ำอุ่น', 'เครื่องปรับอากาศ', 'ผ้าห่ม', 'WIFI']
  },
  { 
    name: 'Deluxe Double Room (C)', 
    pricePerNight: 850, 
    rooms: ['14'], 
    bedInfo: 'เตียง 6 ฟุต King Bed + โซฟาสั้น',
    amenities: ['ทีวี', 'ตู้เย็น', 'ผ้าเช็ดตัว', 'ไดร์เป่าผม', 'กาต้มน้ำ', 'เครื่องทำน้ำอุ่น', 'เครื่องปรับอากาศ', 'ผ้าห่ม', 'WIFI']
  },
  { 
    name: 'Deluxe Triple Room (A)', 
    pricePerNight: 1200, 
    rooms: ['4'], 
    bedInfo: 'เตียง 5 ฟุต กับ 3.5 ฟุต + โซฟาสั่น + ชุดโต๊ะ',
    amenities: ['ทีวี', 'ตู้เย็น', 'ผ้าเช็ดตัว', 'ไดร์เป่าผม', 'กาต้มน้ำ', 'เครื่องทำน้ำอุ่น', 'เครื่องปรับอากาศ', 'ผ้าห่ม', 'WIFI']
  },
  { 
    name: 'Deluxe Triple Room (B)', 
    pricePerNight: 1200, 
    rooms: ['10', '11', '12'], 
    bedInfo: 'เตียง 5 ฟุตกับ 3.5 ฟุต + โซฟาตัว L',
    amenities: ['ทีวี', 'ตู้เย็น', 'ผ้าเช็ดตัว', 'ไดร์เป่าผม', 'กาต้มน้ำ', 'เครื่องทำน้ำอุ่น', 'เครื่องปรับอากาศ', 'ผ้าห่ม', 'WIFI']
  },
  { 
    name: 'Deluxe Twin Room', 
    pricePerNight: 950, 
    rooms: ['15'], 
    bedInfo: 'เตียง 3.5 ฟุตกับ 3.5 ฟุต + ชุดโต๊ะ',
    amenities: ['ทีวี', 'ตู้เย็น', 'ผ้าเช็ดตัว', 'ไดร์เป่าผม', 'กาต้มน้ำ', 'เครื่องทำน้ำอุ่น', 'เครื่องปรับอากาศ', 'ผ้าห่ม', 'WIFI']
  },
];

export const getRoomTypeByNumber = (roomNumber: string): RoomType | undefined => {
  return DEFAULT_ROOM_TYPES.find(type => type.rooms.includes(roomNumber));
};

export const calculateNights = (checkIn: string, checkOut: string): number => {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const calculateTotalAmount = (roomNumber: string, checkIn: string, checkOut: string, extraGuests: number = 0): number => {
  const roomType = getRoomTypeByNumber(roomNumber);
  if (!roomType) return 0;
  const nights = calculateNights(checkIn, checkOut);
  const basePrice = roomType.pricePerNight * nights;
  const extraPrice = extraGuests * EXTRA_GUEST_PRICE * nights;
  return basePrice + extraPrice;
};

export const calculateDeposit = (totalAmount: number): number => {
  return 0; // ตามข้อมูลระบุว่าเก็บเงินประกันตามความเหมาะสมหากเกิดความเปื้อน ไม่ได้ระบุยอดเงินมัดจำกุญแจที่แน่นอน
};
