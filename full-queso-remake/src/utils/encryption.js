// Client-side encryption utilities for sensitive data
class EncryptionManager {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
    this.ivLength = 12;
  }

  // Generate encryption key from password
  async generateKey(password) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('full-queso-salt-2024'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.algorithm, length: this.keyLength },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt sensitive data
  async encrypt(data, password = 'full-queso-default-key') {
    try {
      const key = await this.generateKey(password);
      const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));
      const encoder = new TextEncoder();
      
      const encrypted = await crypto.subtle.encrypt(
        { name: this.algorithm, iv },
        key,
        encoder.encode(JSON.stringify(data))
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  }

  // Decrypt sensitive data
  async decrypt(encryptedData, password = 'full-queso-default-key') {
    try {
      const key = await this.generateKey(password);
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );
      
      const iv = combined.slice(0, this.ivLength);
      const encrypted = combined.slice(this.ivLength);

      const decrypted = await crypto.subtle.decrypt(
        { name: this.algorithm, iv },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(decrypted));
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  // Hash sensitive data (one-way)
  async hash(data) {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Generate secure random token
  generateToken(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

export const encryptionManager = new EncryptionManager();