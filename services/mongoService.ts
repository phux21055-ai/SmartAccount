
// MongoDB API Service
const API_BASE = '/api';

// Fixed: Added lastSync optional property to MongoData to match usage in syncWithMongo
export interface MongoData {
  transactions: any[];
  bookings: any[];
  settings: any;
  lastSync?: string;
}

// Check if running on production (Vercel)
const isProduction = () => {
  return typeof window !== 'undefined' &&
         (window.location.hostname.includes('vercel.app') ||
          window.location.hostname.includes('yourdomain.com'));
};

export async function saveToMongo(data: MongoData) {
  // Skip MongoDB on local development
  if (!isProduction()) {
    console.log('🔧 Local dev: Using localStorage only');
    return { success: true, local: true };
  }

  try {
    const response = await fetch(`${API_BASE}/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Failed to save data');
    return await response.json();
  } catch (error) {
    console.error('MongoDB save error:', error);
    throw error;
  }
}

export async function loadFromMongo(): Promise<MongoData | null> {
  // Skip MongoDB on local development
  if (!isProduction()) {
    console.log('🔧 Local dev: Using localStorage only');
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}/data`);

    if (!response.ok) throw new Error('Failed to load data');
    const result = await response.json();

    if (result.success && result.data && result.data.length > 0) {
      // Return the latest document
      return result.data[0];
    }

    return null;
  } catch (error) {
    console.error('MongoDB load error:', error);
    return null;
  }
}

export async function syncWithMongo(localData: MongoData) {
  if (!isProduction()) {
    return false;
  }

  try {
    // Save current data to MongoDB
    await saveToMongo({
      ...localData,
      lastSync: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('MongoDB sync error:', error);
    return false;
  }
}
