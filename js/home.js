// ============================================================
// home.js — Premium Landing Page (Brutalist Ledger direction)
// Editorial Dossier concept: trust through typography & rules
// ============================================================

import { t } from "./languages.js";

function renderHomePage() {
  return `
    <!-- ===== HERO: Editorial Dossier ===== -->
    <section class="bl-hero">
      <div class="bl-hero__inner">
        <!-- Letterhead row -->
        <div class="bl-hero__letterhead rise">
          <span class="smallcaps">Digital Escrow Platform</span>
          <span class="mono" style="color:var(--accent)">·</span>
          <span class="smallcaps">Est. 2026</span>
          <span class="mono" style="color:var(--accent)">·</span>
          <span class="smallcaps">Yangon, Myanmar</span>
        </div>

        <hr class="rule rule--ink rise">

        <!-- Headline with mask reveal -->
        <h1 class="h-display bl-hero__headline rise" data-bl-reveal data-bl-center>
          Secure payments for Myanmar's talent.
        </h1>

        <!-- Lede -->
        <p class="lede bl-hero__lede rise" style="max-width:56ch;margin:1.25rem auto 0;text-align:center">
          Freelancers get paid. Clients get work done. Every transaction backed by a manual escrow system built for Myanmar's banking reality — KBZ Pay, Wave Pay, USDT, and more.
        </p>

        <!-- CTAs -->
        <div class="bl-hero__cta rise">
          <a class="btn btn--primary" href="#/register">Start free — register now</a>
          <a class="btn" href="#/jobs">Browse open jobs</a>
        </div>

        <!-- Accent rule — the signature draw -->
        <hr class="rule rule--accent rise" data-bl-rule style="max-width:8rem;margin:clamp(2rem,5vh,3rem) auto 0">

        <!-- Stats strip -->
        <div class="bl-hero__stats rise">
          <div class="bl-hero__stat">
            <span class="bl-hero__stat-value mono">[—]</span>
            <span class="bl-hero__stat-label smallcaps">Jobs posted</span>
          </div>
          <div class="bl-hero__stat">
            <span class="bl-hero__stat-value mono">[—]</span>
            <span class="bl-hero__stat-label smallcaps">Freelancers</span>
          </div>
          <div class="bl-hero__stat">
            <span class="bl-hero__stat-value mono">[—]</span>
            <span class="bl-hero__stat-label smallcaps">Funds released</span>
          </div>
        </div>
      </div>

      <!-- Hero reveal scripts -->
      <style>
        [data-bl-reveal].bl-revealing .bl-w{display:inline-block;overflow:hidden;vertical-align:top}
        [data-bl-reveal].bl-revealing .bl-w>span{display:inline-block;transform:translateY(110%);animation:bl-lineup .9s cubic-bezier(.22,1,.36,1) both;animation-delay:calc(var(--bl-i,0)*70ms)}
        @keyframes bl-lineup{to{transform:none}}
        [data-bl-rule].bl-drawing{transform:scaleX(0);transform-origin:left;animation:bl-ruledraw 1s cubic-bezier(.16,1,.3,1) .45s both}
        @keyframes bl-ruledraw{to{transform:scaleX(1)}}
        @media(prefers-reduced-motion:reduce){
          [data-bl-reveal].bl-revealing .bl-w>span{transform:none;animation:none}
          [data-bl-rule].bl-drawing{transform:none;animation:none}
        }
      </style>
      <script>
      (function(){
        try{
          var sec=document.currentScript&&document.currentScript.closest('section');
          if(!sec)return;
          if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
          var h1=sec.querySelector('[data-bl-reveal]');
          if(h1&&!h1.dataset.blDone){
            h1.dataset.blDone='1';
            var text=h1.textContent;h1.setAttribute('aria-label',text);h1.textContent='';
            var words=text.split(/(\s+)/);var wi=0;
            for(var k=0;k<words.length;k++){
              var tok=words[k];if(tok==='')continue;
              if(/^\s+$/.test(tok)){h1.appendChild(document.createTextNode(' '));continue;}
              var outer=document.createElement('span');outer.className='bl-w';outer.setAttribute('aria-hidden','true');
              var inner=document.createElement('span');inner.textContent=tok;inner.style.setProperty('--bl-i',String(wi));
              outer.appendChild(inner);h1.appendChild(outer);wi++;
            }
            h1.classList.add('bl-revealing');
          }
          var rule=sec.querySelector('[data-bl-rule]');
          if(rule&&!rule.dataset.blDone){rule.dataset.blDone='1';rule.classList.add('bl-drawing');}
        }catch(e){}
      })();
      </script>
    </section>


    <!-- ===== VELOCITY RAIL: Proof at a glance ===== -->
    <div class="sp-vrail" data-standout-piece="velocity-rail" style="--sp-accent:#11666a" data-speed="42">
      <div class="sp-vrail-track">
        <div class="sp-vrail-row">
          <span class="sp-vrail-item">KBZ Pay</span><span class="sp-vrail-dot" aria-hidden="true"></span>
          <span class="sp-vrail-item">Wave Money</span><span class="sp-vrail-dot" aria-hidden="true"></span>
          <span class="sp-vrail-item">USDT TRC-20</span><span class="sp-vrail-dot" aria-hidden="true"></span>
          <span class="sp-vrail-item">Binance Pay</span><span class="sp-vrail-dot" aria-hidden="true"></span>
          <span class="sp-vrail-item">AYA Pay</span><span class="sp-vrail-dot" aria-hidden="true"></span>
          <span class="sp-vrail-item">Yoma Bank</span><span class="sp-vrail-dot" aria-hidden="true"></span>
        </div>
      </div>
    </div>


    <!-- ===== SECTION 01: The Problem ===== -->
    <section id="problem" style="padding:clamp(2.5rem,6vw,4.5rem) clamp(1.5rem,5vw,4rem)">
      <div class="lrow rise" style="border-block-start:2px solid var(--accent)">
        <div>
          <span class="idx idx--mark">No. 01</span>
          <h2 class="h-section" style="margin-top:.4rem">Why this platform exists.</h2>
        </div>
        <div>
          <p class="lede">Myanmar freelancers lose income to scams. Clients pay for work that never arrives. Western platforms ban Myanmar IPs. Local banks can't move money across borders easily. The escrow void is real — and it costs both sides.</p>
        </div>
      </div>

      <!-- Pain points as ruled rows -->
      <div class="rise" style="margin-top:1.5rem">
        <div style="display:flex;justify-content:space-between;gap:1rem;padding:.65rem 0;border-bottom:1px solid var(--rule)">
          <span class="lede">Freelancers ghosted after deposit</span>
          <span class="mono" style="color:var(--accent)">No protection</span>
        </div>
        <div style="display:flex;justify-content:space-between;gap:1rem;padding:.65rem 0;border-bottom:1px solid var(--rule)">
          <span class="lede">Global platform bans on Myanmar IPs</span>
          <span class="mono" style="color:var(--accent)">No access</span>
        </div>
        <div style="display:flex;justify-content:space-between;gap:1rem;padding:.65rem 0;border-bottom:1px solid var(--rule)">
          <span class="lede">Cross-border payment friction</span>
          <span class="mono" style="color:var(--accent)">No local rails</span>
        </div>
        <div style="display:flex;justify-content:space-between;gap:1rem;padding:.65rem 0;border-bottom:1px solid var(--rule)">
          <span class="lede">English-only platforms alienate local talent</span>
          <span class="mono" style="color:var(--accent)">No language</span>
        </div>
      </div>
    </section>


    <!-- ===== SECTION 02: How It Works ===== -->
    <section id="how" style="padding:clamp(2.5rem,6vw,4.5rem) clamp(1.5rem,5vw,4rem)">
      <div class="rise" style="display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:1rem">
        <p class="smallcaps label-rail">How it works</p>
        <span class="mono" style="color:color-mix(in srgb,var(--ink) 65%,transparent)">Four steps · zero hidden fees</span>
      </div>
      <hr class="rule rule--ink rise" style="margin-top:1.25rem">

      <div class="rise" style="display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--rule);border:1px solid var(--rule);border-top:0;margin-top:0" id="bl-how-grid">
        <div style="background:var(--bone);padding:clamp(1.5rem,3vw,2.5rem)">
          <span class="idx idx--mark">No. 01</span>
          <h3 class="h-section" style="margin-top:.4rem">Post or apply</h3>
          <p class="lede" style="margin-top:.6rem">Hiring managers post jobs with budgets and milestones. Freelancers submit proposals with their bid. No middleman markup.</p>
        </div>
        <div style="background:var(--bone);padding:clamp(1.5rem,3vw,2.5rem)">
          <span class="idx idx--mark">No. 02</span>
          <h3 class="h-section" style="margin-top:.4rem">Sign the contract</h3>
          <p class="lede" style="margin-top:.6rem">Both parties type their name as a digital signature. Timestamps recorded. Contract locked. No going back without Admin review.</p>
        </div>
        <div style="background:var(--bone);padding:clamp(1.5rem,3vw,2.5rem)">
          <span class="idx idx--mark">No. 03</span>
          <h3 class="h-section" style="margin-top:.4rem">Fund escrow</h3>
          <p class="lede" style="margin-top:.6rem">Client sends payment via KBZ Pay, Wave Pay, bank transfer, or USDT. Upload transaction proof. Admin verifies and locks funds.</p>
        </div>
        <div style="background:var(--bone);padding:clamp(1.5rem,3vw,2.5rem)">
          <span class="idx idx--mark">No. 04</span>
          <h3 class="h-section" style="margin-top:.4rem">Work, then release</h3>
          <p class="lede" style="margin-top:.6rem">Freelancer delivers milestones. Client approves. Admin releases funds minus platform fee. Both sides protected, every time.</p>
        </div>
      </div>
      <style>@media(max-width:720px){#bl-how-grid{grid-template-columns:minmax(0,1fr)!important}}</style>
    </section>


    <!-- ===== SECTION 03: Escrow — Plainly ===== -->
    <section id="escrow" style="padding:clamp(2.5rem,6vw,4.5rem) clamp(1.5rem,5vw,4rem)">
      <div class="lrow rise" style="border-block-start:2px solid var(--accent)">
        <div>
          <span class="idx idx--mark">Fees</span>
          <h2 class="h-section" style="margin-top:.4rem">Quoted before we begin.</h2>
        </div>
        <div>
          <p class="lede">No subscription. No monthly fee. We only earn when you do — a small cut from completed transactions. That's the whole model.</p>
          <div style="margin-top:1.5rem">
            <div style="display:flex;justify-content:space-between;gap:1rem;padding:.65rem 0;border-bottom:1px solid var(--rule)">
              <span>Platform fee from Hiring Manager</span>
              <span class="num">1% of budget</span>
            </div>
            <div style="display:flex;justify-content:space-between;gap:1rem;padding:.65rem 0;border-bottom:1px solid var(--rule)">
              <span>Platform fee from Freelancer</span>
              <span class="num">2% of earnings</span>
            </div>
            <div style="display:flex;justify-content:space-between;gap:1rem;padding:.65rem 0;border-bottom:1px solid var(--rule)">
              <span>Registration</span>
              <span class="num">Free</span>
            </div>
            <div style="display:flex;justify-content:space-between;gap:1rem;padding:.65rem 0;border-bottom:1px solid var(--rule)">
              <span>Dispute resolution</span>
              <span class="num">Included</span>
            </div>
          </div>
        </div>
      </div>
    </section>


    <!-- ===== SECTION 04: Payment Methods — Proof ===== -->
    <section id="payments" style="padding:clamp(2.5rem,6vw,4.5rem) clamp(1.5rem,5vw,4rem)">
      <div class="rise" style="display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:1rem">
        <p class="smallcaps label-rail">Supported payment methods</p>
        <span class="mono" style="color:color-mix(in srgb,var(--ink) 65%,transparent)">12 gateways · local + digital</span>
      </div>
      <hr class="rule rule--ink rise" style="margin-top:1.25rem">

      <!-- Payment groups as ruled rows -->
      <div class="rise" style="margin-top:1.5rem">
        <div style="display:flex;justify-content:space-between;gap:1rem;padding:.65rem 0;border-bottom:1px solid var(--rule)">
          <span class="smallcaps" style="min-width:120px">Mobile Wallets</span>
          <span class="lede">KBZ Pay · Wave Pay · AYA Pay · CB Pay · UAB Pay</span>
        </div>
        <div style="display:flex;justify-content:space-between;gap:1rem;padding:.65rem 0;border-bottom:1px solid var(--rule)">
          <span class="smallcaps" style="min-width:120px">Banks</span>
          <span class="lede">Yoma Bank · AYA Bank · KBZ Bank · CB Bank</span>
        </div>
        <div style="display:flex;justify-content:space-between;gap:1rem;padding:.65rem 0;border-bottom:1px solid var(--rule)">
          <span class="smallcaps" style="min-width:120px">Digital</span>
          <span class="lede">USDT (TRC-20) · Binance Pay · DJO Pay</span>
        </div>
      </div>

      <!-- Manual verification note -->
      <div class="porcelain-panel rise" style="margin-top:2rem">
        <p class="porcelain-panel__label">How verification works</p>
        <h3 style="font-family:var(--display);font-weight:400;font-size:clamp(1.4rem,2.5vw,1.8rem);line-height:1.2">Manual escrow, human-verified.</h3>
        <p style="margin-top:.75rem;max-width:58ch;font-size:1rem;line-height:1.75;color:color-mix(in srgb,var(--ink) 78%,transparent)">
          After payment, you upload a transaction ID or screenshot. Our Admin team reviews and locks the funds into escrow. No smart contracts, no code — just a person verifying your payment before work begins.
        </p>
      </div>
    </section>


    <!-- ===== SECTION 05: Trust & Dispute ===== -->
    <section id="trust" style="padding:clamp(2.5rem,6vw,4.5rem) clamp(1.5rem,5vw,4rem)">
      <div class="lrow rise" style="border-block-start:2px solid var(--accent)">
        <div>
          <span class="idx idx--mark">No. 02</span>
          <h2 class="h-section" style="margin-top:.4rem">When things go wrong.</h2>
        </div>
        <div>
          <p class="lede">Disputes happen. Our Admin has final authority — not a algorithm, not a vote. A human reviews the evidence and decides. The platform's verdict is binding.</p>

          <!-- Verdict options as ruled rows -->
          <div style="margin-top:1.5rem">
            <div style="display:flex;justify-content:space-between;gap:1rem;padding:.65rem 0;border-bottom:1px solid var(--rule)">
              <span>Freelancer failed to deliver</span>
              <span class="mono" style="color:var(--accent)">Job reset to Open — free</span>
            </div>
            <div style="display:flex;justify-content:space-between;gap:1rem;padding:.65rem 0;border-bottom:1px solid var(--rule)">
              <span>Both parties at fault</span>
              <span class="mono" style="color:var(--accent)">50/50 split</span>
            </div>
            <div style="display:flex;justify-content:space-between;gap:1rem;padding:.65rem 0;border-bottom:1px solid var(--rule)">
              <span>Work verified complete</span>
              <span class="mono" style="color:var(--accent)">100% release to Freelancer</span>
            </div>
            <div style="display:flex;justify-content:space-between;gap:1rem;padding:.65rem 0;border-bottom:1px solid var(--rule)">
              <span>Client needs full refund</span>
              <span class="mono" style="color:var(--accent)">100% refund</span>
            </div>
          </div>
        </div>
      </div>
    </section>


    <!-- ===== SECTION 06: Roles — The Commitment ===== -->
    <section id="roles" style="padding:clamp(2.5rem,6vw,4.5rem) clamp(1.5rem,5vw,4rem)">
      <div class="rise" style="display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:1rem">
        <p class="smallcaps label-rail">Your role is permanent</p>
        <span class="mono" style="color:color-mix(in srgb,var(--ink) 65%,transparent)">One choice · no changes</span>
      </div>
      <hr class="rule rule--ink rise" style="margin-top:1.25rem">

      <div class="rise" style="display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--rule);border:1px solid var(--rule);border-top:0;margin-top:0" id="bl-roles-grid">
        <div style="background:var(--bone);padding:clamp(2rem,4vw,3rem)">
          <span class="idx idx--mark">Freelancer</span>
          <h3 class="h-section" style="margin-top:.4rem">Will Provide Service</h3>
          <p class="lede" style="margin-top:.6rem">List your skills. Submit proposals. Get hired. Earn money through milestone-based escrow. Your 2% fee is deducted on release.</p>
          <div style="margin-top:1rem;font-family:var(--mono);font-size:.75rem;letter-spacing:.06em;color:color-mix(in srgb,var(--ink) 55%,transparent)">
            Beginner · Entry · Mid · Advanced · Pro
          </div>
        </div>
        <div style="background:var(--bone);padding:clamp(2rem,4vw,3rem)">
          <span class="idx idx--mark">Hiring Manager</span>
          <h3 class="h-section" style="margin-top:.4rem">Get Services</h3>
          <p class="lede" style="margin-top:.6rem">Post jobs with budgets. Review proposals. Hire talent. Fund escrow. Approve milestones. Your 1% fee is deducted on posting.</p>
          <div style="margin-top:1rem;font-family:var(--mono);font-size:.75rem;letter-spacing:.06em;color:color-mix(in srgb,var(--ink) 55%,transparent)">
            Unlimited posts · Milestone splits · Contract engine
          </div>
        </div>
      </div>
      <style>@media(max-width:720px){#bl-roles-grid{grid-template-columns:minmax(0,1fr)!important}}</style>
    </section>


    <!-- ===== CTA SECTION ===== -->
    <section id="cta" style="padding:clamp(3rem,8vw,5rem) clamp(1.5rem,5vw,4rem)">
      <div class="rise" style="text-align:center;max-width:48rem;margin:0 auto">
        <h2 class="h-display" style="font-size:clamp(2rem,5vw,3.5rem);margin-bottom:1rem">Start earning. Start hiring.</h2>
        <p class="lede" style="margin:0 auto 2rem;text-align:center;max-width:48ch">
          Registration is free. No credit card. No subscription. Your role is locked the moment you sign up.
        </p>
        <div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center">
          <a class="btn btn--primary" href="#/register">Create your account</a>
          <a class="btn" href="#/jobs">See open jobs</a>
        </div>
      </div>
    </section>


    <!-- ===== FOOTER: Colophon ===== -->
    <footer class="bl-footer" style="border-top:4px solid var(--ink);padding:clamp(2.5rem,5vw,3.5rem) clamp(1.5rem,5vw,4rem) 2.5rem;background:var(--wash)">
      <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:2rem 4rem;align-items:end" id="bl-foot-top">
        <p class="h-section" style="max-width:18ch">When trust is the product.</p>
        <p class="mono label-rail" style="color:color-mix(in srgb,var(--ink) 65%,transparent)">Index of the platform</p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:2rem;margin-top:clamp(1.75rem,4vw,2.5rem);padding-top:1.75rem;border-top:1px solid var(--ink)">
        <div>
          <p class="smallcaps">Platform</p>
          <p style="font-size:.875rem;margin-top:.5rem">
            <a class="llink" href="#/">Home</a><br>
            <a class="llink" href="#/jobs">Browse jobs</a><br>
            <a class="llink" href="#/register">Register</a><br>
            <a class="llink" href="#/login">Login</a>
          </p>
        </div>
        <div>
          <p class="smallcaps">For Freelancers</p>
          <p style="font-size:.875rem;margin-top:.5rem">
            Create profile<br>
            Submit proposals<br>
            Sign contracts<br>
            Track milestones
          </p>
        </div>
        <div>
          <p class="smallcaps">For Clients</p>
          <p style="font-size:.875rem;margin-top:.5rem">
            Post a job<br>
            Review proposals<br>
            Fund escrow<br>
            Approve work
          </p>
        </div>
        <div>
          <p class="smallcaps">Legal</p>
          <p style="font-size:.875rem;margin-top:.5rem">
            <a class="llink" href="#">Terms of service</a><br>
            <a class="llink" href="#">Escrow policy</a><br>
            <a class="llink" href="#">Dispute resolution</a><br>
            <a class="llink" href="#">Privacy policy</a>
          </p>
        </div>
      </div>

      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.75rem 2rem;margin-top:2rem;padding-top:1.25rem;border-top:1px solid var(--rule)">
        <p class="mono" style="color:color-mix(in srgb,var(--ink) 65%,transparent)">MM Escrow — Myanmar Freelance Escrow Platform · Est. 2026</p>
        <span class="mono" style="border:1px solid var(--accent);color:var(--accent);padding:.3rem .65rem;letter-spacing:.1em">DOC. No. 001</span>
      </div>
      <style>@media(max-width:720px){#bl-foot-top{grid-template-columns:minmax(0,1fr)!important}}</style>
    </footer>
  `;
}

export { renderHomePage };
