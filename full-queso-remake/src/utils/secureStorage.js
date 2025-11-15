// Secure storage utilities for sensitive data
import { encryptionManager } from './encryption';

class SecureStorage {
  constructor() {
    this.prefix = 'fq_secure_';
    this.sessionPrefix = 'fq_session_';
  }

  // Encrypt and store sensitive data
  async setSecure(key, data, useSessionStorage = false) {
    try {
      const encrypted = await encryptionManager.encrypt(data);
      if (!encrypted) throw new Error('Encryption failed');

      const storage = useSessionStorage ? sessionStorage : localStorage;
      const storageKey = `${this.prefix}${key}`;
      
      storage.setItem(storageKey, encrypted);
      return true;
    } catch (error) {
      console.error('Secure storage failed:', error);
      return false;
    }
  }

  // Retrieve and decrypt sensitive data
  async getSecure(key, useSessionStorage = false) {
    try {
      const storage = useSessionStorage ? sessionStorage : localStorage;
      const storageKey = `${this.prefix}${key}`;
      const encrypted = storage.getItem(storageKey);
      
      if (!encrypted) return null;

      const decrypted = await encryptionManager.decrypt(encrypted);
      return decrypted;
    } catch (error) {
      console.error('Secure retrieval failed:', error);
      return null;
    }
  }

  // Remove secure data
  removeSecure(key, useSessionStorage = false) {
    const storage = useSessionStorage ? sessionStorage : localStorage;
    const storageKey = `${this.prefix}${key}`;
    storage.removeItem(storageKey);
  }

  // Store session data with expiration
  setSession(key, data, expirationMinutes = 30) {
    const expiration = Date.now() + (expirationMinutes * 60 * 1000);
    const sessionData = { data, expiration };
    
    sessionStorage.setItem(`${this.sessionPrefix}${key}`, JSON.stringify(sessionData));
  }

  // Get session data if not expired
  getSession(key) {
    try {
      const stored = sessionStorage.getItem(`${this.sessionPrefix}${key}`);
      if (!stored) return null;

      const { data, expiration } = JSON.parse(stored);
      
      if (Date.now() > expiration) {
        this.removeSession(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Session retrieval failed:', error);
      return null;
    }
  }

  // Remove session data
  removeSession(key) {
    sessionStorage.removeItem(`${this.sessionPrefix}${key}`);
  }

  // Clear all secure data
  clearAllSecure() {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
    keys.forEach(key => localStorage.removeItem(key));

    const sessionKeys = Object.keys(sessionStorage).filter(key => 
      key.startsWith(this.prefix) || key.startsWith(this.sessionPrefix)
    );
    sessionKeys.forEach(key => sessionStorage.removeItem(key));
  }

  // Check if secure storage is available
  isAvailable() {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get storage usage statistics
  getStorageStats() {
    let secureCount = 0;
    let sessionCount = 0;
    let totalSize = 0;

    // Check localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.prefix)) {
        secureCount++;
        totalSize += localStorage.getItem(key).length;
      }
    }

    // Check sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key.startsWith(this.prefix) || key.startsWith(this.sessionPrefix)) {
        sessionCount++;
        totalSize += sessionStorage.getItem(key).length;
      }
    }

    return {
      secureItems: secureCount,
      sessionItems: sessionCount,
      totalSize: Math.round(totalSize / 1024) // KB
    };
  }
}

export const secureStorage = new SecureStorage();