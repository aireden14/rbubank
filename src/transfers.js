// RBUBANK — Transfers, Instant Top-Up & Live FX Exchange Hub
// Real SEPA settlement, Apple Pay instant deposits, currency swaps, and contact directory

import { sounds } from './sound.js';
import { formatCurrency } from './data.js';

export function setupTransfers(user, transactions, onNewTransaction) {
  // Open modal triggers
  document.querySelectorAll('[data-action="open-send"]').forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.playTap();
      openModal('modal-send');
    });
  });

  document.querySelectorAll('[data-action="open-exchange"]').forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.playTap();
      openModal('modal-exchange');
    });
  });

  document.querySelectorAll('[data-action="open-receive"]').forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.playTap();
      openModal('modal-receive');
    });
  });

  // Modal close handlers
  document.querySelectorAll('.btn-close-modal, .modal-overlay').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === el) {
        sounds.playTap();
        closeAllModals();
      }
    });
  });

  // Recipient selection within Send Modal
  const recipientPills = document.querySelectorAll('.send-recipient-pill');
  recipientPills.forEach(pill => {
    pill.addEventListener('click', () => {
      sounds.playTap();
      recipientPills.forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      const name = pill.getAttribute('data-name');
      const input = document.getElementById('send-recipient-input');
      if (input) input.value = name;
    });
  });

  // Quick Amount Buttons in Send Modal
  document.querySelectorAll('.quick-amount-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.playTap();
      const add = parseFloat(btn.getAttribute('data-amount') || '0');
      const input = document.getElementById('send-amount-input');
      if (input) {
        const current = parseFloat(input.value || '0');
        input.value = (current + add).toFixed(2);
      }
    });
  });

  // Handle Send Form Submission
  const sendForm = document.getElementById('send-money-form');
  if (sendForm) {
    sendForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const recipientInput = document.getElementById('send-recipient-input');
      const amountInput = document.getElementById('send-amount-input');
      const noteInput = document.getElementById('send-note-input');
      const submitBtn = document.getElementById('btn-confirm-send');

      const recipient = recipientInput ? recipientInput.value.trim() : "Elena V.";
      const amount = parseFloat(amountInput ? amountInput.value : "0");
      const note = noteInput ? noteInput.value.trim() : "General payment";

      if (!amount || amount <= 0) {
        if (window.showToast) window.showToast("Please enter a valid transfer amount");
        return;
      }

      if (amount > user.balances[user.currency]) {
        if (window.showToast) window.showToast("Insufficient balance for this transfer");
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Routing via SEPA Instant...</span>`;
      }

      setTimeout(() => {
        user.balances[user.currency] -= amount;

        const now = new Date();
        const newTx = {
          id: `tx-${Date.now()}`,
          date: now.toISOString().split('T')[0],
          time: now.toTimeString().slice(0, 5),
          title: `Transfer to ${recipient}`,
          counterparty: recipient,
          category: "Transfers",
          amount: -amount,
          currency: user.currency,
          type: "outflow",
          status: "completed",
          paymentMethod: "SEPA Instant",
          referenceCode: `RBU-SEPA-${Math.floor(100000 + Math.random() * 900000)}`,
          icon: "send",
          note: note || "Instant transfer via RBU Super-App",
          clearingHouse: "EBA CLEARING / RT1 Instant"
        };

        transactions.unshift(newTx);
        sounds.playSuccess();

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Send Transfer ⚡</span>`;
        }

        closeAllModals();
        if (amountInput) amountInput.value = "";
        if (noteInput) noteInput.value = "";

        if (onNewTransaction) onNewTransaction(newTx);
        if (window.showToast) {
          window.showToast(`Sent $${amount.toLocaleString()} to ${recipient} (SEPA Instant ⚡)`);
        }
      }, 600);
    });
  }

  // Handle Instant Apple Pay / Card Top-Up
  const topUpForm = document.getElementById('topup-funds-form');
  if (topUpForm) {
    topUpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const amountInput = document.getElementById('topup-amount-input');
      const amount = parseFloat(amountInput ? amountInput.value : "1000");

      if (!amount || amount <= 0) return;

      user.balances[user.currency] += amount;

      const now = new Date();
      const newTx = {
        id: `tx-${Date.now()}`,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5),
        title: "Apple Pay Instant Top-Up",
        counterparty: "Apple Pay • Card linked",
        category: "Income",
        amount: amount,
        currency: user.currency,
        type: "inflow",
        status: "completed",
        paymentMethod: "Apple Pay",
        referenceCode: `RBU-APPL-${Math.floor(100000 + Math.random() * 900000)}`,
        icon: "arrow-down-left",
        note: "Instant account deposit",
        clearingHouse: "Mastercard Direct Settlement"
      };

      transactions.unshift(newTx);
      sounds.playSuccess();
      closeAllModals();

      if (amountInput) amountInput.value = "";
      if (onNewTransaction) onNewTransaction(newTx);
      if (window.showToast) {
        window.showToast(`Deposited $${amount.toLocaleString()} via Apple Pay `);
      }
    });
  }

  // Quick Top-Up pills
  document.querySelectorAll('.quick-topup-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.playTap();
      const amt = btn.getAttribute('data-amount');
      const input = document.getElementById('topup-amount-input');
      if (input) input.value = amt;
    });
  });

  // Setup Currency Exchange Calculator
  setupExchangeCalculator(user, transactions, onNewTransaction);
}

