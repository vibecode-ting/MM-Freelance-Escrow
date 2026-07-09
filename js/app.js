// ============================================================
// app.js — Main application controller & hash router
// ============================================================

import { t, toggleLanguage, getCurrentLang } from "./languages.js";
import { register, login, logout, onAuthChange, getUser, getUserData } from "./auth.js";
import { renderNavbar, showToast, renderWorkflowSteps, renderEmptyState, openModal, closeModal } from "./components.js";
import { renderHomePage } from "./home.js";
import {
  postJob,
  getAllJobs,
  getJobsByHiring,
  submitProposal,
  getProposalsForJob,
  getProposalsByFreelancer,
  updateProposalStatus,
  renderJobsPage,
  renderPostJobForm,
  renderJobDetail,
  renderJobCard,
} from "./jobs.js";
import { getContractsForUser, getContractByJobId, signContract, renderContractView } from "./contract.js";
import { renderEscrowPage } from "./escrow.js";
import {
  fullRefund,
  fiftyFiftySplit,
  fullRelease,
  resetJobToOpen,
  renderAdminPage,
  renderAdminActionPanel,
} from "./admin.js";
import { renderFreelancerDashboard, renderHiringDashboard } from "./dashboard.js";

// ---- DOM refs ----
const appEl = document.getElementById("app");
const navbarEl = document.getElementById("navbar");

// ---- Global state ----
let authUser = null;
let authUserData = null;

// ---- Render helpers ----
function render(content) {
  navbarEl.innerHTML = renderNavbar();
  appEl.innerHTML = content;
  bindNavbarEvents();
  window.scrollTo(0, 0);
}

function renderCurrentView() {
  handleRoute();
}

// Make available globally for language toggle
window.renderCurrentView = renderCurrentView;

// ---- Bind navbar events ----
function bindNavbarEvents() {
  const langBtn = document.getElementById("btn-lang-toggle");
  const langBtnMobile = document.getElementById("btn-lang-toggle-mobile");
  const logoutBtn = document.getElementById("btn-logout");
  const logoutBtnMobile = document.getElementById("btn-logout-mobile");
  const mobileMenuBtn = document.getElementById("btn-mobile-menu");
  const mobileMenu = document.getElementById("mobile-menu");

  if (langBtn) langBtn.addEventListener("click", toggleLanguage);
  if (langBtnMobile) langBtnMobile.addEventListener("click", toggleLanguage);
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
  if (logoutBtnMobile) logoutBtnMobile.addEventListener("click", handleLogout);

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }
}

// ---- Auth handlers ----
async function handleLogout() {
  await logout();
  window.location.hash = "#/";
  showToast(t("general_success"), "success");
}

function handleRegister() {
  const form = document.getElementById("register-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = fd.get("name");
    const email = fd.get("email");
    const password = fd.get("password");
    const confirmPassword = fd.get("confirmPassword");
    const role = fd.get("role");
    const skillLevel = fd.get("skillLevel");

    if (!role) {
      showToast("Please select a role", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast(t("auth_error_password_mismatch"), "error");
      return;
    }
    if (password.length < 6) {
      showToast(t("auth_error_weak_password"), "error");
      return;
    }

    const result = await register(email, password, name, role, skillLevel);
    if (result.success) {
      showToast(t("general_success"), "success");
      window.location.hash = "#/dashboard";
    } else {
      showToast(result.error, "error");
    }
  });
}

function handleLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const email = fd.get("email");
    const password = fd.get("password");

    const result = await login(email, password);
    if (result.success) {
      showToast(t("general_success"), "success");
      window.location.hash = "#/dashboard";
    } else {
      showToast(result.error, "error");
    }
  });
}

