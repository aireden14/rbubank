// RBUBANK — High-Yield Vaults & Savings Engine
// Supports 4.8% APY vaults, real deposits, withdrawals, and custom vault creation

import { sounds } from './sound.js';
import { formatCurrency } from './data.js';

export function setupVaultsHub(user, transactions, onVaultAction) {
  createVaultModalsHtml();
  renderVaultsList(user, transactions, onVaultAction);

  // New Vault Trigger
  const newVaultBtns = document.querySelectorAll('[data-action="open-new-vault"]');
  newVaultBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.playTap();
      const modal = document.getElementById('modal-create-vault');
      if (modal) modal.classList.add('active');
    });
  });

  // Create Vault Form Submit
  const form = document.getElementById('create-vault-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('vault-name-input').value.trim();
      const target = parseFloat(document.getElementById('vault-target-input').value || '10000');
      const icon = document.getElementById('vault-icon-select').value || 'vault';

      if (!name) return;

      const newVault = {
        id: `vault-${Date.now()}`,
        title: name,
        balance: 0.00,
        target: target,
        apy: 4.8,
        currency: "USD",
        icon: icon,
        color: "var(--accent-cyan)"
      };

      user.vaults.push(newVault);
      sounds.playSuccess();

      document.getElementById('modal-create-vault').classList.remove('active');
      renderVaultsList(user, transactions, onVaultAction);

      if (window.showToast) {
        window.showToast(`New 4.8% APY Vault "${name}" created 🏦`);
      }
    });
  }
}