function setupExchangeCalculator(user, transactions, onNewTransaction) {
  const fromInput = document.getElementById('fx-from-amount');
  const toInput = document.getElementById('fx-to-amount');
  const fromSelect = document.getElementById('fx-from-currency');
  const toSelect = document.getElementById('fx-to-currency');
  const swapBtn = document.getElementById('btn-swap-fx');
  const confirmBtn = document.getElementById('btn-confirm-exchange');

  const rates = {
    USD: 1.0,
    EUR: 0.9174,
    GBP: 0.7852,
    CHF: 0.8870
  };

  const calculate = () => {
    if (!fromInput || !toInput || !fromSelect || !toSelect) return;
    const fromVal = parseFloat(fromInput.value || "0");
    const cFrom = fromSelect.value;
    const cTo = toSelect.value;

    const valInUSD = fromVal / rates[cFrom];
    const targetVal = valInUSD * rates[cTo];
    toInput.value = targetVal.toFixed(2);
  };

  if (fromInput) fromInput.addEventListener('input', calculate);
  if (fromSelect) fromSelect.addEventListener('change', calculate);
  if (toSelect) toSelect.addEventListener('change', calculate);

  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      sounds.playTap();
      const temp = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = temp;
      calculate();
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const fromVal = parseFloat(fromInput.value || "0");
      const cFrom = fromSelect.value;
      const cTo = toSelect.value;

      if (!fromVal || fromVal <= 0) return;
      if (fromVal > (user.balances[cFrom] || 0)) {
        if (window.showToast) window.showToast(`Insufficient ${cFrom} balance`);
        return;
      }

      const valInUSD = fromVal / rates[cFrom];
      const targetVal = valInUSD * rates[cTo];

      user.balances[cFrom] -= fromVal;
      user.balances[cTo] = (user.balances[cTo] || 0) + targetVal;

      sounds.playSuccess();
      closeAllModals();

      const newTx = {
        id: `tx-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        title: `Currency Swap (${cFrom} ⇄ ${cTo})`,
        counterparty: "RBU Institutional FX Liquidity",
        category: "Transfers",
        amount: -fromVal,
        currency: cFrom,
        type: "outflow",
        status: "completed",
        paymentMethod: "Interbank Instant Swap",
        referenceCode: `RBU-FX-${Math.floor(100000 + Math.random() * 900000)}`,
        icon: "refresh-cw",
        note: `Exchanged ${formatCurrency(fromVal, cFrom)} for ${formatCurrency(targetVal, cTo)} at 0% markup`,
        clearingHouse: "CLS Bank Settlement"
      };

      transactions.unshift(newTx);
      if (onNewTransaction) onNewTransaction(newTx);

      if (window.showToast) {
        window.showToast(`Exchanged ${formatCurrency(fromVal, cFrom)} ➔ ${formatCurrency(targetVal, cTo)} ⚡`);
      }
    });
  }
}

export function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

export function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}