// ---- Route handling ----
function handleRoute() {
  const hash = window.location.hash || "#/";
  const path = hash.replace("#", "");
  const parts = path.split("/").filter(Boolean);

  // Always re-render navbar
  navbarEl.innerHTML = renderNavbar();
  bindNavbarEvents();

  // Route matching
  if (parts.length === 0 || path === "/") {
    render(renderHomePage());
  } else if (path === "/login") {
    render(renderLogin());
    handleLogin();
  } else if (path === "/register") {
    render(renderRegister());
    handleRegister();
  } else if (path === "/dashboard") {
    handleDashboard();
  } else if (path === "/jobs") {
    handleJobsList();
  } else if (path === "/jobs/new") {
    render(renderPostJobForm());
    handlePostJobForm();
  } else if (parts[0] === "jobs" && parts[1]) {
    handleJobDetail(parts[1]);
  } else if (parts[0] === "contract" && parts[1]) {
    handleContractView(parts[1]);
  } else if (parts[0] === "escrow" && parts[1]) {
    handleEscrowView(parts[1]);
  } else if (path === "/admin") {
    render(renderAdminPage());
    handleAdminActions();
  } else {
    render(renderNotFound());
  }
}

// ---- Page renderers ----

function renderLogin() {
  return `
    <div class="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xl font-black mb-4 shadow-lg shadow-indigo-200">M</div>
          <h1 class="text-2xl font-bold text-slate-800">${t("auth_login_title")}</h1>
        </div>
        <form id="login-form" class="bg-white rounded-2xl border border-slate-200/60 p-6 sm:p-8 space-y-5 shadow-xl shadow-slate-100/50">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">${t("auth_email")}</label>
            <input type="email" name="email" required class="input-field" placeholder="you@example.com" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">${t("auth_password")}</label>
            <input type="password" name="password" required class="input-field" placeholder="••••••" />
          </div>
          <button type="submit" class="btn-primary w-full py-3">${t("auth_submit_login")}</button>
          <p class="text-center text-sm text-slate-500">
            ${t("auth_no_account")}
            <a href="#/register" class="text-indigo-600 font-semibold hover:underline">${t("auth_register_title")}</a>
          </p>
        </form>
      </div>
    </div>
  `;
}

function renderRegister() {
  return `
    <div class="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
      <div class="w-full max-w-lg">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xl font-black mb-4 shadow-lg shadow-indigo-200">M</div>
          <h1 class="text-2xl font-bold text-slate-800">${t("auth_register_title")}</h1>
        </div>
        <form id="register-form" class="bg-white rounded-2xl border border-slate-200/60 p-6 sm:p-8 space-y-5 shadow-xl shadow-slate-100/50">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">${t("auth_name")}</label>
            <input type="text" name="name" required class="input-field" placeholder="${t("auth_name")}" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">${t("auth_email")}</label>
            <input type="email" name="email" required class="input-field" placeholder="you@example.com" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">${t("auth_password")}</label>
              <input type="password" name="password" required minlength="6" class="input-field" placeholder="••••••" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">${t("auth_confirm_password")}</label>
              <input type="password" name="confirmPassword" required minlength="6" class="input-field" placeholder="••••••" />
            </div>
          </div>

          <!-- Role Selection (Immutable) -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">${t("auth_role_title")}</label>
            <div class="grid grid-cols-2 gap-3">
              <label class="relative flex flex-col items-center p-4 rounded-xl border-2 border-slate-200 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/50 transition-all has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50">
                <input type="radio" name="role" value="freelancer" class="sr-only" />
                <span class="text-3xl mb-2">👨‍💻</span>
                <span class="font-semibold text-slate-800 text-sm text-center">${t("auth_role_freelancer")}</span>
                <span class="text-xs text-slate-500 text-center mt-1">${t("auth_role_freelancer_desc")}</span>
              </label>
              <label class="relative flex flex-col items-center p-4 rounded-xl border-2 border-slate-200 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/50 transition-all has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50">
                <input type="radio" name="role" value="hiring" class="sr-only" />
                <span class="text-3xl mb-2">🏢</span>
                <span class="font-semibold text-slate-800 text-sm text-center">${t("auth_role_hiring")}</span>
                <span class="text-xs text-slate-500 text-center mt-1">${t("auth_role_hiring_desc")}</span>
              </label>
            </div>
            <p class="text-xs text-amber-600 mt-2 flex items-center gap-1">${t("auth_role_locked_warning")}</p>
          </div>

          <!-- Skill Level (Freelancer only) -->
          <div id="skill-level-group" class="hidden">
            <label class="block text-sm font-semibold text-slate-700 mb-2">${t("auth_skill_level")}</label>
            <div class="flex flex-wrap gap-2">
              ${["beginner", "entry", "mid", "advanced", "pro"].map(
                (level) => `
                <label class="px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition text-sm has-[:checked]:bg-indigo-500 has-[:checked]:text-white has-[:checked]:border-indigo-500">
                  <input type="radio" name="skillLevel" value="${level}" class="sr-only" />
                  ${t("auth_skill_" + level)}
                </label>
              `
              ).join("")}
            </div>
          </div>

          <button type="submit" class="btn-primary w-full py-3">${t("auth_submit_register")}</button>
          <p class="text-center text-sm text-slate-500">
            ${t("auth_has_account")}
            <a href="#/login" class="text-indigo-600 font-semibold hover:underline">${t("auth_login_title")}</a>
          </p>
        </form>
      </div>
    </div>
  `;
}

