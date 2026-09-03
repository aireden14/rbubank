// RBUBANK — Cards Manager Module
// Handles 3D Card tilt/flip, freeze/unfreeze state, PIN/CVV revelation, spending limits,
// virtual card generation, and card security toggles

import { sounds } from './sound.js';

export function setupCardsUI(user, onCardUpdate) {
  const cardElement = document.getElementById('main-card-3d');
  const flipBtn = document.getElementById('btn-flip-card');
  const freezeBtn = document.getElementById('btn-freeze-card');
  const revealBtn = document.getElementById('btn-reveal-details');
  const limitSlider = document.getElementById('card-limit-slider');
  const limitDisplay = document.getElementById('card-limit-val');

  if (!cardElement) return;

  const currentCard = user.cards[0]; // Primary Black Metal Card

  // 3D Card Flip Handler
  const toggleFlip = () => {
    sounds.playTap();
    cardElement.classList.toggle('flipped');
  };

  if (flipBtn) flipBtn.addEventListener('click', toggleFlip);
  cardElement.addEventListener('click', (e) => {
    if (!e.target.closest('button')) {
      toggleFlip();
    }
  });

  // Freeze / Unfreeze Handler
  if (freezeBtn) {
    freezeBtn.addEventListener('click', () => {
      currentCard.isFrozen = !currentCard.isFrozen;
      sounds.playToggle();
      updateFreezeVisuals(currentCard);
      if (onCardUpdate) onCardUpdate(currentCard);
      if (window.showToast) {
        window.showToast(currentCard.isFrozen ? "Card Frozen ❄️ Security lock active" : "Card Unfrozen ⚡ Ready for transactions");
      }
    });
  }

  // Reveal Details (PIN / CVV)
  if (revealBtn) {
    revealBtn.addEventListener('click', () => {
      currentCard.isPinRevealed = !currentCard.isPinRevealed;
      sounds.playTap();
      updateDetailsVisuals(currentCard);
    });
  }

  // Limit Slider
  if (limitSlider && limitDisplay) {
    limitSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      currentCard.monthlyLimit = val;
      limitDisplay.textContent = `$${val.toLocaleString()}`;
    });
    limitSlider.addEventListener('change', () => {
      sounds.playTap();
      if (window.showToast) {
        window.showToast(`Monthly limit updated to $${currentCard.monthlyLimit.toLocaleString()}`);
      }
    });
  }

  // Mouse Parallax on Desktop
  cardElement.addEventListener('mousemove', (e) => {
    if (cardElement.classList.contains('flipped')) return;
    const rect = cardElement.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotX = -(y / rect.height) * 16;
    const rotY = (x / rect.width) * 16;
    cardElement.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
  });

  cardElement.addEventListener('mouseleave', () => {
    if (!cardElement.classList.contains('flipped')) {
      cardElement.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
  });

  // + New Virtual Card Generator
  const newCardBtn = document.getElementById('btn-add-virtual-card');
  if (newCardBtn) {
    newCardBtn.addEventListener('click', () => {
      sounds.playSuccess();
      const rand4 = () => Math.floor(1000 + Math.random() * 9000);
      const newCard = {
        id: `card-virtual-${Date.now()}`,
        type: "virtual",
        tier: "Single-Use Disposable Virtual",
        brand: "Visa Infinite",
        number: `4820 ${rand4()} ${rand4()} ${rand4()}`,
        numberMasked: `•••• •••• •••• ${rand4()}`,
        expiry: "09/29",
        cvv: `${Math.floor(100 + Math.random() * 900)}`,
        holder: "DENIS RECH",
        isFrozen: false,
        isPinRevealed: false,
        monthlyLimit: 5000,
        spentThisMonth: 0,
        contactlessEnabled: true,
        onlinePurchasesEnabled: true,
        atmWithdrawalsEnabled: false
      };
      user.cards.push(newCard);
      if (window.showToast) {
        window.showToast(`New Disposable Virtual Card created 💳 (${newCard.number.slice(-4)})`);
      }
    });
  }

  // Security Toggles inside Cards View
  const toggleContactless = document.getElementById('toggle-card-contactless');
  if (toggleContactless) {
    toggleContactless.addEventListener('change', (e) => {
      sounds.playTap();
      currentCard.contactlessEnabled = e.target.checked;
      if (window.showToast) {
        window.showToast(currentCard.contactlessEnabled ? "Contactless & Apple Pay active 📶" : "Contactless disabled");
      }
    });
  }

  const toggleOnline = document.getElementById('toggle-card-online');
  if (toggleOnline) {
    toggleOnline.addEventListener('change', (e) => {
      sounds.playTap();
      currentCard.onlinePurchasesEnabled = e.target.checked;
      if (window.showToast) {
        window.showToast(currentCard.onlinePurchasesEnabled ? "Online e-commerce enabled 🌐" : "Online transactions blocked");
      }
    });
  }

  const toggleAtm = document.getElementById('toggle-card-atm');
  if (toggleAtm) {
    toggleAtm.addEventListener('change', (e) => {
      sounds.playTap();
      currentCard.atmWithdrawalsEnabled = e.target.checked;
      if (window.showToast) {
        window.showToast(currentCard.atmWithdrawalsEnabled ? "ATM cash withdrawals enabled 🏧" : "ATM withdrawals disabled");
      }
    });
  }

  // Change PIN modal trigger
  const changePinBtn = document.getElementById('btn-change-pin');
  if (changePinBtn) {
    changePinBtn.addEventListener('click', () => {
      sounds.playTap();
      const newPin = prompt("Enter new 4-digit PIN for your Metal Card:", "8421");
      if (newPin && newPin.length === 4) {
        sounds.playSuccess();
        if (window.showToast) {
          window.showToast("Metal Card PIN updated successfully in Secure Element 🔒");
        }
      }
    });
  }
}

function updateFreezeVisuals(card) {
  const cardElement = document.getElementById('main-card-3d');
  const freezeBtn = document.getElementById('btn-freeze-card');
  const freezeText = document.getElementById('freeze-btn-text');

  if (card.isFrozen) {
    cardElement.classList.add('is-frozen');
    if (freezeText) freezeText.textContent = "Unfreeze";
    if (freezeBtn) freezeBtn.classList.add('frozen-active');
  } else {
    cardElement.classList.remove('is-frozen');
    if (freezeText) freezeText.textContent = "Freeze Card";
    if (freezeBtn) freezeBtn.classList.remove('frozen-active');
  }
}

function updateDetailsVisuals(card) {
  const numElem = document.getElementById('card-display-number');
  const cvvElem = document.getElementById('card-display-cvv');
  const revealBtn = document.getElementById('btn-reveal-details');

  if (card.isPinRevealed) {
    if (numElem) numElem.textContent = card.number;
    if (cvvElem) cvvElem.textContent = card.cvv;
    if (revealBtn) revealBtn.textContent = "Hide Details";
  } else {
    if (numElem) numElem.textContent = card.numberMasked;
    if (cvvElem) cvvElem.textContent = "•••";
    if (revealBtn) revealBtn.textContent = "Show Details";
  }
}
