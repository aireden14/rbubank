// RBUBANK — Transfers & Payments Execution Hub
// Handles instant SEPA, International SWIFT, P2P Transfers & Live FX Exchange

import { sounds } from './sound.js';

export function setupTransfers(user, transactions, onNewTransaction) {
  const sendModal = document.getElementById('modal-send');
  const exchangeModal = document.getElementById('modal-exchange');
  const receiveModal = document.getElementById('modal-receive');

  // Wire up open modal buttons
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

  // Quick Amount Buttons
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

      // Show processing state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <div class="spinner-inline"></div>
          <span>Routing via SEPA Instant...</span>
        `;
      }

      setTimeout(() => {
        // Deduct from balance
        user.balances[user.currency] -= amount;

        // Create transaction record
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().slice(0, 5);

        const newTx = {
          id: `tx-${Date.now()}`,
          date: dateStr,
          time: timeStr,
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
          submitBtn.innerHTML = `<span>Send Transfer</span>`;
        }

        closeAllModals();

        // Reset form
        if (amountInput) amountInput.value = "";
        if (noteInput) noteInput.value = "";

        if (onNewTransaction) onNewTransaction(newTx);

        if (window.showToast) {
          window.showToast(`Sent $${amount.toLocaleString()} to ${recipient} (SEPA Instant ⚡)`);
        }
      }, 800);
    });
  }

  // Setup Currency Exchange Calculator
  setupExchangeCalculator(user);
}

function setupExchangeCalculator(user) {
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
      sounds.playSuccess();
      closeAllModals();
      if (window.showToast) {
        window.showToast(`Exchanged successfully at 0% institutional spread ⚡`);
      }
    });
  }
}

export function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('active');
  }
}

export function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}