function renderNotFound() {
  return `
    <div class="min-h-screen flex items-center justify-center px-4">
      <div class="text-center">
        <div class="text-6xl mb-4">🔍</div>
        <h1 class="text-4xl font-bold text-slate-800 mb-2">404</h1>
        <p class="text-slate-500 mb-6">Page not found</p>
        <a href="#/" class="btn-primary">Go Home</a>
      </div>
    </div>
  `;
}

// ---- Dashboard handler ----
async function handleDashboard() {
  if (!authUser) {
    window.location.hash = "#/login";
    return;
  }

  render(`
    <div class="min-h-screen flex items-center justify-center pt-20">
      <div class="text-center">
        <div class="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-slate-500">${t("general_loading")}</p>
      </div>
    </div>
  `);

  let content;
  if (authUserData?.role === "freelancer") {
    content = await renderFreelancerDashboard(authUser, authUserData);
  } else if (authUserData?.role === "hiring") {
    content = await renderHiringDashboard(authUser, authUserData);
  } else {
    content = renderAdminPage();
  }

  render(content);
}

// ---- Jobs handlers ----
async function handleJobsList() {
  render(`
    <div class="min-h-screen flex items-center justify-center pt-20">
      <div class="text-center">
        <div class="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-slate-500">${t("general_loading")}</p>
      </div>
    </div>
  `);

  const jobs = await getAllJobs();
  let content = renderJobsPage();

  // Inject job cards
  const jobsListEl = content.match(/id="jobs-list"[\s\S]*?<\/div>/);
  if (jobs.length > 0) {
    const cardsHtml = jobs.map(renderJobCard).join("");
    content = content.replace(
      /<div id="jobs-list"[\s\S]*?<\/div>/,
      `<div id="jobs-list" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">${cardsHtml}</div>`
    );
  }

  render(content);

  // Bind search
  const searchInput = document.getElementById("jobs-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(term) ||
          j.description.toLowerCase().includes(term)
      );
      const listEl = document.getElementById("jobs-list");
      if (listEl) {
        listEl.innerHTML = filtered.length > 0 ? filtered.map(renderJobCard).join("") : `<div class="col-span-full">${renderEmptyState("No jobs found", "🔍")}</div>`;
      }
    });
  }
}

function handlePostJobForm() {
  const form = document.getElementById("post-job-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const result = await postJob({
      title: fd.get("title"),
      description: fd.get("description"),
      budget: fd.get("budget"),
      milestonesCount: fd.get("milestonesCount"),
    });

    if (result.success) {
      showToast(t("general_success"), "success");
      window.location.hash = "#/jobs";
    } else {
      showToast(result.error || t("general_error"), "error");
    }
  });
}