export function renderVaultsList(user, transactions, onVaultAction) {
  const container = document.getElementById('vaults-list-container');
  if (!container) return;

  let html = "";
  user.vaults.forEach(vault => {
    const percent = Math.min(100, Math.round((vault.balance / vault.target) * 100));
    html += `
      <div class="chart-card vault-card-item" data-id="${vault.id}" style="margin: 0 0 14px; cursor: pointer;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">${vault.icon === 'car' ? '🏎️' : vault.icon === 'mountain' ? '🏔️' : '🏦'}</span>
            <span style="font-size: 15px; font-weight: 700;">${vault.title}</span>
          </div>
          <span style="font-size: 11px; padding: 2px 8px; border-radius: 6px; background: var(--accent-emerald-soft); color: var(--accent-emerald); font-weight: 700;">${vault.apy}% APY</span>
        </div>
        <div style="font-size: 26px; font-weight: 800; color: #fff; margin-bottom: 10px;">
          ${formatCurrency(vault.balance, vault.currency)}
        </div>
        <div style="background: var(--surface); height: 6px; border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
          <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, var(--accent-cyan), var(--accent-blue)); transition: width 0.4s ease;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-3);">
          <span>Target: ${formatCurrency(vault.target, vault.currency)}</span>
          <span>${percent}% funded • Tap to Deposit</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Click card to open Vault Manage Drawer (Deposit / Withdraw)
  container.querySelectorAll('.vault-card-item').forEach(card => {
    card.addEventListener('click', () => {
      sounds.playTap();
      const id = card.getAttribute('data-id');
      const vault = user.vaults.find(v => v.id === id);
      if (vault) openVaultActionDrawer(vault, user, transactions, onVaultAction);
    });
  });
}

function openVaultActionDrawer(vault, user, transactions, onVaultAction) {
  const modal = document.getElementById('modal-vault-action');
  if (!modal) return;

  document.getElementById('vault-action-title').textContent = vault.title;
  document.getElementById('vault-action-balance').textContent = formatCurrency(vault.balance, vault.currency);
  document.getElementById('vault-action-apy').textContent = `${vault.apy}% APY (+$${((vault.balance * 0.048) / 365).toFixed(2)}/day)`;

  const depositBtn = document.getElementById('btn-vault-deposit');
  const withdrawBtn = document.getElementById('btn-vault-withdraw');
  const amountInput = document.getElementById('vault-transfer-amount');

  depositBtn.onclick = () => {
    const amt = parseFloat(amountInput.value || '0');
    if (!amt || amt <= 0) return;
    if (amt > user.balances[user.currency]) {
      if (window.showToast) window.showToast("Insufficient balance in checking account");
      return;
    }
    user.balances[user.currency] -= amt;
    vault.balance += amt;
    sounds.playSuccess();
    modal.classList.remove('active');
    amountInput.value = "";

    transactions.unshift({
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      title: `Deposit to ${vault.title}`,
      counterparty: `Vault • 4.8% APY`,
      category: "Savings",
      amount: -amt,
      currency: user.currency,
      type: "outflow",
      status: "completed",
      paymentMethod: "Internal Vault Stash",
      referenceCode: `RBU-VLT-${Math.floor(100000 + Math.random() * 900000)}`,
      icon: "vault",
      note: "High-yield compounding treasury allocation",
      clearingHouse: "RBU Treasury Ledger"
    });

    if (onVaultAction) onVaultAction();
    if (window.showToast) window.showToast(`Deposited $${amt.toLocaleString()} to ${vault.title} 🏦`);
  };

  withdrawBtn.onclick = () => {
    const amt = parseFloat(amountInput.value || '0');
    if (!amt || amt <= 0) return;
    if (amt > vault.balance) {
      if (window.showToast) window.showToast("Requested amount exceeds vault balance");
      return;
    }
    vault.balance -= amt;
    user.balances[user.currency] += amt;
    sounds.playSuccess();
    modal.classList.remove('active');
    amountInput.value = "";

    transactions.unshift({
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      title: `Withdrawal from ${vault.title}`,
      counterparty: `Checking Account`,
      category: "Income",
      amount: amt,
      currency: user.currency,
      type: "inflow",
      status: "completed",
      paymentMethod: "Instant Vault Liquidation",
      referenceCode: `RBU-VLT-${Math.floor(100000 + Math.random() * 900000)}`,
      icon: "vault",
      note: "Instant liquidity release to checking balance",
      clearingHouse: "RBU Treasury Ledger"
    });

    if (onVaultAction) onVaultAction();
    if (window.showToast) window.showToast(`Withdrew $${amt.toLocaleString()} to checking balance ⚡`);
  };

  modal.classList.add('active');
}

function createVaultModalsHtml() {
  const html = `
    <!-- Create Vault Modal -->
    <div id="modal-create-vault" class="modal-overlay">
      <div class="modal-sheet">
        <div class="modal-handle"></div>
        <div class="modal-header">
          <div class="modal-title">Create High-Yield Vault</div>
          <button class="btn-close btn-close-modal">✕</button>
        </div>
        <form id="create-vault-form">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 12px; color: var(--text-2); margin-bottom: 6px; font-weight: 600;">Vault Name / Purpose</label>
            <input id="vault-name-input" type="text" required placeholder="e.g. Dubai Villa Downpayment" style="width: 100%; padding: 14px; border-radius: 12px; background: var(--surface); border: 1px solid var(--hairline); color: #fff; font-size: 15px; outline: none;" />
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 12px; color: var(--text-2); margin-bottom: 6px; font-weight: 600;">Target Goal Amount ($)</label>
            <input id="vault-target-input" type="number" step="1000" min="500" required placeholder="50000" style="width: 100%; padding: 14px; border-radius: 12px; background: var(--surface); border: 1px solid var(--hairline); color: #fff; font-size: 16px; outline: none;" />
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 12px; color: var(--text-2); margin-bottom: 6px; font-weight: 600;">Category Icon</label>
            <select id="vault-icon-select" style="width: 100%; padding: 14px; border-radius: 12px; background: var(--surface); border: 1px solid var(--hairline); color: #fff; font-size: 14px;">
              <option value="vault">🏦 Treasury / Savings</option>
              <option value="car">🏎️ Supercar / Automotive</option>
              <option value="mountain">🏔️ Luxury Travel / Chalet</option>
            </select>
          </div>
          <div style="background: rgba(0, 230, 118, 0.08); border: 1px solid rgba(0, 230, 118, 0.2); border-radius: 12px; padding: 12px; margin-bottom: 20px; font-size: 12px; color: var(--accent-emerald);">
            ✦ Earns 4.8% APY daily compounded interest with instant zero-penalty withdrawal.
          </div>
          <button type="submit" class="btn-primary">
            Create 4.8% APY Vault
          </button>
        </form>
      </div>
    </div>

    <!-- Vault Manage Action Modal (Deposit / Withdraw) -->
    <div id="modal-vault-action" class="modal-overlay">
      <div class="modal-sheet">
        <div class="modal-handle"></div>
        <div class="modal-header">
          <div id="vault-action-title" class="modal-title">Treasury Vault</div>
          <button class="btn-close btn-close-modal">✕</button>
        </div>
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 11px; color: var(--text-3); text-transform: uppercase;">Vault Stash Balance</div>
          <div id="vault-action-balance" style="font-size: 36px; font-weight: 900; color: #fff; margin: 4px 0;">$14,500.00</div>
          <div id="vault-action-apy" style="font-size: 12px; color: var(--accent-emerald); font-weight: 600;">4.8% APY (+$1.91/day)</div>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 12px; color: var(--text-2); margin-bottom: 6px; font-weight: 600;">Amount ($)</label>
          <input id="vault-transfer-amount" type="number" step="100" min="10" placeholder="1000" style="width: 100%; padding: 14px; border-radius: 12px; background: var(--surface); border: 1px solid var(--hairline); color: #fff; font-size: 20px; font-weight: 700; outline: none;" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <button id="btn-vault-deposit" class="btn-primary" style="padding: 14px;">
            Deposit 📥
          </button>
          <button id="btn-vault-withdraw" class="btn-primary" style="background: var(--surface-strong); color: #fff; border: 1px solid var(--hairline); padding: 14px;">
            Withdraw ⚡
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}
