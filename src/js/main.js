import '../styles/main.css';
import { route } from './router.js';
import { CONFIG, migrateGames, syncGamesWithServer, UPCOMING_GAMES, toggleHype } from './data.js';
import { t, currentLang, setLanguage, initI18n } from './i18n.js';
import { inject } from '@vercel/analytics';

export function mLink(text) { 
  if (text) {
    return `https://m.me/${CONFIG.messengerUsername}?text=${encodeURIComponent(text)}`;
  }
  return `https://m.me/${CONFIG.messengerUsername}`;
}

let currentOrderMsg = '';

export function openOrderModal(msg) {
  currentOrderMsg = msg || '';
  const modal = document.querySelector('#orderModal');
  const txtArea = document.querySelector('#orderMsgText');
  
  if (txtArea) txtArea.value = currentOrderMsg;
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  // Auto-copy to clipboard immediately so user is ready to paste
  if (currentOrderMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentOrderMsg).catch(() => {
        // Fallback: select textarea text
        if (txtArea) { txtArea.select(); document.execCommand('copy'); }
      });
    } else if (txtArea) {
      txtArea.select();
      document.execCommand('copy');
    }
    showToast('📋 ' + (currentOrderMsg.includes('متجر') ? 'الرسالة اتنسخت ✅ افتح ماسنجر والصق (Long Press ➔ Paste)' : 'Message copied ✅ Open Messenger and Paste'));
  }
}

export function closeOrderModal() {
  const modal = document.querySelector('#orderModal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
}

export function openCustomRegionModal() {
  const modal = document.querySelector('#customRegionModal');
  const input = document.querySelector('#customRegionInput');
  const amountInput = document.querySelector('#customRegionAmountInput');
  if (input) input.value = '';
  if (amountInput) amountInput.value = '';
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => input?.focus(), 100);
  }
}

export function closeCustomRegionModal() {
  const modal = document.querySelector('#customRegionModal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
}

export function openMessengerWithOrder(msg) {
  // Copy to clipboard first, then open Messenger
  const copyAndOpen = () => {
    window.open(`https://m.me/${CONFIG.messengerUsername}`, '_blank');
    closeOrderModal();
  };

  if (msg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(msg)
        .then(copyAndOpen)
        .catch(copyAndOpen);
    } else {
      const txtArea = document.querySelector('#orderMsgText');
      if (txtArea) { txtArea.select(); document.execCommand('copy'); }
      copyAndOpen();
    }
  } else {
    copyAndOpen();
  }
}

