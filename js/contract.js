// ============================================================
// contract.js — Digital contract signing & management
// ============================================================

import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { t } from "./languages.js";
import { getUser, getUserData } from "./auth.js";
import { renderStatusBadge, formatMMK, formatDate, showToast } from "./components.js";

// ---- Get contracts for user ----
async function getContractsForUser(uid) {
  try {
    const q1 = query(collection(db, "contracts"), where("hiringId", "==", uid));
    const q2 = query(collection(db, "contracts"), where("freelancerId", "==", uid));
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const contracts = [...snap1.docs, ...snap2.docs].map((d) => ({ id: d.id, ...d.data() }));
    // Deduplicate
    const seen = new Set();
    return contracts.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  } catch {
    return [];
  }
}

// ---- Get contract by job ID ----
async function getContractByJobId(jobId) {
  try {
    const q = query(collection(db, "contracts"), where("jobId", "==", jobId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  } catch {
    return null;
  }
}

// ---- Sign contract ----
async function signContract(contractId, signerRole, signatureText) {
  const user = getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const now = new Date().toISOString();
  const field = signerRole === "hiring" ? "hiringSigned" : "freelancerSigned";
  const sigField = signerRole === "hiring" ? "hiringSignature" : "freelancerSignature";

  try {
    await updateDoc(doc(db, "contracts", contractId), {
      [field]: true,
      [sigField]: { text: signatureText, date: now },
    });

    // Check if both signed
    const snap = await getDoc(doc(db, "contracts", contractId));
    const data = snap.data();
    if (data.hiringSigned && data.freelancerSigned) {
      await updateDoc(doc(db, "contracts", contractId), {
        escrowStatus: "pending",
      });
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ---- Render contract view ----
function renderContractView(contract, job) {
  const user = getUser();
  const userData = getUserData();
  const isHiring = userData?.role === "hiring" && contract.hiringId === user?.uid;
  const isFreelancer = userData?.role === "freelancer" && contract.freelancerId === user?.uid;
  const canSign = (isHiring && !contract.hiringSigned) || (isFreelancer && !contract.freelancerSigned);
  const bothSigned = contract.hiringSigned && contract.freelancerSigned;

  const milestones = job?.milestones || [];
  const milestonePerAmount = job ? Math.floor(job.budget / (job.milestonesCount || 1)) : 0;

  return `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <a href="#/dashboard" class="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        ${t("general_back")}
      </a>

      <div class="bg-white rounded-2xl border border-slate-200/60 p-6 sm:p-8 mb-6">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-2xl mb-4 shadow-lg shadow-indigo-200">📝</div>
          <h1 class="text-2xl font-bold text-slate-800">${t("contract_title")}</h1>
          <p class="text-slate-500 text-sm mt-1">${t("contract_job")}: ${job?.title || "—"}</p>
        </div>

        <!-- Parties -->
        <div class="grid grid-cols-2 gap-4 mb-8">
          <div class="bg-slate-50 rounded-xl p-4">
            <p class="text-xs text-slate-400 font-medium mb-1">${t("contract_client")}</p>
            <p class="font-semibold text-slate-800">${job?.hiringName || "—"}</p>
            <div class="mt-2">
              ${contract.hiringSigned
                ? `<span class="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">✅ ${t("contract_signed")}</span>
                   <p class="text-xs text-slate-400 mt-1">${contract.hiringSignature?.text || ""} · ${formatDate(contract.hiringSignature?.date)}</p>`
                : `<span class="text-xs text-amber-600 font-medium">${t("contract_not_signed")}</span>`}
            </div>
          </div>
          <div class="bg-slate-50 rounded-xl p-4">
            <p class="text-xs text-slate-400 font-medium mb-1">${t("contract_freelancer")}</p>
            <p class="font-semibold text-slate-800">${job?.freelancerName || "—"}</p>
            <div class="mt-2">
              ${contract.freelancerSigned
                ? `<span class="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">✅ ${t("contract_signed")}</span>
                   <p class="text-xs text-slate-400 mt-1">${contract.freelancerSignature?.text || ""} · ${formatDate(contract.freelancerSignature?.date)}</p>`
                : `<span class="text-xs text-amber-600 font-medium">${t("contract_not_signed")}</span>`}
            </div>
          </div>
        </div>

        <!-- Milestones Table -->
        <div class="mb-8">
          <h2 class="text-sm font-bold text-slate-800 mb-3">${t("contract_milestones_title")}</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200">
                  <th class="text-left py-2 text-slate-500 font-medium">#</th>
                  <th class="text-left py-2 text-slate-500 font-medium">${t("milestone_amount")}</th>
                  <th class="text-left py-2 text-slate-500 font-medium">${t("milestone_status")}</th>
                </tr>
              </thead>
              <tbody>
                ${Array.from({ length: job?.milestonesCount || 0 }, (_, i) => {
                  const ms = contract.milestones?.[i];
                  const status = ms?.status || "pending";
                  return `
                    <tr class="border-b border-slate-100">
                      <td class="py-2.5 text-slate-600">${i + 1}</td>
                      <td class="py-2.5 font-semibold text-slate-800">${formatMMK(milestonePerAmount)}</td>
                      <td class="py-2.5">${renderStatusBadge(status)}</td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
          <div class="mt-3 flex items-center justify-between text-sm font-semibold text-slate-700 bg-slate-50 rounded-lg px-4 py-2">
            <span>${t("escrow_amount")}</span>
            <span class="text-indigo-600">${formatMMK(job?.budget || 0)}</span>
          </div>
        </div>

        <!-- Escrow Status -->
        <div class="mb-6 text-center">
          <p class="text-sm text-slate-500 mb-1">${t("escrow_title")}</p>
          ${renderStatusBadge(contract.escrowStatus, "lg")}
          ${bothSigned && contract.escrowStatus === "pending" ? `<p class="text-xs text-amber-600 mt-2">${t("contract_awaiting_escrow")}</p>` : ""}
        </div>

        <!-- Sign Section -->
        ${canSign ? `
          <div class="border-t border-slate-200 pt-6">
            <p class="text-sm text-amber-600 font-medium mb-3">${t("contract_sign_warning")}</p>
            <div class="flex gap-3">
              <input type="text" id="contract-signature-input" placeholder="${t("contract_sign_placeholder")}" class="input-field flex-1" />
              <button id="btn-sign-contract" class="btn-primary whitespace-nowrap">${t("contract_sign_btn")}</button>
            </div>
          </div>
        ` : bothSigned ? `
          <div class="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <p class="text-emerald-700 font-semibold">✅ ${t("contract_fully_signed")}</p>
          </div>
        ` : `
          <div class="text-center p-4 bg-slate-50 rounded-xl">
            <p class="text-slate-500">${t("contract_not_signed")}</p>
          </div>
        `}
      </div>
    </div>
  `;
}

export { getContractsForUser, getContractByJobId, signContract, renderContractView };
