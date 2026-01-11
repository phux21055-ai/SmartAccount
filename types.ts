
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum Category {
  // Income Categories
  ROOM_REVENUE = 'ค่าห้องพัก',
  FOOD_BEVERAGE = 'อาหารและเครื่องดื่ม',
  SPA_SERVICE = 'สปาและนวด',
  OTHER_INCOME = 'รายได้อื่นๆ',
  
  // Expense Categories
  UTILITIES = 'ค่าสาธารณูปโภค (น้ำ/ไฟ/เน็ต)',
  STAFF_SALARY = 'เงินเดือนและค่าแรง',
  MARKETING = 'การตลาด/ค่าคอมมิชชั่น OTA',
  MAINTENANCE = 'ค่าซ่อมบำรุง',
  SUPPLIES = 'วัสดุอุปกรณ์/เครื่องใช้',
  TAX_FEE = 'ภาษีและค่าธรรมเนียม',
  SOFTWARE_SUBSCRIPTION = 'ค่าซอฟต์แวร์/แอปพลิเคชัน',
  OFFICE_SUPPLIES = 'วัสดุสำนักงาน',
  CLEANING_SUPPLIES = 'วัสดุทำความสะอาด'
}

export interface GuestData {
  idNumber: string;
  title: string;
  firstNameTH: string;
  lastNameTH: string;
  firstNameEN: string;
  lastNameEN: string;
  address: string;
  dob: string;
  issueDate: string;
  expiryDate: string;
  religion?: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: Category;
  amount: number;
  description: string;
  imageUrl?: string;
  isReconciled: boolean;
  pmsReferenceId?: string;
  guestData?: GuestData;
}

export interface Booking {
  id: string;
  guestName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: 'confirmed' | 'checked_out' | 'pending';
  guestDetails?: GuestData;
}

export interface OCRResult {
  date: string;
  amount: number;
  type: TransactionType;
  category: Category;
  description: string;
  confidence: number;
}
