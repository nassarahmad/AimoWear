export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

interface LoginInput {
  username: string;
  password: string;
}

interface StoredUser extends AuthUser {
  password: string;
}

const STORAGE_KEY = "aimowear.auth.users";
const SESSION_KEY = "aimowear.auth.session";
const ADMIN_USERNAME = "MostSellCollection";
const ADMIN_PASSWORD = "AimoWear2026$";

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function registerUser(input: RegisterInput): AuthUser {
  const username = normalizeUsername(input.username);
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!username || !email || !password) {
    throw new Error("All fields are required.");
  }
  if (username.length < 3) {
    throw new Error("Username must be at least 3 characters.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Please enter a valid email.");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const users = readUsers();
  if (users.some((user) => normalizeUsername(user.username) === username)) {
    throw new Error("Username already taken.");
  }

  const user: StoredUser = {
    id: `user-${Date.now()}`,
    username: input.username.trim(),
    email,
    role: "user",
    createdAt: new Date().toISOString(),
    password,
  };

  users.push(user);
  writeUsers(users);
  return user;
}

export function loginUser(input: LoginInput): AuthUser | null {
  const username = normalizeUsername(input.username);
  const password = input.password;

  if (username === normalizeUsername(ADMIN_USERNAME) && password === ADMIN_PASSWORD) {
    const adminUser: AuthUser = {
      id: "admin-1",
      username: ADMIN_USERNAME,
      email: "admin@aimowear.com",
      role: "admin",
      createdAt: new Date().toISOString(),
    };
    persistSession(adminUser);
    return adminUser;
  }

  const users = readUsers();
  const match = users.find((user) => normalizeUsername(user.username) === username);
  if (!match) return null;

  if (password.length < 6 || match.password !== password) return null;

  const safeUser: AuthUser = {
    id: match.id,
    username: match.username,
    email: match.email,
    role: match.role,
    createdAt: match.createdAt,
  };

  persistSession(safeUser);
  return safeUser;
}

export function getSessionUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return getSessionUser() !== null;
}

export function persistSession(user: AuthUser | null) {
  if (!user) {
    sessionStorage.removeItem(SESSION_KEY);
    return;
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function logoutUser() {
  persistSession(null);
}