export function showToast(msg) {
  const toast = document.querySelector('#toast'); 
  toast.textContent = msg; 
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

export function setFloaters() {
  const generic = t('floatMsg');
  const msgBtn = document.querySelector('#floatMsg');
  const fMsgBtn = document.querySelector('#footerMsg');

  if (msgBtn) {
    msgBtn.href = mLink(generic);
    msgBtn.setAttribute('aria-label', t('msgAria'));
  }
  if (fMsgBtn) {
    fMsgBtn.href = mLink(generic);
    fMsgBtn.setAttribute('aria-label', t('msgAria'));
  }
}

export function consoleLabel(c) { 
  return c === 'ps5' ? 'PS5' : c === 'ps4' ? 'PS4' : c; 
}

export function buildBuyMessage(g) {
  const isEn = currentLang === 'en';
  const divider = '━━━━━━━━━━━━━━━━━━━━━━━━━';
  
  const lines = [
    isEn ? '🎮 New Order — GG Store' : '🎮 طلب جديد — متجر GG Store',
    divider
  ];
  
  lines.push(`🕹️ ${isEn ? 'Game' : 'اللعبة'}: ${g.name}`);
  
  const v = document.querySelector('#selVersion');
  if (v && v.value) lines.push(`📦 ${t('selVersion')}: ${v.value}`);
  
  const p = document.querySelector('#selPlatform');
  if (p && p.value) lines.push(`🖥️ ${t('selPlatform')}: ${p.value}`);
  else if (g.consoles && g.consoles.length === 1) lines.push(`🖥️ ${t('selPlatform')}: ${consoleLabel(g.consoles[0])}`);
  
  const l = document.querySelector('#selLang');
  if (l && l.value) lines.push(`🌐 ${t('selLang')}: ${l.value}`);
  
  const a = document.querySelector('#selAccount');
  if (a && a.value) lines.push(`👤 ${t('selAccount')}: ${a.value}`);
  else if (g.accounts && g.accounts.length === 1) lines.push(`👤 ${t('selAccount')}: ${g.accounts[0]}`);
  
  lines.push(`🛒 ${isEn ? 'Order Type' : 'نوع الطلب'}: ${g.preorder ? (isEn ? '⏳ Pre-Order' : '⏳ حجز مسبق') : (isEn ? '✅ Direct Purchase' : '✅ شراء مباشر')}`);
  
  lines.push(divider);
  lines.push(isEn ? '✉️ Please confirm availability and final price.' : '✉️ برجاء تأكيد المتاح والسعر النهائي، وشكراً 🙏');
  
  return lines.join('\n');
}

export function buildPsPlusMessage(tier, dur) {
  const isEn = currentLang === 'en';
  const header = isEn ? '⭐ PlayStation Plus Order from GG Store' : '⭐ طلب اشتراك بلايستيشن بلس من متجر GG Store';
  const lines = [header, '----------------------------------------'];
  
  lines.push(`${isEn ? 'Subscription Tier' : 'الباقة المطلوبة'}: PlayStation Plus ${tier.toUpperCase()}`);
  lines.push(`${isEn ? 'Duration' : 'مدة الاشتراك'}: ${dur}`);
  lines.push('----------------------------------------');
  lines.push(isEn ? 'Please confirm availability and final price.' : 'برجاء تأكيد المتاح والسعر النهائي وشكراً.');
  
  return lines.join('\n');
}

export function buildGiftCardMessage(country, currency, amount) {
  const isEn = currentLang === 'en';
  const header = isEn ? '💳 PSN Gift Card Order — GG Store' : '💳 طلب بطاقة شحن PSN — متجر GG Store';
  const lines = [header, '━━━━━━━━━━━━━━━━━━━━━━━━━'];
  
  lines.push(`🌐 ${isEn ? 'Store / Region' : 'الريجون / الدولة'}: ${country}`);
  lines.push(`💰 ${isEn ? 'Card Denomination' : 'فئة البطاقة'}: ${currency}${amount}`);
  lines.push(`⚡ ${isEn ? 'Delivery Type' : 'طريقة الاستلام'}: ${isEn ? 'Instant Digital Code' : 'كود رقمي فوري'}`);
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push(isEn ? '✉️ Please confirm availability and final price.' : '✉️ برجاء تأكيد المتاح والسعر النهائي، وشكراً 🙏');
  
  return lines.join('\n');
}

export function buildCustomRegionMessage(regionName, amountVal) {
  const isEn = currentLang === 'en';
  const header = isEn ? '🌍 Custom PSN Region Gift Card Order — GG Store' : '🌍 طلب بطاقة شحن ريجون خاص (PSN) — متجر GG Store';
  const lines = [header, '━━━━━━━━━━━━━━━━━━━━━━━━━'];
  
  lines.push(`🌐 ${isEn ? 'Requested Country / Region' : 'الدولة / الريجون المطلوب'}: ${regionName}`);
  if (amountVal && amountVal.trim()) {
    lines.push(`💰 ${isEn ? 'Required Denomination' : 'الفئة المطلوبة'}: ${amountVal.trim()}`);
  }
  lines.push(`⚡ ${isEn ? 'Delivery Type' : 'طريقة الاستلام'}: ${isEn ? 'Instant Digital Code' : 'كود رقمي رسمي ومضمون'}`);
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push(isEn ? '✉️ Please confirm availability and pricing for this region, thanks!' : '✉️ برجاء تأكيد التوفر والسعر الخاص بهذا الريجون وشكراً 🙏');
  
  return lines.join('\n');
}

function handleSearch(e, inputId) {
  e.preventDefault();
  const val = document.querySelector('#' + inputId).value.trim();
  if (val) location.hash = '#search/' + encodeURIComponent(val);
}

function hydrateStaticUI() {
  document.title = t('pageTitle');
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.innerHTML = t(key);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    el.placeholder = t(key);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.title = t(key);
    el.setAttribute('aria-label', t(key));
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    el.setAttribute('aria-label', t(key));
  });
}

