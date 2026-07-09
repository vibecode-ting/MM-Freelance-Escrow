// ============================================================
// components.js — Reusable UI components & builders
// ============================================================

import { t, toggleLanguage, getCurrentLang } from "./languages.js";
import { getUser, getUserData, logout } from "./auth.js";

// ---- Status color mapping ----
const STATUS_COLORS = {
  open: "bg-emerald-100 text-emerald-700 border-emerald-200",
  interviewing: "bg-amber-100 text-amber-700 border-amber-200",
  escrow_pending: "bg-sky-100 text-sky-700 border-sky-200",
  active: "bg-violet-100 text-violet-700 border-violet-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  disputed: "bg-red-100 text-red-700 border-red-200",
  pending: "bg-slate-100 text-slate-600 border-slate-200",
  escrowed: "bg-sky-100 text-sky-700 border-sky-200",
  released: "bg-emerald-100 text-emerald-700 border-emerald-200",
  accepted: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

function getStatusColor(status) {
  return STATUS_COLORS[status] || "bg-slate-100 text-slate-600 border-slate-200";
}

// ---- Navigation Bar (Brutalist Ledger) ----
function renderNavbar() {
  const user = getUser();
  const userData = getUserData();
  const lang = getCurrentLang();

  const isAdmin = userData?.role === "admin";

  const navLinks = user
    ? `
      <a href="#/dashboard" class="nav-link">${t("nav_dashboard")}</a>
      <a href="#/jobs" class="nav-link">${t("nav_jobs")}</a>
      ${isAdmin ? `<a href="#/admin" class="nav-link" style="color:var(--accent)">${t("nav_admin")}</a>` : ""}
      <span style="color:var(--rule);margin:0 .25rem">·</span>
      <span class="smallcaps hidden sm:inline" style="color:color-mix(in srgb,var(--ink) 55%,transparent)">${userData?.name || user.email}</span>
      <button id="btn-logout" class="btn-sm btn-ghost">${t("nav_logout")}</button>
    `
    : `
      <a href="#/login" class="nav-link">${t("nav_login")}</a>
      <a href="#/register" class="btn-sm btn--primary" style="margin-left:.5rem">${t("nav_register")}</a>
    `;

  const html = `
    <nav style="position:fixed;top:0;inset-x:0;z-index:50;background:var(--bone);border-bottom:1px solid var(--rule)">
      <div style="max-width:72rem;margin:0 auto;padding:0 clamp(1.5rem,4vw,3rem)">
        <div style="display:flex;align-items:center;justify-content:space-between;height:4rem">
          <a href="#/" style="font-family:var(--display);font-weight:700;font-size:1.15rem;color:var(--ink);letter-spacing:-.01em;display:flex;align-items:center;gap:.6rem">
            <span style="font-family:var(--mono);font-size:.7rem;text-transform:uppercase;letter-spacing:.12em;color:var(--accent);border:1px solid var(--accent);padding:.15rem .45rem">MM</span>
            <span>Escrow</span>
          </a>
          <div class="hidden md:flex" style="align-items:center;gap:.25rem">
            <a href="#/" class="nav-link">${t("nav_home")}</a>
            ${navLinks}
            <button id="btn-lang-toggle" class="btn-sm" style="background:transparent;border:1px solid var(--rule);color:color-mix(in srgb,var(--ink) 65%,transparent);margin-left:.75rem;font-family:var(--mono);font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;cursor:pointer;padding:.3rem .6rem" title="${t("general_language")}">
              ${lang === "my" ? "🇲🇲 " + t("general_myanmar") : "🇬🇧 " + t("general_english")}
            </button>
          </div>
          <button id="btn-mobile-menu" class="md:hidden" style="padding:.5rem;cursor:pointer;background:transparent;border:none;color:var(--ink)">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="square" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </div>
      <!-- Mobile menu -->
      <div id="mobile-menu" class="hidden md:hidden" style="border-top:1px solid var(--rule);background:var(--bone);padding:1rem 1.5rem;display:none;flex-direction:column;gap:.25rem">
        <a href="#/" style="padding:.5rem 0;font-family:var(--mono);font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:color-mix(in srgb,var(--ink) 65%,transparent)">${t("nav_home")}</a>
        ${user ? `
          <a href="#/dashboard" style="padding:.5rem 0;font-family:var(--mono);font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:color-mix(in srgb,var(--ink) 65%,transparent)">${t("nav_dashboard")}</a>
          <a href="#/jobs" style="padding:.5rem 0;font-family:var(--mono);font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:color-mix(in srgb,var(--ink) 65%,transparent)">${t("nav_jobs")}</a>
          ${isAdmin ? `<a href="#/admin" style="padding:.5rem 0;font-family:var(--mono);font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:var(--accent)">${t("nav_admin")}</a>` : ""}
          <button id="btn-logout-mobile" style="padding:.5rem 0;font-family:var(--mono);font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:#dc2626;background:none;border:none;cursor:pointer;text-align:left">${t("nav_logout")}</button>
        ` : `
          <a href="#/login" style="padding:.5rem 0;font-family:var(--mono);font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:color-mix(in srgb,var(--ink) 65%,transparent)">${t("nav_login")}</a>
          <a href="#/register" style="padding:.5rem 0;font-family:var(--mono);font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:var(--accent)">${t("nav_register")}</a>
        `}
        <button id="btn-lang-toggle-mobile" style="padding:.5rem 0;font-family:var(--mono);font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:color-mix(in srgb,var(--ink) 65%,transparent);background:none;border:none;cursor:pointer;text-align:left">
          ${lang === "my" ? "🇲🇲 " + t("general_myanmar") : "🇬🇧 " + t("general_english")}
        </button>
      </div>
    </nav>
  `;
  return html;
}

// ---- Toast / Alert ----
function showToast(message, type = "info") {
  const colors = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    info: "bg-sky-500",
    warning: "bg-amber-500",
  };
  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };

  const toast = document.createElement("div");
  toast.className = `fixed top-20 right-4 z-[9999] ${colors[type]} text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium animate-slide-in`;
  toast.innerHTML = `<span class="text-lg">${icons[type]}</span> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ---- Stat Card (Brutalist Ledger) ----
function renderStatCard(label, value, icon = "", color = "indigo") {
  return `
    <div style="background:var(--bone);border:1px solid var(--rule);padding:clamp(1rem,2vw,1.5rem)">
      <div style="display:flex;align-items:baseline;justify-content:space-between;gap:.5rem">
        <span class="smallcaps">${label}</span>
        <span style="font-family:var(--mono);font-size:.7rem;color:var(--accent)">${icon}</span>
      </div>
      <p style="font-family:var(--mono);font-size:clamp(1.2rem,2.5vw,1.6rem);font-weight:500;color:var(--ink);margin-top:.25rem;letter-spacing:.01em">${value}</p>
    </div>
  `;
}

// ---- Status Badge (Brutalist Ledger) ----
function renderStatusBadge(status, size = "sm") {
  const sizeClass = size === "lg" ? "padding:.4rem .8rem;font-size:.8rem" : "padding:.25rem .6rem;font-size:.7rem";
  const color = STATUS_COLORS[status] || "slate";
  return `<span style="display:inline-flex;align-items:center;${sizeClass};font-family:var(--mono);font-weight:500;text-transform:uppercase;letter-spacing:.08em;border:1px solid var(--rule);color:color-mix(in srgb,var(--ink) 70%,transparent)">${status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>`;
}

// ---- Workflow Steps ----
function renderWorkflowSteps(currentStep) {
  const steps = [
    { key: "post", label: t("workflow_post"), icon: "📋" },
    { key: "interview", label: t("workflow_interview"), icon: "💬" },
    { key: "contract", label: t("workflow_contract"), icon: "📝" },
    { key: "escrow", label: t("workflow_escrow"), icon: "💰" },
    { key: "active", label: t("workflow_active"), icon: "⚡" },
    { key: "release", label: t("workflow_release"), icon: "🎉" },
  ];

  const stepIndex = steps.findIndex((s) => s.key === currentStep);

  return `
    <div class="flex items-center justify-between w-full max-w-2xl mx-auto py-6">
      ${steps
        .map((step, i) => {
          const isActive = i === stepIndex;
          const isComplete = i < stepIndex;
          const circleClass = isComplete
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
            : isActive
            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-100"
            : "bg-slate-100 text-slate-400";
          const lineClass = isComplete ? "bg-emerald-400" : "bg-slate-200";
          return `
            <div class="flex flex-col items-center relative z-10">
              <div class="w-10 h-10 rounded-full ${circleClass} flex items-center justify-center text-sm font-bold transition-all duration-300">${isComplete ? "✓" : step.icon}</div>
              <span class="text-xs mt-2 font-medium ${isActive ? "text-indigo-600" : isComplete ? "text-emerald-600" : "text-slate-400"}">${step.label}</span>
            </div>
            ${i < steps.length - 1 ? `<div class="flex-1 h-0.5 ${lineClass} -mt-5 mx-1"></div>` : ""}
          `;
        })
        .join("")}
    </div>
  `;
}

// ---- Empty State ----
function renderEmptyState(message, icon = "📭") {
  return `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <div class="text-5xl mb-4">${icon}</div>
      <p class="text-slate-400 text-lg font-medium">${message}</p>
    </div>
  `;
}

// ---- Modal ----
function renderModal(id, title, bodyHtml, footerHtml = "") {
  return `
    <div id="${id}" class="fixed inset-0 z-[999] hidden items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 class="text-lg font-bold text-slate-800">${title}</h3>
          <button onclick="document.getElementById('${id}').classList.add('hidden')" class="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="px-6 py-4">${bodyHtml}</div>
        ${footerHtml ? `<div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">${footerHtml}</div>` : ""}
      </div>
    </div>
  `;
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove("hidden");
    el.classList.add("flex");
  }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add("hidden");
    el.classList.remove("flex");
  }
}

// ---- Format MMK ----
function formatMMK(amount) {
  return new Intl.NumberFormat("en-US").format(amount) + " MMK";
}

// ---- Date Formatter ----
function formatDate(timestamp) {
  if (!timestamp) return "—";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export {
  renderNavbar,
  showToast,
  renderStatCard,
  renderStatusBadge,
  renderWorkflowSteps,
  renderEmptyState,
  renderModal,
  openModal,
  closeModal,
  formatMMK,
  formatDate,
  getStatusColor,
};
