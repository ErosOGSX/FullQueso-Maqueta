// Security headers and CSP utilities
export class SecurityManager {
  // Content Security Policy configuration
  static getCSPHeaders() {
    return {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Needed for React dev
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://crm-server-main.fullqueso.com https://api.exchangerate-api.com",
        "media-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'"
      ].join('; ')
    };
  }

  // Security headers for API requests
  static getSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
  }

  // Sanitize user input
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Validate and sanitize form data
  static sanitizeFormData(formData) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeInput(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  // Rate limiting for API calls
  static createRateLimiter(maxRequests = 10, windowMs = 60000) {
    const requests = new Map();
    
    return (identifier) => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Clean old requests
      for (const [id, timestamps] of requests.entries()) {
        const validTimestamps = timestamps.filter(time => time > windowStart);
        if (validTimestamps.length === 0) {
          requests.delete(id);
        } else {
          requests.set(id, validTimestamps);
        }
      }
      
      // Check current identifier
      const userRequests = requests.get(identifier) || [];
      const recentRequests = userRequests.filter(time => time > windowStart);
      
      if (recentRequests.length >= maxRequests) {
        return {
          allowed: false,
          resetTime: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
        };
      }
      
      // Add current request
      recentRequests.push(now);
      requests.set(identifier, recentRequests);
      
      return {
        allowed: true,
        remaining: maxRequests - recentRequests.length
      };
    };
  }

  // Generate secure random IDs
  static generateSecureId(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }
    
    return result;
  }

  // Validate origin for CORS
  static validateOrigin(origin) {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://fullqueso.com',
      'https://www.fullqueso.com'
    ];
    
    return allowedOrigins.includes(origin);
  }

  // Create secure fetch wrapper
  static createSecureFetch() {
    const rateLimiter = this.createRateLimiter(50, 60000); // 50 requests per minute
    
    return async (url, options = {}) => {
      // Rate limiting
      const clientId = 'client-' + (navigator.userAgent || 'unknown');
      const rateCheck = rateLimiter(clientId);
      
      if (!rateCheck.allowed) {
        throw new Error(`Rate limit exceeded. Try again in ${rateCheck.resetTime} seconds.`);
      }
      
      // Add security headers
      const secureOptions = {
        ...options,
        headers: {
          ...this.getSecurityHeaders(),
          ...options.headers
        }
      };
      
      // Add request timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const response = await fetch(url, {
          ...secureOptions,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };
  }

  // Log security events
  static logSecurityEvent(event, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // In development, log to console
    if (import.meta.env.DEV) {
      console.warn('Security Event:', logEntry);
    }
    
    // In production, send to security monitoring service
    if (!import.meta.env.DEV) {
      // Send to security monitoring endpoint
      this.createSecureFetch()('/api/security/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      }).catch(console.error);
    }
  }
}

// Create global secure fetch instance
export const secureFetch = SecurityManager.createSecureFetch();