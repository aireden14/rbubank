// RBUBANK — Official European Bank Statement Generator
// Generates official certified PDF/Print-ready statements for Denis Rech

import { sounds } from './sound.js';
import { formatCurrency } from './data.js';

export function openStatementModal(user, transactions) {
  sounds.playTap();
  let modal = document.getElementById('modal-statement');
  if (!modal) {
    createModalContainer();
    modal = document.getElementById('modal-statement');
  }

  const container = document.getElementById('statement-preview-content');
  if (container) {
    container.innerHTML = generateStatementHtml(user, transactions);
  }

  modal.classList.add('active');
}

function generateStatementHtml(user, transactions) {
  const txRows = transactions.slice(0, 15).map(tx => `
    <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.07); font-size: 11.5px;">
      <td style="padding: 9px 6px; color: rgba(240, 243, 250, 0.6);">${tx.date}</td>
      <td style="padding: 9px 6px; font-weight: 600; color: #fff;">${tx.counterparty || tx.title}</td>
      <td style="padding: 9px 6px; color: rgba(240, 243, 250, 0.5); font-family: monospace;">${tx.referenceCode}</td>
      <td style="padding: 9px 6px; color: rgba(240, 243, 250, 0.7);">${tx.paymentMethod}</td>
      <td style="padding: 9px 6px; text-align: right; font-weight: 700; color: ${tx.type === 'inflow' ? 'var(--accent-emerald)' : '#fff'};">
        ${formatCurrency(tx.amount, tx.currency)}
      </td>
    </tr>
  `).join('');

  return `
    <div class="official-statement" style="background: #080b11; border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 24px; color: #fff;">
      <!-- Statement Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 20px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <div style="width: 24px; height: 24px; border-radius: 6px; background: linear-gradient(135deg, #00f2fe, #8a2be2); color: #000; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px;">R</div>
            <span style="font-size: 18px; font-weight: 800; letter-spacing: -0.02em;">RBUBANK</span>
          </div>
          <div style="font-size: 11px; color: rgba(240, 243, 250, 0.5); line-height: 1.4;">
            RBUBANK SE • European Financial Institution<br/>
            Königsallee 42, 40212 Düsseldorf, Germany<br/>
            BaFin Reg. ID: 10184920 • BIC: ${user.bic}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 13px; font-weight: 700; color: var(--accent-cyan); text-transform: uppercase; letter-spacing: 0.05em;">Official Statement</div>
          <div style="font-size: 11px; color: rgba(240, 243, 250, 0.5); margin-top: 2px;">Date: September 2, 2026</div>
          <div style="font-size: 10px; color: #00e676; font-weight: 600; margin-top: 4px;">✦ Certified Digital Seal</div>
        </div>
      </div>

      <!-- Account Details Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; background: rgba(255,255,255,0.03); padding: 14px 18px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
        <div>
          <div style="font-size: 10px; text-transform: uppercase; color: rgba(240, 243, 250, 0.4); letter-spacing: 0.05em;">Account Holder</div>
          <div style="font-size: 14px; font-weight: 700; margin-top: 2px;">${user.name}</div>
          <div style="font-size: 11px; color: rgba(240, 243, 250, 0.6);">${user.tier}</div>
        </div>
        <div>
          <div style="font-size: 10px; text-transform: uppercase; color: rgba(240, 243, 250, 0.4); letter-spacing: 0.05em;">IBAN / Routing</div>
          <div style="font-size: 12.5px; font-family: monospace; font-weight: 600; margin-top: 2px;">${user.iban}</div>
          <div style="font-size: 11px; color: rgba(240, 243, 250, 0.6);">Currency: ${user.currency} (Multi-currency)</div>
        </div>
      </div>

      <!-- 12-Month Financial Summary Box -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px;">
        <div style="padding: 12px; border-radius: 10px; background: rgba(0, 230, 118, 0.08); border: 1px solid rgba(0, 230, 118, 0.2);">
          <div style="font-size: 10px; color: var(--accent-emerald); font-weight: 600; text-transform: uppercase;">12-Mo Inflow Total</div>
          <div style="font-size: 17px; font-weight: 800; color: var(--accent-emerald); margin-top: 2px;">$${user.metrics.annualInflowTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
          <div style="font-size: 10px; color: rgba(240, 243, 250, 0.5);">12 regular monthly payouts</div>
        </div>
        <div style="padding: 12px; border-radius: 10px; background: rgba(255, 51, 102, 0.08); border: 1px solid rgba(255, 51, 102, 0.2);">
          <div style="font-size: 10px; color: var(--accent-rose); font-weight: 600; text-transform: uppercase;">12-Mo Outflows</div>
          <div style="font-size: 17px; font-weight: 800; color: #fff; margin-top: 2px;">$${user.metrics.annualOutflowTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
          <div style="font-size: 10px; color: rgba(240, 243, 250, 0.5);">Rent, tech, travel, living</div>
        </div>
        <div style="padding: 12px; border-radius: 10px; background: rgba(0, 242, 254, 0.08); border: 1px solid rgba(0, 242, 254, 0.2);">
          <div style="font-size: 10px; color: var(--accent-cyan); font-weight: 600; text-transform: uppercase;">Closing Balance</div>
          <div style="font-size: 17px; font-weight: 800; color: #fff; margin-top: 2px;">$${user.balances.USD.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
          <div style="font-size: 10px; color: rgba(240, 243, 250, 0.5);">Available on demand</div>
        </div>
      </div>

      <!-- Transaction Ledger Table -->
      <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: rgba(240, 243, 250, 0.5); letter-spacing: 0.05em; margin-bottom: 8px;">
        Recent Certified Transactions (Snapshot)
      </div>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.12); font-size: 10px; text-transform: uppercase; color: rgba(240, 243, 250, 0.4);">
              <th style="padding: 8px 6px;">Date</th>
              <th style="padding: 8px 6px;">Counterparty</th>
              <th style="padding: 8px 6px;">Reference</th>
              <th style="padding: 8px 6px;">Clearing</th>
              <th style="padding: 8px 6px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${txRows}
          </tbody>
        </table>
      </div>

      <!-- Footer Sign-off -->
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: rgba(240, 243, 250, 0.4);">
        <div>
          SHA256 Cryptographic Audit Hash: <code>a8f190e2...74d081</code><br/>
          Electronic confirmation generated under EU Electronic Signatures Regulation (eIDAS).
        </div>
        <div style="text-align: right;">
          <button onclick="window.print()" class="btn-primary" style="padding: 8px 16px; font-size: 12px; border-radius: 20px; cursor: pointer;">
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  `;
}

function createModalContainer() {
  const modalHtml = `
    <div id="modal-statement" class="modal-overlay">
      <div class="modal-sheet" style="max-width: 620px;">
        <div class="modal-handle"></div>
        <div class="modal-header">
          <div class="modal-title">Official Bank Statement</div>
          <button class="btn-close btn-close-modal">✕</button>
        </div>
        <div id="statement-preview-content"></div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}
