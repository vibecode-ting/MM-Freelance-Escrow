// ============================================================
// admin.js — Admin override system & dashboard
// ============================================================

import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { t } from "./languages.js";
import { getUser, getUserData } from "./auth.js";
import { renderStatusBadge, renderStatCard, formatMMK, formatDate, showToast, renderEmptyState } from "./components.js";

// ---- Admin actions ----

async function unlockMilestone(contractId, milestoneIndex) {
  try {
    const snap = await getDoc(doc(db, "contracts", contractId));
    const contract = snap.data();
    const milestones = [...(contract.milestones || [])];
    milestones[milestoneIndex] = { ...milestones[milestoneIndex], status: "released" };
    await updateDoc(doc(db, "contracts", contractId), { milestones });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function fullRefund(contractId) {
  try {
    const snap = await getDoc(doc(db, "contracts", contractId));
    const contract = snap.data();
    const milestones = (contract.milestones || []).map((m) => ({ ...m, status: "released" }));
    await updateDoc(doc(db, "contracts", contractId), {
      milestones,
      escrowStatus: "released",
      platformVerdict: "full_refund",
    });
    // Update job status
    const jobSnap = await getDoc(doc(db, "jobs", contract.jobId));
    if (jobSnap.exists()) {
      await updateDoc(doc(db, "jobs", contract.jobId), { status: "completed" });
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function fiftyFiftySplit(contractId) {
  try {
    const snap = await getDoc(doc(db, "contracts", contractId));
    const contract = snap.data();
    const milestones = (contract.milestones || []).map((m) => ({ ...m, status: "released" }));
    await updateDoc(doc(db, "contracts", contractId), {
      milestones,
      escrowStatus: "released",
      platformVerdict: "fifty_fifty",
    });
    const jobSnap = await getDoc(doc(db, "jobs", contract.jobId));
    if (jobSnap.exists()) {
      await updateDoc(doc(db, "jobs", contract.jobId), { status: "completed" });
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function fullRelease(contractId) {
  try {
    const snap = await getDoc(doc(db, "contracts", contractId));
    const contract = snap.data();
    const milestones = (contract.milestones || []).map((m) => ({ ...m, status: "released" }));
    await updateDoc(doc(db, "contracts", contractId), {
      milestones,
      escrowStatus: "released",
      platformVerdict: "full_release",
    });
    const jobSnap = await getDoc(doc(db, "jobs", contract.jobId));
    if (jobSnap.exists()) {
      await updateDoc(doc(db, "jobs", contract.jobId), { status: "completed" });
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function resetJobToOpen(jobId, contractId) {
  try {
    await updateDoc(doc(db, "jobs", jobId), { status: "open" });
    if (contractId) {
      const snap = await getDoc(doc(db, "contracts", contractId));
      if (snap.exists()) {
        await updateDoc(doc(db, "contracts", contractId), {
          escrowStatus: "pending",
          platformVerdict: "reset_to_open",
        });
      }
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ---- Render Admin Dashboard ----
function renderAdminPage() {
  const userData = getUserData();
  if (userData?.role !== "admin") {
    return `
      <div class="max-w-3xl mx-auto px-4 py-16 text-center">
        <div class="text-6xl mb-4">🔒</div>
        <h1 class="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
        <p class="text-slate-500">You don't have admin privileges.</p>
      </div>
    `;
  }

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-800">${t("admin_title")}</h1>
        <p class="text-slate-500 text-sm mt-1">${t("admin_overview")}</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        ${renderStatCard(t("admin_all_jobs"), "—", "📋", "indigo")}
        ${renderStatCard(t("admin_all_users"), "—", "👥", "violet")}
        ${renderStatCard(t("admin_pending_verifications"), "—", "⏳", "amber")}
        ${renderStatCard(t("admin_disputes"), "—", "⚠️", "red")}
      </div>

      <!-- Platform Fee Structure -->
      <div class="bg-white rounded-2xl border border-slate-200/60 p-6 mb-8">
        <h2 class="text-lg font-bold text-slate-800 mb-4">${t("admin_platform_fee")}</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-slate-50 rounded-xl p-4">
            <p class="text-sm text-slate-500">${t("admin_fee_hiring")}</p>
            <p class="text-2xl font-bold text-indigo-600">1%</p>
          </div>
          <div class="bg-slate-50 rounded-xl p-4">
            <p class="text-sm text-slate-500">${t("admin_fee_freelancer")}</p>
            <p class="text-2xl font-bold text-violet-600">2%</p>
          </div>
        </div>
      </div>

      <!-- Pending Verifications -->
      <div class="bg-white rounded-2xl border border-slate-200/60 p-6 mb-8">
        <h2 class="text-lg font-bold text-slate-800 mb-4">${t("admin_pending_verifications")}</h2>
        <div id="admin-verifications">
          ${renderEmptyState(t("general_loading"), "⏳")}
        </div>
      </div>

      <!-- Active Disputes -->
      <div class="bg-white rounded-2xl border border-slate-200/60 p-6">
        <h2 class="text-lg font-bold text-slate-800 mb-4">${t("admin_disputes")}</h2>
        <div id="admin-disputes">
          ${renderEmptyState(t("general_no_data"), "📭")}
        </div>
      </div>
    </div>
  `;
}

// ---- Render admin action panel for a specific contract ----
function renderAdminActionPanel(contract, job) {
  const userData = getUserData();
  if (userData?.role !== "admin") return "";

  return `
    <div class="bg-white rounded-2xl border border-amber-200 p-6 mb-6">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-lg">⚙️</span>
        <h2 class="text-lg font-bold text-slate-800">${t("admin_action")}</h2>
        <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">ADMIN</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button onclick="window.adminAction('full_refund', '${contract.id}')" class="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50 transition text-left">
          <span class="text-xl">💸</span>
          <div>
            <p class="font-semibold text-slate-800">${t("admin_full_refund")}</p>
            <p class="text-xs text-slate-500">Return all funds to client</p>
          </div>
        </button>

        <button onclick="window.adminAction('fifty_fifty', '${contract.id}')" class="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition text-left">
          <span class="text-xl">⚖️</span>
          <div>
            <p class="font-semibold text-slate-800">${t("admin_fifty_fifty")}</p>
            <p class="text-xs text-slate-500">Split 50% each party</p>
          </div>
        </button>

        <button onclick="window.adminAction('full_release', '${contract.id}')" class="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition text-left">
          <span class="text-xl">🎉</span>
          <div>
            <p class="font-semibold text-slate-800">${t("admin_full_release")}</p>
            <p class="text-xs text-slate-500">100% to freelancer</p>
          </div>
        </button>

        <button onclick="window.adminAction('reset_job', '${job?.id || ""}', '${contract.id}')" class="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50 transition text-left">
          <span class="text-xl">🔄</span>
          <div>
            <p class="font-semibold text-slate-800">${t("admin_reset_job")}</p>
            <p class="text-xs text-slate-500">No fees charged</p>
          </div>
        </button>
      </div>

      ${contract.platformVerdict ? `
        <div class="mt-4 p-3 bg-slate-50 rounded-xl">
          <p class="text-sm text-slate-500">Verdict: <span class="font-semibold text-slate-800">${contract.platformVerdict}</span></p>
        </div>
      ` : ""}
    </div>
  `;
}

export {
  unlockMilestone,
  fullRefund,
  fiftyFiftySplit,
  fullRelease,
  resetJobToOpen,
  renderAdminPage,
  renderAdminActionPanel,
};
