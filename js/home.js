// ============================================================
// home.js — Landing page / Hero section
// ============================================================

import { t } from "./languages.js";

function renderHomePage() {
  return `
    <div class="min-h-screen">
      <!-- Hero Section -->
      <section class="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
        <!-- Background decoration -->
        <div class="absolute inset-0 -z-10">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-indigo-100/60 via-violet-50/40 to-transparent rounded-full blur-3xl"></div>
          <div class="absolute top-20 right-0 w-72 h-72 bg-emerald-100/40 rounded-full blur-3xl"></div>
          <div class="absolute top-40 left-0 w-64 h-64 bg-amber-100/30 rounded-full blur-3xl"></div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <!-- Trust badge -->
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-slate-200/60 text-sm text-slate-600 mb-8 shadow-sm">
            <span class="text-emerald-500">✓</span>
            ${t("general_trust_badge")}
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            <span class="bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-600 bg-clip-text text-transparent">${t("hero_title")}</span>
          </h1>
          <p class="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-4">${t("hero_subtitle")}</p>
          <p class="text-sm text-slate-400 max-w-xl mx-auto mb-10">${t("hero_tagline")}</p>

          <!-- CTAs -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a href="#/register" class="btn-primary text-base px-8 py-3.5 shadow-lg shadow-indigo-200">
              ${t("hero_cta_register")}
            </a>
            <a href="#/login" class="btn-ghost text-base px-8 py-3.5">
              ${t("hero_cta_login")}
            </a>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div class="bg-white/60 backdrop-blur rounded-2xl p-4 border border-slate-200/40">
              <p class="text-2xl font-bold text-indigo-600">—</p>
              <p class="text-xs text-slate-500 mt-1">${t("hero_stats_jobs")}</p>
            </div>
            <div class="bg-white/60 backdrop-blur rounded-2xl p-4 border border-slate-200/40">
              <p class="text-2xl font-bold text-violet-600">—</p>
              <p class="text-xs text-slate-500 mt-1">${t("hero_stats_users")}</p>
            </div>
            <div class="bg-white/60 backdrop-blur rounded-2xl p-4 border border-slate-200/40">
              <p class="text-2xl font-bold text-emerald-600">—</p>
              <p class="text-xs text-slate-500 mt-1">${t("hero_stats_released")}</p>
            </div>
            <div class="bg-white/60 backdrop-blur rounded-2xl p-4 border border-slate-200/40">
              <p class="text-2xl font-bold text-amber-600">—</p>
              <p class="text-xs text-slate-500 mt-1">${t("hero_stats_trust")}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="py-16 sm:py-24 bg-slate-50/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-12">${t("hero_how_title")}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            ${[
              { icon: "📋", text: t("hero_how_1") },
              { icon: "📝", text: t("hero_how_2") },
              { icon: "💰", text: t("hero_how_3") },
              { icon: "🎉", text: t("hero_how_4") },
            ]
              .map(
                (step, i) => `
              <div class="relative bg-white rounded-2xl p-6 border border-slate-200/60 hover:shadow-lg hover:shadow-slate-100 transition-all text-center group">
                <div class="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center shadow-md">${i + 1}</div>
                <div class="text-4xl mb-4">${step.icon}</div>
                <p class="text-sm text-slate-600 font-medium">${step.text}</p>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="py-16 sm:py-24">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-12">${t("hero_features_title")}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            ${[
              { icon: "🔐", title: t("hero_feature_1_title"), desc: t("hero_feature_1_desc"), color: "indigo" },
              { icon: "💳", title: t("hero_feature_2_title"), desc: t("hero_feature_2_desc"), color: "emerald" },
              { icon: "🇲🇲", title: t("hero_feature_3_title"), desc: t("hero_feature_3_desc"), color: "violet" },
              { icon: "✍️", title: t("hero_feature_4_title"), desc: t("hero_feature_4_desc"), color: "amber" },
            ]
              .map(
                (f) => `
              <div class="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-200/60 hover:shadow-lg hover:shadow-slate-100 transition-all">
                <div class="w-12 h-12 rounded-xl bg-${f.color}-50 flex items-center justify-center text-2xl flex-shrink-0">${f.icon}</div>
                <div>
                  <h3 class="font-bold text-slate-800 mb-1">${f.title}</h3>
                  <p class="text-sm text-slate-500">${f.desc}</p>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="py-8 border-t border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p class="text-sm text-slate-400">${t("general_made_with")} · ${t("general_platform_name")} ${t("general_version")}</p>
        </div>
      </footer>
    </div>
  `;
}

export { renderHomePage };
