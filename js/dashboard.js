// ============================================================
// dashboard.js — Freelancer & Hiring dashboard views
// ============================================================

import { t } from "./languages.js";
import { getUser, getUserData } from "./auth.js";
import {
  renderStatCard,
  renderStatusBadge,
  renderEmptyState,
  renderWorkflowSteps,
  formatMMK,
  formatDate,
} from "./components.js";
import { getProposalsByFreelancer } from "./jobs.js";
import { getContractsForUser } from "./contract.js";

// ---- Freelancer Dashboard ----
async function renderFreelancerDashboard(user, userData) {
  const proposals = await getProposalsByFreelancer(user.uid);
  const contracts = await getContractsForUser(user.uid);
  const wallet = userData?.wallet || { balance: 0, pendingWithdrawals: 0 };

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-800">${t("dash_freelancer_title")}</h1>
        <p class="text-slate-500 text-sm mt-1">${t("dash_welcome")}, ${userData?.name || user.email}</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        ${renderStatCard(t("dash_total_earned"), formatMMK(wallet.balance), "💰", "emerald")}
        ${renderStatCard(t("dash_pending_withdrawals"), formatMMK(wallet.pendingWithdrawals), "⏳", "amber")}
        ${renderStatCard(t("dash_my_proposals"), proposals.length, "📨", "indigo")}
        ${renderStatCard(t("dash_active_contracts"), contracts.filter(c => c.escrowStatus === "secured").length, "📝", "violet")}
      </div>

      <!-- Role Lock Notice -->
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center gap-3">
        <span class="text-lg">🔒</span>
        <p class="text-sm text-amber-700">${t("auth_role_locked_warning")}</p>
      </div>

      <!-- Active Contracts -->
      <div class="bg-white rounded-2xl border border-slate-200/60 p-6 mb-6">
        <h2 class="text-lg font-bold text-slate-800 mb-4">${t("dash_active_contracts")}</h2>
        ${contracts.length > 0 ? `
          <div class="space-y-3">
            ${contracts.map(c => `
              <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition cursor-pointer" onclick="window.location.hash='#/contract/${c.id}'">
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-slate-800 truncate">Contract #${c.id.slice(0, 8)}</p>
                  <p class="text-sm text-slate-500">${renderStatusBadge(c.escrowStatus)}</p>
                </div>
                <div class="text-right ml-4">
                  <p class="text-sm font-semibold text-indigo-600">${c.hiringSigned && c.freelancerSigned ? "✅" : "⏳"}</p>
                </div>
              </div>
            `).join("")}
          </div>
        ` : renderEmptyState(t("dash_no_contracts"), "📝")}
      </div>

      <!-- Recent Proposals -->
      <div class="bg-white rounded-2xl border border-slate-200/60 p-6">
        <h2 class="text-lg font-bold text-slate-800 mb-4">${t("dash_my_proposals")}</h2>
        ${proposals.length > 0 ? `
          <div class="space-y-3">
            ${proposals.slice(0, 10).map(p => `
              <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-slate-800 truncate">Job #${p.jobId.slice(0, 8)}</p>
                  <p class="text-sm text-slate-500">${formatMMK(p.bidAmount)} · ${formatDate(p.createdAt)}</p>
                </div>
                <div class="ml-4">
                  ${renderStatusBadge(p.status)}
                </div>
              </div>
            `).join("")}
          </div>
        ` : renderEmptyState(t("dash_no_proposals"), "📭")}
      </div>
    </div>
  `;
}

// ---- Hiring Dashboard ----
async function renderHiringDashboard(user, userData) {
  const contracts = await getContractsForUser(user.uid);
  const wallet = userData?.wallet || { balance: 0, pendingWithdrawals: 0 };

  // Count active and pending
  const activeContracts = contracts.filter(c => c.escrowStatus === "secured" || c.escrowStatus === "pending");

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-800">${t("dash_hiring_title")}</h1>
        <p class="text-slate-500 text-sm mt-1">${t("dash_welcome")}, ${userData?.name || user.email}</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        ${renderStatCard(t("dash_posted_jobs"), "—", "📋", "indigo")}
        ${renderStatCard(t("dash_incoming_proposals"), "—", "📨", "violet")}
        ${renderStatCard(t("dash_manage_escrow"), activeContracts.length, "💰", "emerald")}
        ${renderStatCard(t("dash_total_spent"), "—", "💸", "amber")}
      </div>

      <!-- Role Lock Notice -->
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center gap-3">
        <span class="text-lg">🔒</span>
        <p class="text-sm text-amber-700">${t("auth_role_locked_warning")}</p>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <a href="#/jobs/new" class="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 hover:shadow-xl transition-all">
          <p class="text-lg font-bold mb-1">${t("jobs_post_new")}</p>
          <p class="text-sm text-indigo-100">Post a new job and find talent</p>
        </a>
        <a href="#/jobs" class="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200 hover:shadow-xl transition-all">
          <p class="text-lg font-bold mb-1">${t("jobs_title")}</p>
          <p class="text-sm text-emerald-100">Browse and manage all jobs</p>
        </a>
      </div>

      <!-- Active Contracts -->
      <div class="bg-white rounded-2xl border border-slate-200/60 p-6">
        <h2 class="text-lg font-bold text-slate-800 mb-4">${t("dash_manage_escrow")}</h2>
        ${activeContracts.length > 0 ? `
          <div class="space-y-3">
            ${activeContracts.map(c => `
              <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-slate-800 truncate">Contract #${c.id.slice(0, 8)}</p>
                  <div class="flex items-center gap-2 mt-1">
                    ${renderStatusBadge(c.escrowStatus)}
                    <span class="text-xs text-slate-400">Signed: ${c.hiringSigned && c.freelancerSigned ? "✅ Both" : "⏳ Pending"}</span>
                  </div>
                </div>
                <div class="flex gap-2 ml-4">
                  ${c.escrowStatus === "pending" && c.hiringSigned && c.freelancerSigned ? `
                    <a href="#/escrow/${c.id}" class="btn-sm btn-primary">${t("escrow_title")}</a>
                  ` : ""}
                  <a href="#/contract/${c.id}" class="btn-sm btn-ghost">${t("dash_view_details")}</a>
                </div>
              </div>
            `).join("")}
          </div>
        ` : renderEmptyState(t("dash_no_contracts"), "📝")}
      </div>
    </div>
  `;
}

export { renderFreelancerDashboard, renderHiringDashboard };
