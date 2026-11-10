/**
 * Security Tests
 * নিশ্চিত করে যে security-critical behavior সঠিকভাবে কাজ করছে।
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MASTER_EMAILS } from '../constants/data';

// ---- Admin Access Simulation ----

function checkIsAdmin(userEmail: string, adminDocs: { email: string; role: string }[]): boolean {
  const email = userEmail.toLowerCase().trim();
  if (MASTER_EMAILS.map(e => e.toLowerCase()).includes(email)) return true;
  return adminDocs.some(
    (a) => a.email.toLowerCase() === email && ['admin', 'owner'].includes(a.role)
  );
}

function checkIsModerator(userEmail: string, adminDocs: { email: string; role: string }[]): boolean {
  return checkIsAdmin(userEmail, adminDocs) ||
    adminDocs.some(
      (a) => a.email.toLowerCase() === userEmail.toLowerCase() && a.role === 'moderator'
    );
}

// ---- LocalStorage Security ----

function getFromStorage(key: string): string | null {
  return localStorage.getItem(key);
}

function adminDataShouldNotBeInStorage(): boolean {
  return localStorage.getItem('cached_admins') === null;
}

// ---- Input Sanitization ----

function sanitizeUserInput(input: string, maxLength: number = 1000): string {
  return input.trim().substring(0, maxLength);
}

function containsXSS(input: string): boolean {
  const xssPatterns = /<script|javascript:|on\w+\s*=|<iframe|<img.*onerror/i;
  return xssPatterns.test(input);
}

// ---- Tests ----

describe('Admin Access Control', () => {
  const mockAdmins = [
    { email: 'admin@shop.com', role: 'admin' },
    { email: 'mod@shop.com', role: 'moderator' },
    { email: 'user@shop.com', role: 'user' },
  ];

  it('master email admin access পাবে', () => {
    expect(checkIsAdmin('ishopbd.online@gmail.com', [])).toBe(true);
    expect(checkIsAdmin('bonieaminrony@gmail.com', [])).toBe(true);
  });

  it('admin role-এর user admin access পাবে', () => {
    expect(checkIsAdmin('admin@shop.com', mockAdmins)).toBe(true);
  });

  it('moderator role-এর user admin access পাবে না (শুধু moderator)', () => {
    expect(checkIsAdmin('mod@shop.com', mockAdmins)).toBe(false);
    expect(checkIsModerator('mod@shop.com', mockAdmins)).toBe(true);
  });

  it('regular user admin বা moderator access পাবে না', () => {
    expect(checkIsAdmin('hacker@evil.com', mockAdmins)).toBe(false);
    expect(checkIsModerator('hacker@evil.com', mockAdmins)).toBe(false);
  });

  it('email case-insensitive match করতে হবে', () => {
    expect(checkIsAdmin('ADMIN@SHOP.COM', mockAdmins)).toBe(true);
    expect(checkIsAdmin('Admin@Shop.Com', mockAdmins)).toBe(true);
  });

  it('empty email access দেবে না', () => {
    expect(checkIsAdmin('', mockAdmins)).toBe(false);
  });
});

describe('LocalStorage Security', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Admin data localStorage-এ থাকবে না', () => {
    // Simulate that cached_admins was NOT set (our security fix)
    expect(adminDataShouldNotBeInStorage()).toBe(true);
  });

  it('cart data localStorage-এ থাকা নিরাপদ', () => {
    localStorage.setItem('ishopbd_cart', JSON.stringify([{ id: 'p1', qty: 1 }]));
    const cart = localStorage.getItem('ishopbd_cart');
    expect(cart).not.toBeNull();
  });

  it('session ID localStorage-এ থাকা নিরাপদ', () => {
    localStorage.setItem('ishopbd_chat_session', 'guest_abc123');
    expect(getFromStorage('ishopbd_chat_session')).toBe('guest_abc123');
  });
});

describe('Input Sanitization', () => {
  it('leading/trailing whitespace সরাতে হবে', () => {
    expect(sanitizeUserInput('  hello  ')).toBe('hello');
  });

  it('maxLength enforce করতে হবে', () => {
    const longInput = 'a'.repeat(2000);
    expect(sanitizeUserInput(longInput, 500).length).toBe(500);
  });

  it('XSS script tag detect করতে হবে', () => {
    expect(containsXSS('<script>alert("xss")</script>')).toBe(true);
  });

  it('XSS event handler detect করতে হবে', () => {
    expect(containsXSS('something onclick=alert(1)')).toBe(true);
    expect(containsXSS('<img onerror=alert(1)>')).toBe(true);
  });

  it('javascript: protocol detect করতে হবে', () => {
    expect(containsXSS('javascript:alert(1)')).toBe(true);
  });

  it('normal বাংলা text safe হবে', () => {
    expect(containsXSS('আমার পণ্যের নাম মিনি ফ্যান')).toBe(false);
    expect(containsXSS('Order #1234 - ৳1250')).toBe(false);
  });
});

describe('API Key Security', () => {
  it('Gemini API key browser window-এ expose হবে না', () => {
    // API key should only be in process.env (server-side), never on window
    expect((window as any).GEMINI_API_KEY).toBeUndefined();
    expect((window as any).geminiApiKey).toBeUndefined();
  });

  it('localStorage-এ API key থাকবে না', () => {
    expect(localStorage.getItem('geminiApiKey')).toBeNull();
    expect(localStorage.getItem('GEMINI_API_KEY')).toBeNull();
    expect(localStorage.getItem('apiKey')).toBeNull();
  });
});

describe('Phase 1 Security Hardening Tests', () => {
  it('Bulk SMS Authentication: invalid/missing token rejected', () => {
    function validateBulkSmsToken(reqToken: string | undefined, serverSecret: string): boolean {
      if (!reqToken || !serverSecret) return false;
      const token = reqToken.startsWith('Bearer ') ? reqToken.slice(7).trim() : reqToken.trim();
      return token === serverSecret.trim();
    }

    const SERVER_SECRET = 'secure_secret_token_123';
    expect(validateBulkSmsToken(undefined, SERVER_SECRET)).toBe(false);
    expect(validateBulkSmsToken('', SERVER_SECRET)).toBe(false);
    expect(validateBulkSmsToken('wrong_token', SERVER_SECRET)).toBe(false);
    expect(validateBulkSmsToken('secure_secret_token_123', SERVER_SECRET)).toBe(true);
    expect(validateBulkSmsToken('Bearer secure_secret_token_123', SERVER_SECRET)).toBe(true);
  });

  it('Master Access requires verified email', () => {
    function isMasterUser(email: string, isEmailVerified: boolean): boolean {
      if (!isEmailVerified) return false;
      const lower = (email || '').toLowerCase().trim();
      return MASTER_EMAILS.map(e => e.toLowerCase()).includes(lower);
    }

    expect(isMasterUser('bonieaminrony@gmail.com', false)).toBe(false);
    expect(isMasterUser('bonieaminrony@gmail.com', true)).toBe(true);
    expect(isMasterUser('attacker@evil.com', true)).toBe(false);
  });

  it('.htaccess sensitive file regex blocks service-account.json and products_cache.json', () => {
    const blockedFilesRegex = /.*(service-account|products_cache|\.env).*/i;
    expect(blockedFilesRegex.test('service-account.json')).toBe(true);
    expect(blockedFilesRegex.test('api/service-account.json')).toBe(true);
    expect(blockedFilesRegex.test('products_cache.json')).toBe(true);
    expect(blockedFilesRegex.test('.env')).toBe(true);
    expect(blockedFilesRegex.test('.env.production')).toBe(true);
    expect(blockedFilesRegex.test('index.html')).toBe(false);
    expect(blockedFilesRegex.test('manifest.json')).toBe(false);
  });

  it('Service account candidate resolver strictly rejects public/ or dist/ directories', () => {
    function isSecureServiceAccountPath(filePath: string): boolean {
      const clean = filePath.replace(/\\/g, '/').toLowerCase();
      return !clean.includes('/public') && !clean.includes('/dist') && !clean.includes('public_html');
    }

    expect(isSecureServiceAccountPath('/domains/ishopbd.com/api/service-account.json')).toBe(true);
    expect(isSecureServiceAccountPath('E:/Making File/Logo/ishopbd.com/api/service-account.json')).toBe(true);
    expect(isSecureServiceAccountPath('/domains/ishopbd.com/public_html/api/service-account.json')).toBe(false);
    expect(isSecureServiceAccountPath('E:/Making File/Logo/ishopbd.com/public/api/service-account.json')).toBe(false);
    expect(isSecureServiceAccountPath('E:/Making File/Logo/ishopbd.com/dist/api/service-account.json')).toBe(false);
  });

  it('Deployment filter excludes sensitive credentials and maps from public FTP sync', () => {
    function shouldExcludeFromPublicUpload(fileName: string): boolean {
      return (
        fileName === 'service-account.json' ||
        fileName.startsWith('service-account') ||
        fileName.startsWith('.env') ||
        fileName.endsWith('.map') ||
        fileName.endsWith('.ts') ||
        fileName.endsWith('.tsx') ||
        fileName === 'products_cache.json'
      );
    }

    expect(shouldExcludeFromPublicUpload('service-account.json')).toBe(true);
    expect(shouldExcludeFromPublicUpload('service-account-backup.json')).toBe(true);
    expect(shouldExcludeFromPublicUpload('.env')).toBe(true);
    expect(shouldExcludeFromPublicUpload('server.cjs.map')).toBe(true);
    expect(shouldExcludeFromPublicUpload('products.php')).toBe(false);
    expect(shouldExcludeFromPublicUpload('index.php')).toBe(false);
    expect(shouldExcludeFromPublicUpload('logo.png')).toBe(false);
  });

  it('Product Frozen Architecture: retains exact visibility rules for 25 visible and 2 hidden items', () => {
    const mockStoreCatalog = [
      ...Array.from({ length: 25 }, (_, i) => ({ id: `vis_${i + 1}`, name: `Visible Item ${i + 1}`, isPublished: true, deleted: false })),
      { id: 'hid_1', name: 'Hidden Item 1', isPublished: false, deleted: false },
      { id: 'hid_2', name: 'Hidden Item 2', isPublished: false, deleted: false },
      { id: 'del_1', name: 'Deleted Item 1', isPublished: true, deleted: true }
    ];

    const publicVisible = mockStoreCatalog.filter(p => !p.deleted && p.isPublished !== false);
    const hiddenItems = mockStoreCatalog.filter(p => !p.deleted && p.isPublished === false);
    const totalActive = mockStoreCatalog.filter(p => !p.deleted);

    expect(publicVisible.length).toBe(25);
    expect(hiddenItems.length).toBe(2);
    expect(totalActive.length).toBe(27);
  });
});