async function handleJobDetail(jobId) {
  render(`
    <div class="min-h-screen flex items-center justify-center pt-20">
      <div class="text-center">
        <div class="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-slate-500">${t("general_loading")}</p>
      </div>
    </div>
  `);

  const jobs = await getAllJobs();
  const job = jobs.find((j) => j.id === jobId);

  if (!job) {
    render(renderNotFound());
    return;
  }

  const proposals = await getProposalsForJob(jobId);
  let existingProposal = null;

  if (authUser && authUserData?.role === "freelancer") {
    const myProposals = await getProposalsByFreelancer(authUser.uid);
    existingProposal = myProposals.find((p) => p.jobId === jobId);
  }

  render(renderJobDetail(job, proposals, existingProposal));

  // Bind proposal form
  const proposalForm = document.getElementById("proposal-form");
  if (proposalForm) {
    proposalForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(proposalForm);
      const result = await submitProposal(jobId, fd.get("bidAmount"), fd.get("coverLetter"));
      if (result.success) {
        showToast(t("general_success"), "success");
        handleJobDetail(jobId);
      } else {
        showToast(result.error || t("general_error"), "error");
      }
    });
  }

  // Expose accept/reject globally
  window.acceptProposal = async (proposalId, jobId, freelancerId) => {
    const result = await updateProposalStatus(proposalId, "accepted", jobId, freelancerId);
    if (result.success) {
      showToast(t("general_success"), "success");
      handleJobDetail(jobId);
    } else {
      showToast(result.error || t("general_error"), "error");
    }
  };

  window.rejectProposal = async (proposalId) => {
    const result = await updateProposalStatus(proposalId, "rejected");
    if (result.success) {
      showToast("Proposal rejected", "info");
      handleRoute();
    }
  };
}

// ---- Contract handler ----
async function handleContractView(contractId) {
  if (!authUser) {
    window.location.hash = "#/login";
    return;
  }

  render(`
    <div class="min-h-screen flex items-center justify-center pt-20">
      <div class="text-center">
        <div class="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-slate-500">${t("general_loading")}</p>
      </div>
    </div>
  `);

  const contracts = await getContractsForUser(authUser.uid);
  const contract = contracts.find((c) => c.id === contractId);

  if (!contract) {
    render(renderNotFound());
    return;
  }

  const jobs = await getAllJobs();
  const job = jobs.find((j) => j.id === contract.jobId);

  let content = renderContractView(contract, job);

  // Add admin action panel if admin
  if (authUserData?.role === "admin") {
    content = renderAdminActionPanel(contract, job) + content;
  }

  render(content);

  // Bind sign button
  const signBtn = document.getElementById("btn-sign-contract");
  if (signBtn) {
    signBtn.addEventListener("click", async () => {
      const input = document.getElementById("contract-signature-input");
      const text = input?.value?.trim();
      if (!text) {
        showToast("Please enter your name", "error");
        return;
      }

      const role = authUser.uid === contract.hiringId ? "hiring" : "freelancer";
      const result = await signContract(contractId, role, text);
      if (result.success) {
        showToast(t("general_success"), "success");
        handleContractView(contractId);
      } else {
        showToast(result.error || t("general_error"), "error");
      }
    });
  }

  // Bind admin actions
  handleAdminActions();
}

// ---- Escrow handler ----
async function handleEscrowView(contractId) {
  if (!authUser) {
    window.location.hash = "#/login";
    return;
  }

  const contracts = await getContractsForUser(authUser.uid);
  const contract = contracts.find((c) => c.id === contractId);

  if (!contract) {
    render(renderNotFound());
    return;
  }

  const jobs = await getAllJobs();
  const job = jobs.find((j) => j.id === contract.jobId);

  render(renderEscrowPage(contract, job));
}

// ---- Admin handlers ----
function handleAdminActions() {
  window.adminAction = async (action, contractId, jobId) => {
    let result;
    switch (action) {
      case "full_refund":
        result = await fullRefund(contractId);
        break;
      case "fifty_fifty":
        result = await fiftyFiftySplit(contractId);
        break;
      case "full_release":
        result = await fullRelease(contractId);
        break;
      case "reset_job":
        result = await resetJobToOpen(jobId, contractId);
        break;
    }

    if (result?.success) {
      showToast("Admin action completed", "success");
      handleRoute();
    } else {
      showToast(result?.error || "Action failed", "error");
    }
  };
}

// ---- Init ----
function init() {
  onAuthChange((user, userData) => {
    authUser = user;
    authUserData = userData;
    handleRoute();
  });

  window.addEventListener("hashchange", handleRoute);
}

init();
