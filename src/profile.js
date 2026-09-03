// RBUBANK — Profile & Security Settings Hub
// Denis Rech (Founder Metal) account details, biometrics, security controls and legal disclosures

import { sounds } from './sound.js';

export function setupProfileModal(user) {
  let modal = document.getElementById('modal-profile');
  if (!modal) {
    createProfileModalHtml(user);
    modal = document.getElementById('modal-profile');
  }

  // Profile Header click opens the modal
  const profileTrigger = document.getElementById('user-profile-btn');
  if (profileTrigger) {
    profileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      sounds.playTap();
      openProfileModal();
    });
  }

  // Wire up toggles
  const soundToggle = document.getElementById('toggle-sound-fx');
  if (soundToggle) {
    soundToggle.checked = sounds.enabled;
    soundToggle.addEventListener('change', (e) => {
      sounds.enabled = e.target.checked;
      if (window.showToast) {
        window.showToast(sounds.enabled ? "Haptic audio enabled 🔊" : "Haptic audio muted 🔇");
      }
    });
  }

  const bioToggle = document.getElementById('toggle-biometrics');
  if (bioToggle) {
    bioToggle.addEventListener('change', (e) => {
      sounds.playTap();
      if (window.showToast) {
        window.showToast(e.target.checked ? "Face ID & Biometrics Active 🛡️" : "Biometrics disabled");
      }
    });
  }

  const notifToggle = document.getElementById('toggle-push-notifs');
  if (notifToggle) {
    notifToggle.addEventListener('change', (e) => {
      sounds.playTap();
      if (window.showToast) {
        window.showToast(e.target.checked ? "Instant Push Notifications Active ⚡" : "Notifications paused");
      }
    });
  }
}

export function openProfileModal() {
  const modal = document.getElementById('modal-profile');
  if (modal) {
    modal.classList.add('active');
  }
}

function createProfileModalHtml(user) {
  const html = `
    <div id="modal-profile" class="modal-overlay">
      <div class="modal-sheet" style="max-width: 520px;">
        <div class="modal-handle"></div>
        <div class="modal-header">
          <div class="modal-title">Executive Profile & Settings</div>
          <button class="btn-close btn-close-modal">✕</button>
        </div>

        <!-- Denis Header -->
        <div style="display: flex; align-items: center; gap: 16px; padding: 12px; border-radius: 16px; background: rgba(255,255,255,0.04); border: 1px solid var(--hairline); margin-bottom: 20px;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #00f2fe, #8a2be2); color: #000; font-size: 20px; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(0,242,254,0.3);">
            DR
          </div>
          <div>
            <div style="font-size: 18px; font-weight: 800; color: #fff;">${user.name}</div>
            <div style="font-size: 12px; color: var(--accent-cyan); font-weight: 600; margin-top: 2px;">
              ${user.tier} • Tier 3 Institutional KYC
            </div>
            <div style="font-size: 11.5px; color: var(--text-3); margin-top: 1px;">
              ${user.email} • ${user.phone}
            </div>
          </div>
        </div>

        <!-- Banking Credentials -->
        <div style="margin-bottom: 20px;">
          <div style="font-size: 11px; text-transform: uppercase; color: var(--text-3); font-weight: 700; letter-spacing: 0.05em; margin-bottom: 8px;">
            Primary European IBAN
          </div>
          <div style="background: var(--surface); border: 1px solid var(--hairline); border-radius: 12px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 14px; font-family: monospace; font-weight: 700; color: #fff;">${user.iban}</div>
              <div style="font-size: 11px; color: var(--text-3); margin-top: 2px;">BIC: ${user.bic} • Deutsche Bundesbank RT1</div>
            </div>
            <button class="mode-btn" onclick="navigator.clipboard?.writeText('${user.iban}'); window.showToast('IBAN copied 📋');" style="padding: 6px 12px; font-size: 11px;">
              Copy
            </button>
          </div>
        </div>

        <!-- Settings Toggles -->
        <div style="margin-bottom: 24px; background: rgba(255,255,255,0.03); border: 1px solid var(--hairline); border-radius: 16px; padding: 4px 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--hairline-soft);">
            <div>
              <div style="font-size: 13.5px; font-weight: 600;">Biometrics & Face ID</div>
              <div style="font-size: 11.5px; color: var(--text-3);">Hardware enclave authentication</div>
            </div>
            <label class="switch-toggle">
              <input id="toggle-biometrics" type="checkbox" checked />
              <span class="slider round"></span>
            </label>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--hairline-soft);">
            <div>
              <div style="font-size: 13.5px; font-weight: 600;">Haptic Audio & Sound Effects</div>
              <div style="font-size: 11.5px; color: var(--text-3);">Procedural Web Audio feedback</div>
            </div>
            <label class="switch-toggle">
              <input id="toggle-sound-fx" type="checkbox" checked />
              <span class="slider round"></span>
            </label>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 0;">
            <div>
              <div style="font-size: 13.5px; font-weight: 600;">SEPA Push Notifications</div>
              <div style="font-size: 11.5px; color: var(--text-3);">Instant alerts on high-value inflows</div>
            </div>
            <label class="switch-toggle">
              <input id="toggle-push-notifs" type="checkbox" checked />
              <span class="slider round"></span>
            </label>
          </div>
        </div>

        <!-- Bank Legal & Mandatory Attribution -->
        <div style="background: rgba(0,0,0,0.4); border: 1px solid var(--hairline-soft); border-radius: 12px; padding: 14px; margin-bottom: 16px; font-size: 11px; color: var(--text-3); line-height: 1.5;">
          <strong style="color: #fff;">RBUBANK SE</strong> • Licensed European Credit Institution.<br/>
          Königsallee 42, 40212 Düsseldorf, Germany.<br/>
          Supervised by European Central Bank (ECB) & BaFin Reg. 10184920.<br/>
          Deposits protected up to €100,000 via German Statutory Deposit Guarantee Scheme (EdB).
          
          <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--hairline-soft); text-align: center;">
            Powered by <a href="https://t.me/Denrech" target="_blank" rel="noopener noreferrer" style="color: var(--accent-cyan); text-decoration: none; font-weight: 600;">@Denrech</a>
          </div>
        </div>

        <button class="btn-primary btn-close-modal" style="padding: 14px;">
          Close Settings
        </button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}
