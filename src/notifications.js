// RBUBANK — Notifications Hub
// Real-time notification drawer and feed for high-value banking operations

import { sounds } from './sound.js';

export const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    type: "inflow",
    icon: "↓",
    title: "SEPA Instant Inflow Credited",
    desc: "+$6,400.00 received from Venture FinTech Partners AG. Settled immediately via EBA RT1.",
    time: "Today, 14:28",
    isUnread: true
  },
  {
    id: "notif-2",
    type: "card",
    icon: "💳",
    title: "Card Purchase Authorized",
    desc: "-$1,899.00 at Apple Retail Germany (MacBook Pro M-Series).",
    time: "Aug 28, 18:42",
    isUnread: false
  },
  {
    id: "notif-3",
    type: "yield",
    icon: "✦",
    title: "4.8% APY Daily Yield Credited",
    desc: "+$1.91 added to Treasury & Tax Reserve vault.",
    time: "Aug 28, 00:01",
    isUnread: false
  },
  {
    id: "notif-4",
    type: "security",
    icon: "🛡️",
    title: "Biometric Session Verified",
    desc: "Hardware Security Enclave Face ID authentication confirmed on iPhone 16 Pro.",
    time: "Aug 24, 09:12",
    isUnread: false
  },
  {
    id: "notif-5",
    type: "inflow",
    icon: "↓",
    title: "SWIFT Wire Received",
    desc: "+$7,100.00 from Apex Systems Global Ltd. Milestone completion verified.",
    time: "Aug 15, 09:30",
    isUnread: false
  }
];

export function setupNotifications() {
  createNotificationModalHtml();

  const bellBtn = document.getElementById('notification-bell-btn');
  if (bellBtn) {
    bellBtn.addEventListener('click', () => {
      sounds.playTap();
      const dot = bellBtn.querySelector('.notification-dot');
      if (dot) dot.style.display = 'none';
      const modal = document.getElementById('modal-notifications');
      if (modal) modal.classList.add('active');
    });
  }
}

function createNotificationModalHtml() {
  const items = INITIAL_NOTIFICATIONS.map(n => `
    <div style="display: flex; gap: 14px; padding: 14px; border-radius: 14px; background: ${n.isUnread ? 'rgba(0, 242, 254, 0.05)' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${n.isUnread ? 'rgba(0, 242, 254, 0.2)' : 'var(--hairline-soft)'}; margin-bottom: 10px;">
      <div style="width: 38px; height: 38px; border-radius: 12px; background: ${n.type === 'inflow' ? 'var(--accent-emerald-soft)' : 'var(--surface)'}; color: ${n.type === 'inflow' ? 'var(--accent-emerald)' : '#fff'}; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;">
        ${n.icon}
      </div>
      <div style="flex: 1;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px;">
          <div style="font-size: 13.5px; font-weight: 700; color: #fff;">${n.title}</div>
          <div style="font-size: 10.5px; color: var(--text-3);">${n.time}</div>
        </div>
        <div style="font-size: 12px; color: var(--text-2); line-height: 1.4;">${n.desc}</div>
      </div>
    </div>
  `).join('');

  const html = `
    <div id="modal-notifications" class="modal-overlay">
      <div class="modal-sheet" style="max-width: 500px;">
        <div class="modal-handle"></div>
        <div class="modal-header">
          <div class="modal-title">Activity & Notifications</div>
          <button class="btn-close btn-close-modal">✕</button>
        </div>
        <div style="max-height: 70vh; overflow-y: auto;">
          ${items}
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}
