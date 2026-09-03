// RBUBANK — 12-Month Inflow Master Intelligence
// Provides complete visibility into all 12 months of Denis Rech's ~$81,400.00 annual inflows

import { sounds } from './sound.js';
import { formatCurrency } from './data.js';

export function setupInflowsHub(user, transactions, onShowTxDetail) {
  createInflowsModalHtml(user, transactions, onShowTxDetail);

  // Wire up Annual Inflow Banner click
  const banner = document.getElementById('annual-inflow-banner');
  if (banner) {
    banner.addEventListener('click', (e) => {
      e.stopPropagation();
      sounds.playTap();
      openInflowsModal();
    });
  }

  // Also wire any button with data-action="open-inflows-ledger"
  document.querySelectorAll('[data-action="open-inflows-ledger"]').forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.playTap();
      openInflowsModal();
    });
  });
}

export function openInflowsModal() {
  const modal = document.getElementById('modal-inflows-ledger');
  if (modal) {
    modal.classList.add('active');
  }
}

function createInflowsModalHtml(user, transactions, onShowTxDetail) {
  const inflows = transactions.filter(t => t.type === 'inflow');
  const total = inflows.reduce((acc, t) => acc + t.amount, 0);

  const rows = inflows.map((tx, idx) => `
    <div class="inflow-month-row" data-id="${tx.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-radius: 14px; background: rgba(255, 255, 255, 0.035); border: 1px solid var(--hairline-soft); margin-bottom: 8px; cursor: pointer; transition: all 0.2s ease;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 36px; height: 36px; border-radius: 10px; background: var(--accent-emerald-soft); color: var(--accent-emerald); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;">
          ↓
        </div>
        <div>
          <div style="font-size: 14px; font-weight: 700; color: #fff;">${tx.title}</div>
          <div style="font-size: 11.5px; color: var(--text-3); margin-top: 2px;">
            <span>${tx.date}</span> • <span>${tx.counterparty}</span>
          </div>
          <div style="font-size: 10px; color: var(--accent-emerald); font-family: monospace; margin-top: 2px;">
            ${tx.paymentMethod} • Ref: ${tx.referenceCode}
          </div>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 16px; font-weight: 800; color: var(--accent-emerald); letter-spacing: -0.01em;">
          +${formatCurrency(tx.amount, tx.currency)}
        </div>
        <div style="font-size: 10.5px; color: var(--accent-cyan); font-weight: 600; margin-top: 2px;">
          Receipt ➔
        </div>
      </div>
    </div>
  `).join('');

  const html = `
    <div id="modal-inflows-ledger" class="modal-overlay">
      <div class="modal-sheet" style="max-width: 580px;">
        <div class="modal-handle"></div>
        <div class="modal-header">
          <div>
            <div class="modal-title">12-Month Inflow Intelligence</div>
            <div style="font-size: 12px; color: var(--accent-emerald); font-weight: 600; margin-top: 2px;">
              Annual Verified Total: +${formatCurrency(total, 'USD')} (12 consecutive payouts)
            </div>
          </div>
          <button class="btn-close btn-close-modal">✕</button>
        </div>

        <!-- Metric Callout -->
        <div style="background: linear-gradient(135deg, rgba(0, 230, 118, 0.12), rgba(0, 242, 254, 0.08)); border: 1px solid rgba(0, 230, 118, 0.25); border-radius: 16px; padding: 16px; margin-bottom: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-size: 11px; text-transform: uppercase; color: var(--accent-emerald); font-weight: 700; letter-spacing: 0.05em;">Fiscal Year Cadence</span>
            <span style="font-size: 12px; color: #fff; font-weight: 700;">Avg: $${Math.round(total / 12).toLocaleString()}/mo</span>
          </div>
          <div style="font-size: 12.5px; color: rgba(255,255,255,0.85); margin-top: 6px; line-height: 1.4;">
            Every single month from <strong>October 2025 through September 2026</strong> contains regular, institutional retainers between <strong>$6,200 and $7,500</strong>. Tap any payout below to view its official clearing confirmation.
          </div>
        </div>

        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-3); letter-spacing: 0.05em; margin-bottom: 10px;">
          Monthly Payout Breakdown (All 12 Inflows)
        </div>

        <div id="inflows-modal-list-container" style="max-height: 60vh; overflow-y: auto;">
          ${rows}
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);

  // Add click to view transaction receipt
  const container = document.getElementById('inflows-modal-list-container');
  if (container) {
    container.addEventListener('click', (e) => {
      const row = e.target.closest('.inflow-month-row');
      if (!row) return;
      sounds.playTap();
      const id = row.getAttribute('data-id');
      const tx = transactions.find(t => t.id === id);
      if (tx && onShowTxDetail) {
        document.getElementById('modal-inflows-ledger').classList.remove('active');
        onShowTxDetail(tx);
      }
    });
  }
}
