// RBUBANK — Main Application Controller
// Super-App state management, routing, tabs, and interactions

import { INITIAL_USER, INITIAL_TRANSACTIONS, MONTHLY_SUMMARY, formatCurrency } from './data.js';
import { sounds } from './sound.js';
import { renderCashflowChart } from './charts.js';
import { setupCardsUI } from './cards.js';
import { setupTransfers, openModal, closeAllModals } from './transfers.js';
import { openStatementModal } from './statement.js';

class RbubankApp {
  constructor() {
    this.user = JSON.parse(JSON.stringify(INITIAL_USER));
    this.transactions = JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS));
    this.currentTab = 'home';
    this.activeFilter = 'all';
    this.searchQuery = '';
    this.balanceHidden = false;
    this.activeChartPeriod = '1Y';
  }

  init() {
    this.bindGlobalToast();
    this.renderTopBar();
    this.renderBalance();
    this.renderInflowBanner();
    this.renderRecents();
    this.renderChart();
    this.renderTransactions();
    this.bindTabNavigation();
    this.bindFilters();
    this.bindSearch();
    this.bindTransactionDetails();

    // Initialize modules
    setupCardsUI(this.user, (card) => this.onCardUpdated(card));
    setupTransfers(this.user, this.transactions, (tx) => this.onTransactionAdded(tx));

    // Expose statement modal trigger
    document.querySelectorAll('[data-action="open-statement"]').forEach(btn => {
      btn.addEventListener('click', () => {
        openStatementModal(this.user, this.transactions);
      });
    });

    console.log("RBUBANK App Initialized for", this.user.name);
  }

  bindGlobalToast() {
    window.showToast = (msg, duration = 2800) => {
      const container = document.getElementById('toast-container');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `<span>⚡</span> <span>${msg}</span>`;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-8px)';
        toast.style.transition = 'all 0.25s ease';
        setTimeout(() => toast.remove(), 250);
      }, duration);
    };
  }

  renderTopBar() {
    const nameEl = document.getElementById('user-display-name');
    const tierEl = document.getElementById('user-display-tier');
    const avatarEl = document.getElementById('user-avatar-initials');

    if (nameEl) nameEl.textContent = this.user.name;
    if (tierEl) tierEl.textContent = this.user.tier;
    if (avatarEl) avatarEl.textContent = this.user.avatarInitials;

    // Currency Switcher
    const currBtn = document.getElementById('currency-toggle-btn');
    if (currBtn) {
      currBtn.addEventListener('click', () => {
        sounds.playTap();
        const currencies = ['USD', 'EUR', 'GBP', 'CHF'];
        const nextIdx = (currencies.indexOf(this.user.currency) + 1) % currencies.length;
        this.user.currency = currencies[nextIdx];
        this.renderBalance();
        this.renderTransactions();
        if (window.showToast) {
          window.showToast(`Switched active currency to ${this.user.currency}`);
        }
      });
    }

    // Copy IBAN on header click
    const profileHeader = document.getElementById('user-profile-btn');
    if (profileHeader) {
      profileHeader.addEventListener('click', () => {
        sounds.playTap();
        navigator.clipboard?.writeText(this.user.iban);
        if (window.showToast) {
          window.showToast(`IBAN copied: ${this.user.iban}`);
        }
      });
    }
  }

  renderBalance() {
    const intEl = document.getElementById('balance-integer');
    const decEl = document.getElementById('balance-decimals');
    const symEl = document.getElementById('balance-currency-symbol');
    const tagEl = document.getElementById('current-currency-tag');

    const bal = this.user.balances[this.user.currency];
    const sym = this.user.currency === "EUR" ? "€" : this.user.currency === "GBP" ? "£" : this.user.currency === "CHF" ? "CHF " : "$";

    if (symEl) symEl.textContent = sym;
    if (tagEl) tagEl.textContent = `${this.user.currency} Account`;

    if (this.balanceHidden) {
      if (intEl) intEl.textContent = "••••••";
      if (decEl) decEl.textContent = "";
    } else {
      const parts = bal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split('.');
      if (intEl) intEl.textContent = parts[0];
      if (decEl) decEl.textContent = `.${parts[1]}`;
    }

    const eyeBtn = document.getElementById('btn-toggle-eye');
    if (eyeBtn) {
      eyeBtn.onclick = () => {
        sounds.playTap();
        this.balanceHidden = !this.balanceHidden;
        this.renderBalance();
      };
    }
  }

  renderInflowBanner() {
    const totalEl = document.getElementById('banner-inflow-total');
    const countEl = document.getElementById('banner-inflow-count');
    if (totalEl) totalEl.textContent = `$${this.user.metrics.annualInflowTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (countEl) countEl.textContent = `12 monthly inflows ($6k - $8.5k) • Avg $${Math.round(this.user.metrics.monthlyAverageInflow).toLocaleString()}/mo`;

    const banner = document.getElementById('annual-inflow-banner');
    if (banner) {
      banner.addEventListener('click', () => {
        sounds.playTap();
        this.switchTab('analytics');
      });
    }
  }

  renderRecents() {
    const container = document.getElementById('recents-container');
    if (!container) return;

    let html = `
      <button class="contact-pill" data-action="open-send">
        <div class="contact-avatar add-new">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </div>
        <div class="contact-name">New</div>
      </button>
    `;

    this.user.recentRecipients.forEach(r => {
      html += `
        <button class="contact-pill" data-name="${r.name}" data-action="quick-send">
          <div class="contact-avatar">${r.avatar}</div>
          <div class="contact-name">${r.name}</div>
        </button>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('[data-action="quick-send"]').forEach(btn => {
      btn.addEventListener('click', () => {
        sounds.playTap();
        const name = btn.getAttribute('data-name');
        const input = document.getElementById('send-recipient-input');
        if (input) input.value = name;
        openModal('modal-send');
      });
    });
  }

  renderChart() {
    renderCashflowChart('cashflow-svg-chart', MONTHLY_SUMMARY, this.activeChartPeriod);

    // Chart period tabs
    document.querySelectorAll('.period-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        sounds.playTap();
        document.querySelectorAll('.period-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeChartPeriod = btn.getAttribute('data-period');
        renderCashflowChart('cashflow-svg-chart', MONTHLY_SUMMARY, this.activeChartPeriod);
      });
    });
  }

  renderTransactions() {
    const container = document.getElementById('transactions-list-container');
    if (!container) return;

    let list = this.transactions;

    // Filter by type
    if (this.activeFilter === 'inflow') {
      list = list.filter(t => t.type === 'inflow');
    } else if (this.activeFilter === 'outflow') {
      list = list.filter(t => t.type === 'outflow');
    } else if (this.activeFilter === 'transfers') {
      list = list.filter(t => t.category === 'Transfers');
    } else if (this.activeFilter === 'cards') {
      list = list.filter(t => t.paymentMethod.toLowerCase().includes('card') || t.paymentMethod.toLowerCase().includes('apple'));
    }

    // Filter by search
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(t => 
        t.title.toLowerCase().includes(q) ||
        t.counterparty.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.referenceCode.toLowerCase().includes(q)
      );
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-3);">
          <div style="font-size: 28px; margin-bottom: 8px;">🔍</div>
          <div style="font-size: 14px; font-weight: 600;">No transactions found</div>
          <div style="font-size: 12px; margin-top: 4px;">Try adjusting your filter or search query</div>
        </div>
      `;
      return;
    }

    let html = "";
    list.forEach(tx => {
      const isInflow = tx.type === 'inflow';
      const icon = isInflow ? '↓' : '↑';
      const amountStr = (isInflow ? "+" : "") + formatCurrency(tx.amount, this.user.currency);

      html += `
        <div class="tx-item" data-id="${tx.id}">
          <div class="tx-left">
            <div class="tx-icon-box ${isInflow ? 'inflow-accent' : ''}">
              <span>${icon}</span>
            </div>
            <div class="tx-info">
              <div class="tx-title">${tx.title}</div>
              <div class="tx-meta">
                <span>${tx.date}</span>
                <span>•</span>
                <span class="tx-badge">${tx.paymentMethod}</span>
              </div>
            </div>
          </div>
          <div class="tx-right">
            <div class="tx-amount ${isInflow ? 'inflow' : 'outflow'}">${amountStr}</div>
            <div class="tx-status-sub">${tx.status === 'completed' ? 'Completed' : 'Pending'}</div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  bindFilters() {
    document.querySelectorAll('.tx-filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        sounds.playTap();
        document.querySelectorAll('.tx-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeFilter = chip.getAttribute('data-filter');
        this.renderTransactions();
      });
    });
  }

  bindSearch() {
    const searchInput = document.getElementById('tx-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderTransactions();
      });
    }
  }

  bindTabNavigation() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sounds.playTap();
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    // Toggle views
    document.querySelectorAll('.tab-view-content').forEach(view => {
      view.style.display = view.getAttribute('data-view') === tabName ? 'block' : 'none';
    });

    // Scroll to top of app content
    const content = document.querySelector('.app-content');
    if (content) content.scrollTop = 0;
  }

  bindTransactionDetails() {
    const container = document.getElementById('transactions-list-container');
    if (!container) return;

    container.addEventListener('click', (e) => {
      const item = e.target.closest('.tx-item');
      if (!item) return;
      sounds.playTap();
      const id = item.getAttribute('data-id');
      const tx = this.transactions.find(t => t.id === id);
      if (tx) this.showTransactionDetailModal(tx);
    });
  }

  showTransactionDetailModal(tx) {
    const modal = document.getElementById('modal-tx-detail');
    if (!modal) return;

    const isInflow = tx.type === 'inflow';
    document.getElementById('modal-tx-amount').textContent = (isInflow ? "+" : "") + formatCurrency(tx.amount, this.user.currency);
    document.getElementById('modal-tx-amount').className = `modal-detail-amount ${isInflow ? 'inflow' : 'outflow'}`;
    document.getElementById('modal-tx-title').textContent = tx.title;
    document.getElementById('modal-tx-counterparty').textContent = tx.counterparty || tx.title;
    document.getElementById('modal-tx-date').textContent = `${tx.date} at ${tx.time || '12:00'}`;
    document.getElementById('modal-tx-status').textContent = tx.status.toUpperCase();
    document.getElementById('modal-tx-ref').textContent = tx.referenceCode;
    document.getElementById('modal-tx-clearing').textContent = tx.clearingHouse || 'EBA RT1 Instant';
    document.getElementById('modal-tx-note').textContent = tx.note || 'No customer reference note';

    modal.classList.add('active');
  }

  onTransactionAdded(newTx) {
    this.renderBalance();
    this.renderTransactions();
  }

  onCardUpdated(card) {
    // Card state changed
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new RbubankApp();
  window.app.init();
});
