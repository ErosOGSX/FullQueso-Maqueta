import { useState, useEffect, useCallback } from 'react';
import { SecurityManager } from '../utils/securityHeaders';
import { secureStorage } from '../utils/secureStorage';

export const useSecurityAudit = () => {
  const [auditLog, setAuditLog] = useState([]);
  const [securityScore, setSecurityScore] = useState(0);
  const [threats, setThreats] = useState([]);

  // Security event logger
  const logSecurityEvent = useCallback((eventType, details = {}) => {
    const event = {
      id: SecurityManager.generateSecureId(),
      type: eventType,
      timestamp: new Date().toISOString(),
      details,
      severity: getSeverityLevel(eventType),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    setAuditLog(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
    
    // Store in secure storage
    secureStorage.setSession('security_audit', auditLog);
    
    return event;
  }, [auditLog]);

  // Get severity level for event types
  const getSeverityLevel = (eventType) => {
    const severityMap = {
      'login_attempt': 'low',
      'payment_attempt': 'medium',
      'data_access': 'low',
      'form_submission': 'low',
      'api_call': 'low',
      'error': 'medium',
      'security_violation': 'high',
      'suspicious_activity': 'high',
      'data_breach': 'critical'
    };
    
    return severityMap[eventType] || 'low';
  };

  // Calculate security score
  const calculateSecurityScore = useCallback(() => {
    let score = 100;
    const recentEvents = auditLog.filter(event => 
      Date.now() - new Date(event.timestamp).getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    // Deduct points for security events
    recentEvents.forEach(event => {
      switch (event.severity) {
        case 'low': score -= 1; break;
        case 'medium': score -= 5; break;
        case 'high': score -= 15; break;
        case 'critical': score -= 30; break;
      }
    });

    // Security checks
    const checks = performSecurityChecks();
    checks.forEach(check => {
      if (!check.passed) {
        score -= check.impact;
      }
    });

    setSecurityScore(Math.max(0, Math.min(100, score)));
  }, [auditLog]);

  // Perform security checks
  const performSecurityChecks = () => {
    const checks = [];

    // HTTPS check
    checks.push({
      name: 'HTTPS Connection',
      passed: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
      impact: 20,
      description: 'Connection should use HTTPS'
    });

    // Local storage encryption check
    checks.push({
      name: 'Encrypted Storage',
      passed: secureStorage.isAvailable(),
      impact: 15,
      description: 'Sensitive data should be encrypted'
    });

    // CSP check (simplified)
    checks.push({
      name: 'Content Security Policy',
      passed: document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null,
      impact: 10,
      description: 'CSP headers should be present'
    });

    // Session timeout check
    const lastActivity = secureStorage.getSession('last_activity');
    const sessionValid = lastActivity && (Date.now() - lastActivity < 30 * 60 * 1000); // 30 minutes
    checks.push({
      name: 'Session Management',
      passed: sessionValid !== null,
      impact: 5,
      description: 'Sessions should have timeout'
    });

    return checks;
  };

  // Detect potential threats
  const detectThreats = useCallback(() => {
    const detectedThreats = [];
    const recentEvents = auditLog.slice(0, 50); // Last 50 events

    // Multiple failed attempts
    const failedAttempts = recentEvents.filter(event => 
      event.type.includes('failed') || event.severity === 'high'
    );
    
    if (failedAttempts.length > 5) {
      detectedThreats.push({
        type: 'multiple_failures',
        severity: 'high',
        description: 'Multiple failed attempts detected',
        count: failedAttempts.length,
        recommendation: 'Consider implementing rate limiting'
      });
    }

    // Suspicious user agent
    const suspiciousPatterns = ['bot', 'crawler', 'spider', 'scraper'];
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (suspiciousPatterns.some(pattern => userAgent.includes(pattern))) {
      detectedThreats.push({
        type: 'suspicious_user_agent',
        severity: 'medium',
        description: 'Suspicious user agent detected',
        userAgent: navigator.userAgent,
        recommendation: 'Monitor for automated activity'
      });
    }

    // Rapid requests (simplified detection)
    const rapidRequests = recentEvents.filter(event => 
      event.type === 'api_call' && 
      Date.now() - new Date(event.timestamp).getTime() < 60000 // Last minute
    );
    
    if (rapidRequests.length > 20) {
      detectedThreats.push({
        type: 'rapid_requests',
        severity: 'medium',
        description: 'High frequency requests detected',
        count: rapidRequests.length,
        recommendation: 'Implement rate limiting'
      });
    }

    setThreats(detectedThreats);
  }, [auditLog]);

  // Initialize security monitoring
  useEffect(() => {
    // Load existing audit log
    const savedAudit = secureStorage.getSession('security_audit');
    if (savedAudit) {
      setAuditLog(savedAudit);
    }

    // Log initial page load
    logSecurityEvent('page_load', {
      url: window.location.href,
      referrer: document.referrer
    });

    // Set up activity tracking
    const trackActivity = () => {
      secureStorage.setSession('last_activity', Date.now());
    };

    const events = ['click', 'keypress', 'scroll', 'mousemove'];
    events.forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackActivity);
      });
    };
  }, [logSecurityEvent]);

  // Update security metrics
  useEffect(() => {
    calculateSecurityScore();
    detectThreats();
  }, [auditLog, calculateSecurityScore, detectThreats]);

  // Clear audit log
  const clearAuditLog = () => {
    setAuditLog([]);
    secureStorage.removeSession('security_audit');
  };

  // Export audit log
  const exportAuditLog = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      events: auditLog,
      securityScore,
      threats,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    auditLog,
    securityScore,
    threats,
    logSecurityEvent,
    clearAuditLog,
    exportAuditLog,
    performSecurityChecks
  };
};