export interface AdminRecordLike {
  id?: string;
  email?: string;
  role?: string;
  password?: string;
  phone?: string;
  require2FA?: boolean;
  [key: string]: any;
}

export interface AdminUserLike {
  uid?: string;
  email?: string | null;
}

export interface ResolvedAdminAccess {
  isMasterEmail: boolean;
  isMasterAdmin: boolean;
  isAdmin: boolean;
  adminViewMode: 'full' | 'support_only';
  effectiveRole: 'owner' | 'admin' | 'moderator' | 'none';
  matchedRecord?: AdminRecordLike;
}

export function normalizeAdminEmail(rawEmail?: string | null): {
  userEmail: string;
  cleanEmail: string;
} {
  const userEmail = String(rawEmail || '').toLowerCase().trim();
  const cleanEmail = userEmail.endsWith('@mobile.user')
    ? userEmail.replace('@mobile.user', '')
    : userEmail;
  return { userEmail, cleanEmail };
}

export function isFullAdminRole(role?: unknown): boolean {
  const normalized = String(role || '').toLowerCase().trim();
  return normalized === 'admin' || normalized === 'owner';
}

export function isModeratorRole(role?: unknown): boolean {
  return String(role || '').toLowerCase().trim() === 'moderator';
}

export function findMatchingAdminRecord<T extends AdminRecordLike>(
  admins: T[],
  user?: AdminUserLike | null,
): T | undefined {
  if (!user || !Array.isArray(admins) || admins.length === 0) return undefined;

  const uid = String(user.uid || '').trim();
  if (uid) {
    const exactUidMatch = admins.find((a) => String(a.id || '').trim() === uid);
    if (exactUidMatch) return exactUidMatch;
  }

  const { userEmail, cleanEmail } = normalizeAdminEmail(user.email);
  const uidLower = uid.toLowerCase();

  return admins.find((a) => {
    const aEmail = String(a.email || '').toLowerCase().trim();
    const aId = String(a.id || '').toLowerCase().trim();
    if (uidLower && aId === uidLower) return true;
    if (userEmail && (aEmail === userEmail || aId === userEmail)) return true;
    if (cleanEmail && (aEmail === cleanEmail || aId === cleanEmail)) return true;
    return false;
  });
}

export function resolveAdminAccess(params: {
  user?: AdminUserLike | null;
  myAdminDoc?: AdminRecordLike | null;
  adminList?: AdminRecordLike[];
  masterEmails?: string[];
}): ResolvedAdminAccess {
  const { user, myAdminDoc, adminList = [], masterEmails = [] } = params;
  if (!user) {
    return {
      isMasterEmail: false,
      isMasterAdmin: false,
      isAdmin: false,
      adminViewMode: 'support_only',
      effectiveRole: 'none',
    };
  }

  const { userEmail, cleanEmail } = normalizeAdminEmail(user.email);
  const masterSet = new Set(
    masterEmails.map((e) => String(e || '').toLowerCase().trim()).filter(Boolean),
  );
  const isMasterEmail =
    (Boolean(userEmail) && masterSet.has(userEmail)) ||
    (Boolean(cleanEmail) && masterSet.has(cleanEmail));

  const matchedRecord = findMatchingAdminRecord(adminList, user);
  const primaryRoleRaw = myAdminDoc?.role ?? matchedRecord?.role;
  const primaryRoleNormalized = String(primaryRoleRaw || '').toLowerCase().trim();

  if (isMasterEmail) {
    return {
      isMasterEmail: true,
      isMasterAdmin: true,
      isAdmin: true,
      adminViewMode: 'full',
      effectiveRole: primaryRoleNormalized === 'admin' ? 'admin' : 'owner',
      matchedRecord: myAdminDoc || matchedRecord,
    };
  }

  if (isFullAdminRole(primaryRoleRaw)) {
    return {
      isMasterEmail: false,
      isMasterAdmin: true,
      isAdmin: true,
      adminViewMode: 'full',
      effectiveRole: primaryRoleNormalized === 'owner' ? 'owner' : 'admin',
      matchedRecord: myAdminDoc || matchedRecord,
    };
  }

  if (isModeratorRole(primaryRoleRaw)) {
    return {
      isMasterEmail: false,
      isMasterAdmin: false,
      isAdmin: true,
      adminViewMode: 'support_only',
      effectiveRole: 'moderator',
      matchedRecord: myAdminDoc || matchedRecord,
    };
  }

  return {
    isMasterEmail: false,
    isMasterAdmin: false,
    isAdmin: false,
    adminViewMode: 'support_only',
    effectiveRole: 'none',
    matchedRecord: myAdminDoc || matchedRecord,
  };
}
