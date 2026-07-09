// ============================================================
// auth.js — Firebase Auth logic: register, login, logout
// ============================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";
import { t } from "./languages.js";

let currentUser = null;
let currentUserData = null;

/**
 * Register a new user with role
 * @param {string} email
 * @param {string} password
 * @param {string} name
 * @param {'freelancer'|'hiring'} role
 * @param {string} skillLevel
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function register(email, password, name, role, skillLevel) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Write user profile to Firestore with immutable role
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: email,
      name: name,
      role: role,
      skillLevel: role === "freelancer" ? skillLevel : null,
      paymentDetails: null,
      createdAt: serverTimestamp(),
      wallet: { balance: 0, pendingWithdrawals: 0 },
    });

    return { success: true };
  } catch (error) {
    let msg = t("general_error");
    switch (error.code) {
      case "auth/email-already-in-use":
        msg = t("auth_error_email_in_use");
        break;
      case "auth/invalid-email":
        msg = t("auth_error_invalid_email");
        break;
      case "auth/weak-password":
        msg = t("auth_error_weak_password");
        break;
      default:
        msg = error.message;
    }
    return { success: false, error: msg };
  }
}

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function login(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error) {
    let msg = t("general_error");
    switch (error.code) {
      case "auth/user-not-found":
        msg = t("auth_error_user_not_found");
        break;
      case "auth/wrong-password":
        msg = t("auth_error_wrong_password");
        break;
      case "auth/invalid-email":
        msg = t("auth_error_invalid_email");
        break;
      default:
        msg = error.message;
    }
    return { success: false, error: msg };
  }
}

/**
 * Logout current user
 */
async function logout() {
  await signOut(auth);
  currentUser = null;
  currentUserData = null;
}

/**
 * Fetch user profile from Firestore
 * @param {string} uid
 * @returns {Promise<object|null>}
 */
async function getUserProfile(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Listen for auth state changes
 * @param {function} callback
 */
function onAuthChange(callback) {
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

/**
 * Get current user object
 */
function getUser() {
  return currentUser;
}

/**
 * Get current user's Firestore profile
 */
function getUserData() {
  return currentUserData;
}

export { register, login, logout, getUserProfile, onAuthChange, getUser, getUserData };
