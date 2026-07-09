// ============================================================
// escrow.js — Manual escrow interface & payment gateway
// ============================================================

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { t } from "./languages.js";
import { getUser, getUserData } from "./auth.js";
import { renderStatusBadge, formatMMK, formatDate, showToast } from "./components.js";

// Payment method groups
const PAYMENT_METHODS = {
  wallets: [
    { id: "kbz_pay", nameKey: "escrow_kbz", icon: "📱", color: "blue" },
    { id: "wave_pay", nameKey: "escrow_wave", icon: "🌊", color: "sky" },
    { id: "aya_pay", nameKey: "escrow_aya_pay", icon: "💳", color: "violet" },
    { id: "cb_pay", nameKey: "escrow_cb_pay", icon: "💰", color: "emerald" },
    { id: "uab_pay", nameKey: "escrow_uab_pay", icon: "🏦", color: "amber" },
  ],
  banks: [
    { id: "yoma_bank", nameKey: "escrow_yoma", icon: "🏛️", color: "red" },
    { id: "aya_bank", nameKey: "escrow_aya_bank", icon: "🏦", color: "blue" },
    { id: "kbz_bank", nameKey: "escrow_kbz_bank", icon: "🏦", color: "indigo" },
    { id: "cb_bank", nameKey: "escrow_cb_bank", icon: "🏦", color: "emerald" },
  ],
  digital: [
    { id: "usdt_trc20", nameKey: "escrow_usdt", icon: "₮", color: "green" },
    { id: "binance_pay", nameKey: "escrow_binance", icon: "🟡", color: "yellow" },
    { id: "djo_pay", nameKey: "escrow_djo", icon: "💎", color: "purple" },
  ],
};

// ---- Create escrow payment record ----
async function createEscrowPayment(contractId, milestoneIndex, amount, paymentMethod, transactionId, proofFile) {
  const user = getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    await addDoc(collection(db, "escrowPayments"), {
      contractId,
      milestoneIndex,
      amount,
      paymentMethod,
      transactionId,
      proofFileName: proofFile?.name || null,
      status: "pending",
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ---- Render escrow payment page ----
function renderEscrowPage(contract, job) {
  const user = getUser();
  const userData = getUserData();
  const isHiring = userData?.role === "hiring" && contract.hiringId === user?.uid;

  if (!isHiring) {
    return `
      <div class="max-w-3xl mx-auto px-4 py-8 text-center">
        <div class="text-5xl mb-4">🔒</div>
        <p class="text-slate-500 text-lg">Only the Hiring Manager can fund escrow.</p>
      </div>
    `;
  }

  const milestonesCount = job?.milestonesCount || 1;
  const perAmount = Math.floor(job.budget / milestonesCount);

  return `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <a href="#/dashboard" class="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        ${t("general_back")}
      </a>

      <div class="bg-white rounded-2xl border border-slate-200/60 p-6 sm:p-8 mb-6">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl mb-4 shadow-lg shadow-emerald-200">💰</div>
          <h1 class="text-2xl font-bold text-slate-800">${t("escrow_title")}</h1>
          <p class="text-slate-500 text-sm mt-1">${job?.title || ""}</p>
        </div>

        <!-- Milestone Selection -->
        <div class="mb-8">
          <label class="block text-sm font-semibold text-slate-700 mb-3">${t("escrow_select_milestone")}</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="milestone-options">
            ${Array.from({ length: milestonesCount }, (_, i) => {
              const ms = contract.milestones?.[i];
              const status = ms?.status || "pending";
              const isSecured = status === "escrowed" || status === "released";
              return `
                <label class="relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${isSecured ? "border-emerald-200 bg-emerald-50 opacity-60" : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"}">
                  <input type="radio" name="milestone" value="${i}" ${isSecured ? "disabled" : ""} class="sr-only peer" />
                  <div class="w-5 h-5 rounded-full border-2 border-slate-300 peer-checked:border-indigo-500 peer-checked:bg-indigo-500 mr-3 flex-shrink-0 transition-all"></div>
                  <div class="flex-1">
                    <p class="font-semibold text-slate-800">${t("milestone_title")} ${i + 1}</p>
                    <p class="text-sm text-slate-500">${formatMMK(perAmount)}</p>
                  </div>
                  <div>${renderStatusBadge(status)}</div>
                </label>
              `;
            }).join("")}
          </div>
        </div>

        <!-- Amount Display -->
        <div class="bg-slate-50 rounded-xl p-4 mb-8 text-center">
          <p class="text-sm text-slate-500">${t("escrow_amount")}</p>
          <p class="text-3xl font-bold text-indigo-600" id="escrow-amount-display">${formatMMK(perAmount)}</p>
        </div>

        <!-- Payment Method Groups -->
        <div class="mb-8">
          <label class="block text-sm font-semibold text-slate-700 mb-4">${t("escrow_payment_method")}</label>

          ${renderPaymentGroup(t("escrow_wallets"), PAYMENT_METHODS.wallets)}
          ${renderPaymentGroup(t("escrow_banks"), PAYMENT_METHODS.banks)}
          ${renderPaymentGroup(t("escrow_digital"), PAYMENT_METHODS.digital)}
        </div>

        <!-- Upload Proof -->
        <div class="mb-8">
          <label class="block text-sm font-semibold text-slate-700 mb-2">${t("escrow_upload_proof")}</label>
          <div class="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors" id="proof-upload-area">
            <input type="file" id="proof-file" accept="image/*,.pdf" class="hidden" />
            <div class="text-3xl mb-2">📎</div>
            <p class="text-sm text-slate-500 mb-2">${t("escrow_file_placeholder")}</p>
            <button type="button" onclick="document.getElementById('proof-file').click()" class="btn-ghost text-sm">${t("escrow_upload_proof")}</button>
            <p id="proof-file-name" class="text-xs text-indigo-600 mt-2 hidden"></p>
          </div>
          <div class="mt-3">
            <input type="text" id="transaction-id" placeholder="Transaction ID (e.g., KBZ-20240101-ABC)" class="input-field" />
          </div>
        </div>

        <!-- Submit -->
        <button id="btn-submit-escrow" class="btn-primary w-full text-base py-3">
          ${t("escrow_submit_payment")}
        </button>
      </div>
    </div>
  `;
}

function renderPaymentGroup(groupTitle, methods) {
  return `
    <div class="mb-5">
      <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">${groupTitle}</p>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        ${methods.map((m) => `
          <label class="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-all peer-checked:border-indigo-500 peer-checked:bg-indigo-50">
            <input type="radio" name="payment_method" value="${m.id}" class="sr-only peer" />
            <span class="text-xl">${m.icon}</span>
            <span class="text-sm font-medium text-slate-700">${t(m.nameKey)}</span>
          </label>
        `).join("")}
      </div>
    </div>
  `;
}

// ---- Admin verify escrow payment ----
async function verifyEscrowPayment(paymentId, contractId, milestoneIndex, action) {
  try {
    await updateDoc(doc(db, "escrowPayments", paymentId), {
      status: action, // "verified" or "rejected"
      verifiedAt: serverTimestamp(),
    });

    if (action === "verified") {
      // Update milestone status
      const contractSnap = await getDoc(doc(db, "contracts", contractId));
      const contract = contractSnap.data();
      const milestones = [...(contract.milestones || [])];
      milestones[milestoneIndex] = { ...milestones[milestoneIndex], status: "escrowed" };

      await updateDoc(doc(db, "contracts", contractId), {
        milestones,
        escrowStatus: "secured",
      });
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export { renderEscrowPage, createEscrowPayment, verifyEscrowPayment, PAYMENT_METHODS };
