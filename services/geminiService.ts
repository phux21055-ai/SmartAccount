
import { GoogleGenAI, Type } from "@google/genai";
import { OCRResult, TransactionType, Category, GuestData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const processReceiptOCR = async (base64Image: string, intent: 'INCOME' | 'EXPENSE' | 'GENERAL' = 'GENERAL'): Promise<OCRResult> => {
  const intentInstruction = intent === 'EXPENSE' 
    ? "The user has identified this specifically as an EXPENSE receipt. Favor EXPENSE classification unless it is clearly an income document."
    : intent === 'INCOME'
    ? "The user has identified this specifically as an INCOME slip. Favor INCOME classification."
    : "";

  const systemInstruction = `
    You are an expert accountant for a Thai resort. 
    Analyze the uploaded image (receipt, slip, invoice, or handheld note) and extract details in JSON format.
    
    ${intentInstruction}

    SPECIAL FOCUS ON EXPENSES:
    - If it's a 7-Eleven, Makro, or BigC receipt, categorize as 'วัสดุอุปกรณ์/เครื่องใช้'.
    - If it's an Electricity (PEA) or Water (PWA) bill, categorize as 'ค่าสาธารณูปโภค (น้ำ/ไฟ/เน็ต)'.
    - If it shows 'ค่าแรง' or 'Payroll', categorize as 'เงินเดือนและค่าแรง'.
    - If it is for cleaning products (detergent, soap, etc.), use 'วัสดุทำความสะอาด'.
    - If it is for paper, pens, printer ink, etc., use 'วัสดุสำนักงาน'.
    - If it is for Netflix, Canva, specialized PMS software, or cloud fees, use 'ค่าซอฟต์แวร์/แอปพลิเคชัน'.
    - Identify VAT amounts if present but focus on the 'Total' (ยอดรวมสุทธิ).

    CRITICAL CLASSIFICATION:
    - INCOME: Receipt issued BY the resort TO guests (e.g., Booking payments).
    - EXPENSE: Invoices or receipts issued TO the resort BY suppliers/utilities.

    Categories available (THAI ONLY):
    INCOME: 'ค่าห้องพัก', 'อาหารและเครื่องดื่ม', 'สปาและนวด', 'รายได้อื่นๆ'
    EXPENSE: 'ค่าสาธารณูปโภค (น้ำ/ไฟ/เน็ต)', 'เงินเดือนและค่าแรง', 'การตลาด/ค่าคอมมิชชั่น OTA', 'ค่าซ่อมบำรุง', 'วัสดุอุปกรณ์/เครื่องใช้', 'ภาษีและค่าธรรมเนียม', 'ค่าซอฟต์แวร์/แอปพลิเคชัน', 'วัสดุสำนักงาน', 'วัสดุทำความสะอาด'
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Extract transaction details as JSON. Ensure the category matches the provided Thai list exactly." }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: "YYYY-MM-DD format" },
            amount: { type: Type.NUMBER },
            type: { type: Type.STRING, enum: ['INCOME', 'EXPENSE'] },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
          },
          required: ["date", "amount", "type", "category", "description"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI ไม่สามารถประมวลผลข้อความจากภาพได้");
    return JSON.parse(text) as OCRResult;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI");
  }
};

export const processIDCardOCR = async (base64Image: string): Promise<GuestData> => {
  const systemInstruction = `
    You are an expert OCR system for Thai National ID Cards.
    Extract the following information from the image and return it as JSON.
    Guidelines:
    - Convert Thai Buddhist Era dates to Christian Era (e.g., 2567 -> 2024).
    - Ensure idNumber is exactly 13 digits without spaces.
    - Extract address exactly as written.
    - Religion is optional, extract if visible.
    
    Fields mapping:
    - idNumber: 13-digit identification number.
    - title: Thai title (นาย, นาง, นางสาว).
    - firstNameTH, lastNameTH: Thai name.
    - firstNameEN, lastNameEN: English name.
    - address: Full address string.
    - dob: Date of birth (YYYY-MM-DD).
    - issueDate: Card issue date (YYYY-MM-DD).
    - expiryDate: Card expiry date (YYYY-MM-DD).
    - religion: Religion name in Thai.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Analyze the Thai ID card and extract all details into JSON format according to the schema." }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            idNumber: { type: Type.STRING },
            title: { type: Type.STRING },
            firstNameTH: { type: Type.STRING },
            lastNameTH: { type: Type.STRING },
            firstNameEN: { type: Type.STRING },
            lastNameEN: { type: Type.STRING },
            address: { type: Type.STRING },
            dob: { type: Type.STRING },
            issueDate: { type: Type.STRING },
            expiryDate: { type: Type.STRING },
            religion: { type: Type.STRING }
          },
          required: ["idNumber", "firstNameTH", "lastNameTH"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI could not read the ID card. Please ensure the photo is clear and well-lit.");
    return JSON.parse(text) as GuestData;
  } catch (error: any) {
    console.error("ID OCR Error:", error);
    throw new Error(error.message || "ไม่สามารถอ่านบัตรประชาชนได้ กรุณาถ่ายใหม่");
  }
};
