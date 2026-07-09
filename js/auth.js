// ============================================================
// auth.js — Firebase Auth logic: register, login, logout
// Runs in demo mode when Firebase isn't configured
// ============================================================

import { auth, db, isConfigured } from "./firebase-config.js";
import { t } from "./languages.js";

// Firebase SDK imports (only used when configured)
let fbAuth, fbFirestore;
if (isConfigured) {
  fbAuth = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
  fbFirestore = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
}

// Demo mode state
const DEMO_USER = { uid: "demo-001", email: "demo@mm-escrow.com" };
const DEMO_PROFILE = {
  uid: "demo-001",
  name: "Demo User",
  role: "freelancer",
  email: "demo@mm-escrow.com",
  wallet: { balance: 150000, pendingWithdrawals: 0 },
};

let currentUser = null;
let currentUserData = null;

/**
 * Register a new user with role
 */
async function register(email, password, name, role, skillLevel) {
  if (!isConfigured) {
    // Demo mode: simulate registration
    currentUser = { uid: "demo-" + Date.now(), email };
    currentUserData = {
      uid: currentUser.uid,
      name,
      role,
      email,
      skillLevel: role === "freelancer" ? skillLevel : null,
      wallet: { balance: 0, pendingWithdrawals: 0 },
    };
    return { success: true };
  }

  try {
    const { createUserWithEmailAndPassword } = fbAuth;
    const { doc, setDoc, serverTimestamp } = fbFirestore;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      name,
      role,
      skillLevel: role === "freelancer" ? skillLevel : null,
      paymentDetails: null,
      createdAt: serverTimestamp(),
      wallet: { balance: 0, pendingWithdrawals: 0 },
    });

    return { success: true };
  } catch (error) {
    let msg = t("general_error");
    switch (error.code) {
      case "auth/email-already-in-use": msg = t("auth_error_email_in_use"); break;
      case "auth/invalid-email": msg = t("auth_error_invalid_email"); break;
      case "auth/weak-password": msg = t("auth_error_weak_password"); break;
      default: msg = error.message;
    }
    return { success: false, error: msg };
  }
}

/**
 * Login with email and password
 */
async function login(email, password) {
  if (!isConfigured) {
    currentUser = DEMO_USER;
    currentUserData = { ...DEMO_PROFILE, email };
    return { success: true };
  }

  try {
    const { signInWithEmailAndPassword } = fbAuth;
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error) {
    let msg = t("general_error");
    switch (error.code) {
      case "auth/user-not-found": msg = t("auth_error_user_not_found"); break;
      case "auth/wrong-password": msg = t("auth_error_wrong_password"); break;
      case "auth/invalid-email": msg = t("auth_error_invalid_email"); break;
      default: msg = error.message;
    }
    return { success: false, error: msg };
  }
}

/**
 * Logout current user
 */
async function logout() {
  if (isConfigured && auth) {
    const { signOut } = fbAuth;
    await signOut(auth);
  }
  currentUser = null;
  currentUserData = null;
}

/**
 * Fetch user profile from Firestore
 */
async function getUserProfile(uid) {
  if (!isConfigured) return currentUserData;
  try {
    const { doc, getDoc } = fbFirestore;
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

/**
 * Listen for auth state changes
 */
function onAuthChange(callback) {
  if (!isConfigured) {
    // Demo mode: fire callback immediately with null
    callback(null, null);
    return;
  }
  const { onAuthStateChanged } = fbAuth;
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
      currentUserData = await getUserProfile(user.uid);
    } else {
      currentUserData = null;
    }
    callback(user, currentUserData);
  });
}

function getUser() { return currentUser; }
function getUserData() { return currentUserData; }

export { register, login, logout, getUserProfile, onAuthChange, getUser, getUserData };
