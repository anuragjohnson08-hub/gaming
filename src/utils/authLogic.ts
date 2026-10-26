export interface NexusUser {
  id: string;
  name: string;
  email: string;
  hardwareRig?: string;
  createdAt: string;
  savedItemIds: string[];
  compareItemIds: string[];
}

export interface StoredUserRecord extends NexusUser {
  passwordHash: string;
}

export interface AuthValidationResult {
  valid: boolean;
  error: string | null;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function simpleHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return `nx_${(hash >>> 0).toString(16)}`;
}

export function validateSignUpInput(
  name: string,
  email: string,
  password: string
): AuthValidationResult {
  const trimmedName = name.trim();
  const trimmedEmail = normalizeEmail(email);

  if (!trimmedName || trimmedName.length < 2) {
    return {
      valid: false,
      error: 'Please enter your display name (at least 2 characters).',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    return {
      valid: false,
      error: 'Please enter a valid email address.',
    };
  }

  if (!password || password.length < 6) {
    return {
      valid: false,
      error: 'Password must be at least 6 characters long.',
    };
  }

  return { valid: true, error: null };
}

export function validateLoginInput(
  email: string,
  password: string
): AuthValidationResult {
  const trimmedEmail = normalizeEmail(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    return {
      valid: false,
      error: 'Please enter a valid email address.',
    };
  }

  if (!password || password.length < 1) {
    return {
      valid: false,
      error: 'Please enter your account password.',
    };
  }

  return { valid: true, error: null };
}

export function registerUserInStore(
  existingUsers: StoredUserRecord[],
  input: {
    name: string;
    email: string;
    password: string;
    hardwareRig?: string;
    initialSavedIds?: string[];
    initialCompareIds?: string[];
  }
): {
  success: boolean;
  error: string | null;
  user: NexusUser | null;
  updatedUsers: StoredUserRecord[];
} {
  const validation = validateSignUpInput(input.name, input.email, input.password);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
      user: null,
      updatedUsers: existingUsers,
    };
  }

  const normEmail = normalizeEmail(input.email);
  const duplicate = existingUsers.find(
    (u) => normalizeEmail(u.email) === normEmail
  );
  if (duplicate) {
    return {
      success: false,
      error: 'An account with this email address already exists. Please log in instead.',
      user: null,
      updatedUsers: existingUsers,
    };
  }

  const newRecord: StoredUserRecord = {
    id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: input.name.trim(),
    email: normEmail,
    hardwareRig: input.hardwareRig?.trim() || 'RTX 5070 · Ryzen 7 9800X3D',
    createdAt: new Date().toISOString().split('T')[0],
    savedItemIds: input.initialSavedIds ?? ['game-cyberpunk-2077'],
    compareItemIds: input.initialCompareIds ?? [],
    passwordHash: simpleHash(input.password),
  };

  const { passwordHash: _, ...publicUser } = newRecord;
  return {
    success: true,
    error: null,
    user: publicUser,
    updatedUsers: [...existingUsers, newRecord],
  };
}

export function authenticateUserFromStore(
  existingUsers: StoredUserRecord[],
  email: string,
  password: string
): {
  success: boolean;
  error: string | null;
  user: NexusUser | null;
} {
  const validation = validateLoginInput(email, password);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
      user: null,
    };
  }

  const normEmail = normalizeEmail(email);
  const found = existingUsers.find((u) => normalizeEmail(u.email) === normEmail);
  if (!found || found.passwordHash !== simpleHash(password)) {
    return {
      success: false,
      error: 'Invalid email or password. Please verify your credentials.',
      user: null,
    };
  }

  const { passwordHash: _, ...publicUser } = found;
  return {
    success: true,
    error: null,
    user: publicUser,
  };
}
