// ============================================================
// jobs.js — Job management: post, list, apply, view details
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
  orderBy,
  serverTimestamp,
  increment,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { t } from "./languages.js";
import { getUser, getUserData } from "./auth.js";
import {
  renderStatusBadge,
  renderEmptyState,
  formatMMK,
  formatDate,
  showToast,
} from "./components.js";

// ---- Post a new job ----
async function postJob({ title, description, budget, milestonesCount }) {
  const user = getUser();
  const userData = getUserData();
  if (!user || userData?.role !== "hiring") return { success: false, error: "Unauthorized" };

  try {
    await addDoc(collection(db, "jobs"), {
      hiringId: user.uid,
      hiringName: userData.name,
      title,
      description,
      budget: Number(budget),
      milestonesCount: Number(milestonesCount),
      status: "open",
      proposalsCount: 0,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ---- Get all jobs ----
async function getAllJobs() {
  try {
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

// ---- Get jobs by hiring manager ----
async function getJobsByHiring(hiringId) {
  try {
    const q = query(collection(db, "jobs"), where("hiringId", "==", hiringId), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

// ---- Submit a proposal ----
async function submitProposal(jobId, bidAmount, coverLetter) {
  const user = getUser();
  const userData = getUserData();
  if (!user || userData?.role !== "freelancer") return { success: false, error: "Unauthorized" };

  try {
    await addDoc(collection(db, "proposals"), {
      jobId,
      freelancerId: user.uid,
      freelancerName: userData.name,
      bidAmount: Number(bidAmount),
      coverLetter,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    // Increment proposals count on the job
    const jobRef = doc(db, "jobs", jobId);
    await updateDoc(jobRef, { proposalsCount: increment(1) });

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ---- Get proposals for a job ----
async function getProposalsForJob(jobId) {
  try {
    const q = query(collection(db, "proposals"), where("jobId", "==", jobId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

// ---- Get proposals by freelancer ----
async function getProposalsByFreelancer(freelancerId) {
  try {
    const q = query(collection(db, "proposals"), where("freelancerId", "==", freelancerId), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

// ---- Accept / Reject proposal ----
async function updateProposalStatus(proposalId, status, jobId, freelancerId) {
  try {
    await updateDoc(doc(db, "proposals", proposalId), { status });

    if (status === "accepted") {
      // Create a contract and move job to interviewing
      await addDoc(collection(db, "contracts"), {
        jobId,
        hiringId: getUser().uid,
        freelancerId,
        hiringSigned: false,
        freelancerSigned: false,
        hiringSignature: null,
        freelancerSignature: null,
        milestones: [],
        escrowStatus: "pending",
        platformVerdict: null,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "jobs", jobId), { status: "interviewing" });
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ---- Render job card ----
function renderJobCard(job) {
  return `
    <div class="bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 cursor-pointer group" onclick="window.location.hash='#/jobs/${job.id}'">
      <div class="flex items-start justify-between mb-3">
        <h3 class="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-base">${job.title}</h3>
        ${renderStatusBadge(job.status)}
      </div>
      <p class="text-sm text-slate-500 mb-4 line-clamp-2">${job.description}</p>
      <div class="flex items-center justify-between text-sm">
        <span class="font-bold text-indigo-600">${formatMMK(job.budget)}</span>
        <div class="flex items-center gap-3 text-slate-400">
          <span>📋 ${job.milestonesCount} MS</span>
          <span>📨 ${job.proposalsCount || 0} ${t("jobs_proposal_count")}</span>
        </div>
      </div>
      <div class="mt-3 text-xs text-slate-400">
        ${t("jobs_status_" + job.status)} · ${formatDate(job.createdAt)}
      </div>
    </div>
  `;
}

// ---- Render Jobs Page ----
function renderJobsPage() {
  const user = getUser();
  const userData = getUserData();
  const isHiring = userData?.role === "hiring";
  const isFreelancer = userData?.role === "freelancer";

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">${t("jobs_title")}</h1>
          <p class="text-slate-500 text-sm mt-1">${isHiring ? t("jobs_post_new") : t("jobs_search_placeholder")}</p>
        </div>
        ${isHiring ? `
          <button onclick="window.location.hash='#/jobs/new'" class="btn-primary">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            ${t("jobs_post_new")}
          </button>
        ` : ""}
      </div>

      <div class="mb-6">
        <input type="text" id="jobs-search" placeholder="${t("jobs_search_placeholder")}"
          class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm" />
      </div>

      <div id="jobs-list" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        ${renderEmptyState(t("general_loading"), "⏳")}
      </div>
    </div>
  `;
}

// ---- Render Post Job Form ----
function renderPostJobForm() {
  return `
    <div class="max-w-2xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-slate-800 mb-6">${t("jobs_post_new")}</h1>
      <form id="post-job-form" class="space-y-5 bg-white rounded-2xl border border-slate-200/60 p-6 sm:p-8">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">${t("jobs_post_title")}</label>
          <input type="text" name="title" required class="input-field" placeholder="${t("jobs_post_title")}" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">${t("jobs_post_desc")}</label>
          <textarea name="description" rows="4" required class="input-field" placeholder="${t("jobs_post_desc")}"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">${t("jobs_post_budget")}</label>
            <input type="number" name="budget" min="1000" required class="input-field" placeholder="500,000" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">${t("jobs_post_milestones")}</label>
            <input type="number" name="milestonesCount" min="1" max="5" value="1" required class="input-field" />
          </div>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="submit" class="btn-primary flex-1">${t("jobs_post_submit")}</button>
          <a href="#/jobs" class="btn-ghost flex-1 text-center">${t("jobs_post_cancel")}</a>
        </div>
      </form>
    </div>
  `;
}

// ---- Render Job Detail ----
function renderJobDetail(job, proposals = [], existingProposal = null) {
  const user = getUser();
  const userData = getUserData();
  const isHiring = userData?.role === "hiring" && job.hiringId === user?.uid;
  const isFreelancer = userData?.role === "freelancer";

  return `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <a href="#/jobs" class="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        ${t("general_back")}
      </a>

      <div class="bg-white rounded-2xl border border-slate-200/60 p-6 sm:p-8 mb-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">${job.title}</h1>
            <p class="text-sm text-slate-400 mt-1">${t("jobs_status_" + job.status)} · ${formatDate(job.createdAt)}</p>
          </div>
          ${renderStatusBadge(job.status, "lg")}
        </div>
        <p class="text-slate-600 mb-6 whitespace-pre-line">${job.description}</p>
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-slate-50 rounded-xl p-4 text-center">
            <p class="text-sm text-slate-500">${t("jobs_budget")}</p>
            <p class="text-xl font-bold text-indigo-600">${formatMMK(job.budget)}</p>
          </div>
          <div class="bg-slate-50 rounded-xl p-4 text-center">
            <p class="text-sm text-slate-500">${t("jobs_milestones")}</p>
            <p class="text-xl font-bold text-slate-800">${job.milestonesCount}</p>
          </div>
          <div class="bg-slate-50 rounded-xl p-4 text-center">
            <p class="text-sm text-slate-500">${t("jobs_proposal_count")}</p>
            <p class="text-xl font-bold text-slate-800">${job.proposalsCount || 0}</p>
          </div>
        </div>
      </div>

      ${isHiring && proposals.length > 0 ? `
        <div class="bg-white rounded-2xl border border-slate-200/60 p-6 sm:p-8">
          <h2 class="text-lg font-bold text-slate-800 mb-4">${t("dash_incoming_proposals")}</h2>
          <div class="space-y-3">
            ${proposals.map(p => `
              <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p class="font-semibold text-slate-800">${p.freelancerName}</p>
                  <p class="text-sm text-slate-500">${formatMMK(p.bidAmount)}</p>
                </div>
                ${p.status === "pending" ? `
                  <div class="flex gap-2">
                    <button onclick="window.acceptProposal('${p.id}', '${job.id}', '${p.freelancerId}')" class="btn-sm btn-primary">${t("jobs_accept")}</button>
                    <button onclick="window.rejectProposal('${p.id}')" class="btn-sm btn-danger">${t("jobs_reject")}</button>
                  </div>
                ` : renderStatusBadge(p.status)}
              </div>
            `).join("")}
          </div>
        </div>
      ` : ""}

      ${isFreelancer && job.status === "open" && !existingProposal ? `
        <div class="bg-white rounded-2xl border border-slate-200/60 p-6 sm:p-8">
          <h2 class="text-lg font-bold text-slate-800 mb-4">${t("jobs_apply")}</h2>
          <form id="proposal-form" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">${t("jobs_proposal_bid")}</label>
              <input type="number" name="bidAmount" min="1000" required class="input-field" placeholder="500,000" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">${t("jobs_proposal_cover")}</label>
              <textarea name="coverLetter" rows="4" required class="input-field" placeholder="${t("jobs_proposal_cover")}"></textarea>
            </div>
            <button type="submit" class="btn-primary w-full">${t("jobs_proposal_submit")}</button>
          </form>
        </div>
      ` : ""}

      ${isFreelancer && existingProposal ? `
        <div class="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-center">
          <p class="text-slate-500">✅ ${t("jobs_proposal_count")} — ${renderStatusBadge(existingProposal.status)}</p>
        </div>
      ` : ""}
    </div>
  `;
}

export {
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
};
