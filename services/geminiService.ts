
import { GoogleGenAI, Type } from "@google/genai";
import { OCRResult, TransactionType, Category, GuestData } from "../types";

// Initialize AI
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const processReceiptOCR = async (base64Image: string, intent: 'INCOME' | 'EXPENSE' | 'GENERAL' = 'GENERAL'): Promise<OCRResult> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';

  const systemInstruction = `You are a professional accountant for a high-end resort in Thailand.
  Task: Extract financial data from receipt/slip images.
  Intent: ${intent}.
  
  Classification Logic:
  - INCOME: Receipts issued by the resort to guests (room fees, food, spa).
  - EXPENSE: Invoices/slips from suppliers (7-11, utilities, payroll).
  
  Available Categories (Thai):
  Income: 'ค่าห้องพัก', 'อาหารและเครื่องดื่ม', 'สปาและนวด', 'รายได้อื่นๆ'
  Expense: 'ค่าสาธารณูปโภค (น้ำ/ไฟ/เน็ต)', 'เงินเดือนและค่าแรง', 'การตลาด/ค่าคอมมิชชั่น OTA', 'ค่าซ่อมบำรุง', 'วัสดุอุปกรณ์/เครื่องใช้', 'ภาษีและค่าธรรมเนียม', 'ค่าซอฟต์แวร์/แอปพลิเคชัน', 'วัสดุสำนักงาน', 'วัสดุทำความสะอาด'

  Return ONLY valid JSON.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Extract details into JSON: date (YYYY-MM-DD), amount (number), type (INCOME/EXPENSE), category (from list), description (string), confidence (0-1)." }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as OCRResult;
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("AI could not process this image. Please ensure it's a clear financial document.");
  }
};

export const processIDCardOCR = async (base64Image: string): Promise<GuestData> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';

  const systemInstruction = `Extract Thai National ID card information.
  - Convert BE year to AD (e.g. 2567 -> 2024).
  - idNumber must be 13 digits string.
  - Return JSON matching GuestData interface.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Extract: idNumber, title, firstNameTH, lastNameTH, firstNameEN, lastNameEN, address, dob, issueDate, expiryDate." }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}') as GuestData;
  } catch (error) {
    console.error("ID OCR Error:", error);
    throw new Error("Failed to scan ID card. Please try again with a clearer photo.");
  }
};