function startCountdownTicker() {
  if (window.__cdInterval) clearInterval(window.__cdInterval);
  window.__cdInterval = setInterval(() => {
    UPCOMING_GAMES.forEach(g => {
      const targetDate = new Date(g.releaseDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, targetDate - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const mainBox = document.querySelector(`#cd-main-${g.id}`);
      if (mainBox) {
        const dEl = mainBox.querySelector('.cd-days'); if (dEl) dEl.textContent = days;
        const hEl = mainBox.querySelector('.cd-hours'); if (hEl) hEl.textContent = String(hours).padStart(2, '0');
        const mEl = mainBox.querySelector('.cd-mins'); if (mEl) mEl.textContent = String(mins).padStart(2, '0');
        const sEl = mainBox.querySelector('.cd-secs'); if (sEl) sEl.textContent = String(secs).padStart(2, '0');
      }

      const miniBox = document.querySelector(`#cd-mini-${g.id}`);
      if (miniBox) {
        const dEl = miniBox.querySelector('.cd-days'); if (dEl) dEl.textContent = days;
        const hEl = miniBox.querySelector('.cd-hours'); if (hEl) hEl.textContent = String(hours).padStart(2, '0');
        const mEl = miniBox.querySelector('.cd-mins'); if (mEl) mEl.textContent = String(mins).padStart(2, '0');
        const sEl = miniBox.querySelector('.cd-secs'); if (sEl) sEl.textContent = String(secs).padStart(2, '0');
      }
    });
  }, 1000);
}

// Global click handler for hype buttons (toggle vote/unvote)
document.addEventListener('click', e => {
  const hypeBtn = e.target.closest('.hype-btn');
  if (hypeBtn) {
    const id = hypeBtn.dataset.hypeId;
    if (id) {
      const { count, voted } = toggleHype(id);
      if (voted) {
        hypeBtn.classList.add('voted');
        hypeBtn.innerHTML = `${t('hypedBtn')} <span class="hype-count" id="hype-val-${id}">${count}</span>`;
        showToast(t('hypeAddedToast'));
      } else {
        hypeBtn.classList.remove('voted');
        hypeBtn.innerHTML = `${t('hypeBtn')} <span class="hype-count" id="hype-val-${id}">${count}</span>`;
        showToast(t('hypeRemovedToast'));
      }
    }
  }
});

// Language listener
window.addEventListener('languageChanged', () => {
  hydrateStaticUI();
  route();
});

// Setup lang toggle
document.querySelector('#langToggle').addEventListener('click', () => {
  setLanguage(currentLang === 'ar' ? 'en' : 'ar');
});

// Global Events & Real-time Persistence Sync
window.addEventListener('hashchange', () => {
  route();
  startCountdownTicker();
});

window.addEventListener('gamesUpdated', () => {
  route();
});

window.addEventListener('storage', e => {
  if (e.key === 'ggstore_games') {
    route();
  }
});

function initOrderModalEvents() {
  const closeBtn = document.querySelector('#modalCloseBtn');
  const copyBtn = document.querySelector('#modalCopyBtn');
  const openMsgBtn = document.querySelector('#modalOpenMsgBtn');
  const modal = document.querySelector('#orderModal');

  if (closeBtn) closeBtn.addEventListener('click', closeOrderModal);

  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeOrderModal();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (currentOrderMsg && navigator.clipboard) {
        navigator.clipboard.writeText(currentOrderMsg).catch(() => {});
        showToast(t('orderCopiedToast'));
      }
    });
  }

  if (openMsgBtn) {
    openMsgBtn.addEventListener('click', () => {
      if (currentOrderMsg && navigator.clipboard) {
        navigator.clipboard.writeText(currentOrderMsg).catch(() => {});
        showToast(t('orderCopiedToast'));
      }
      window.open(mLink(currentOrderMsg), '_blank');
      closeOrderModal();
    });
  }

  // Custom Region Modal Event Listeners
  const customCloseBtn = document.querySelector('#customRegionCloseBtn');
  const customModal = document.querySelector('#customRegionModal');
  const customSubmitBtn = document.querySelector('#customRegionSubmitBtn');
  const customRegionInput = document.querySelector('#customRegionInput');
  const customRegionAmountInput = document.querySelector('#customRegionAmountInput');

  if (customCloseBtn) customCloseBtn.addEventListener('click', closeCustomRegionModal);
  if (customModal) {
    customModal.addEventListener('click', e => {
      if (e.target === customModal) closeCustomRegionModal();
    });
  }

  const handleCustomRegionSubmit = () => {
    const regionName = customRegionInput?.value.trim();
    const amountVal = customRegionAmountInput?.value.trim();
    if (!regionName) {
      showToast(t('customRegionRequiredError'));
      customRegionInput?.focus();
      return;
    }
    closeCustomRegionModal();
    const msg = buildCustomRegionMessage(regionName, amountVal);
    openOrderModal(msg);
  };

  if (customSubmitBtn) customSubmitBtn.addEventListener('click', handleCustomRegionSubmit);
  if (customRegionInput) {
    customRegionInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleCustomRegionSubmit();
    });
  }
  if (customRegionAmountInput) {
    customRegionAmountInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleCustomRegionSubmit();
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  migrateGames();
  syncGamesWithServer();
  initI18n();
  hydrateStaticUI();
  initOrderModalEvents();
  route();
  startCountdownTicker();
  
  // Initialize Vercel Web Analytics
  inject();

  // Auto poll every 1.5 seconds for instant live updates across all devices
  setInterval(() => {
    syncGamesWithServer().catch(() => {});
  }, 1500);
});

window.addEventListener('focus', syncGamesWithServer);
window.addEventListener('online', syncGamesWithServer);
window.addEventListener('gamesUpdated', () => {
  route();
});

document.querySelector('#menuToggle').addEventListener('click', () => {
  document.querySelector('#mobileNav').classList.toggle('open');
});

document.querySelectorAll('#mobileNav a').forEach(a => {
  a.addEventListener('click', () => document.querySelector('#mobileNav').classList.remove('open'));
});

document.querySelector('#searchForm').addEventListener('submit', e => handleSearch(e, 'searchInput'));
document.querySelector('#searchFormMobile').addEventListener('submit', e => handleSearch(e, 'searchInputMobile'));

