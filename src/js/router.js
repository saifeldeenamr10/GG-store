import { viewHome, renderCatalogBlock, setCatalogFilterState, catalogFilterState, viewConsole, viewGame, viewPsPlus, viewGiftCards, viewHowTo, viewSearch } from './views.js';
import { viewAdmin, renderAdminList, adminAuthed, setAdminAuthed, populateEditForm, resetAdminForm, updateImagePreview, compressImage, uploadImageToImgBB } from './admin.js';
import { setFloaters, showToast } from './main.js';
import { CONFIG, getGames, saveGames, getCloudConfig, saveCloudConfig, saveGamesToCloud, syncGamesWithServer } from './data.js';
import { t } from './i18n.js';

const app = document.querySelector('#app');

export function route() {
  const hash = location.hash.replace('#', '') || 'home';
  const [path, arg] = hash.split('/');

  document.querySelectorAll('.main-nav a').forEach(a => a.classList.remove('active'));
  
  const navMatch = document.querySelector(`.main-nav a[data-route="${hash}"]`) || 
                  (path === 'console' ? document.querySelector(`.main-nav a[data-route="console/${arg}"]`) : null);
  
  if (navMatch) navMatch.classList.add('active');

  let html = '';
  if (path === 'home') html = viewHome(arg);
  else if (path === 'console') html = viewConsole(arg);
  else if (path === 'game') html = viewGame(arg);
  else if (path === 'psplus') html = viewPsPlus();
  else if (path === 'giftcards') html = viewGiftCards();
  else if (path === 'howto') html = viewHowTo();
  else if (path === 'admin') html = viewAdmin();
  else if (path === 'search') html = viewSearch(decodeURIComponent(arg || ''));
  else html = viewHome(arg);

  app.innerHTML = html;
  
  if (path === 'home' && arg && parseInt(arg, 10) > 1) {
    const catalogEl = document.querySelector('#catalogBlock');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  bindViewEvents(path, arg);
  setFloaters();
}

let catalogSearchDebounceTimer = null;

function refreshCatalog(scrollIntoView = false) {
  const catalogEl = document.querySelector('#catalogBlock');
  if (!catalogEl) return;
  catalogEl.outerHTML = renderCatalogBlock();
  bindHomeCatalogEvents();
  if (scrollIntoView) {
    const newCatalog = document.querySelector('#catalogBlock');
    if (newCatalog) {
      newCatalog.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

function bindHomeCatalogEvents() {
  const catalogEl = document.querySelector('#catalogBlock');
  if (!catalogEl) return;

  // Pagination buttons
  catalogEl.querySelectorAll('.pagination-bar .page-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (btn.hasAttribute('disabled') || btn.classList.contains('active')) return;
      const targetPage = parseInt(btn.dataset.page, 10);
      if (targetPage) {
        setCatalogFilterState({ page: targetPage });
        history.pushState(null, '', `#home/${targetPage}`);
        refreshCatalog(true);
      }
    });
  });

  // Search input inside filter
  const searchInput = catalogEl.querySelector('#catalogSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      clearTimeout(catalogSearchDebounceTimer);
      catalogSearchDebounceTimer = setTimeout(() => {
        setCatalogFilterState({ search: val, page: 1 });
        refreshCatalog(false);
        // Keep focus and cursor in input after re-render
        const newSearchInput = document.querySelector('#catalogSearchInput');
        if (newSearchInput) {
          newSearchInput.focus();
          newSearchInput.setSelectionRange(newSearchInput.value.length, newSearchInput.value.length);
        }
      }, 200);
    });
  }

  // Sort dropdown
  const sortSelect = catalogEl.querySelector('#catalogSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      setCatalogFilterState({ sort: e.target.value, page: 1 });
      refreshCatalog(false);
    });
  }

  // Platform filter pills
  catalogEl.querySelectorAll('.filter-platform-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const platform = btn.dataset.platform;
      if (platform) {
        setCatalogFilterState({ platform, page: 1 });
        refreshCatalog(false);
      }
    });
  });

  // Genre chips
  catalogEl.querySelectorAll('#catalogGenreChips .chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const genre = chip.dataset.genre;
      if (genre) {
        setCatalogFilterState({ genre, page: 1 });
        refreshCatalog(false);
      }
    });
  });

  // Reset filter buttons
  const resetBtn = catalogEl.querySelector('#catalogResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setCatalogFilterState({ genre: 'all', platform: 'all', sort: 'default', search: '', page: 1 });
      refreshCatalog(false);
    });
  }

  const resetEmptyBtn = catalogEl.querySelector('#catalogResetEmptyBtn');
  if (resetEmptyBtn) {
    resetEmptyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setCatalogFilterState({ genre: 'all', platform: 'all', sort: 'default', search: '', page: 1 });
      refreshCatalog(false);
    });
  }
}

function bindViewEvents(path, arg) {
  if (path === 'home') {
    if (arg) {
      setCatalogFilterState({ page: parseInt(arg, 10) || 1 });
    }
    bindHomeCatalogEvents();
  }

  if (path === 'console') {
    document.querySelectorAll('#genreChips .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const genre = chip.dataset.genre;
        app.querySelector('.block').outerHTML = viewConsole(arg, genre);
        bindViewEvents(path, arg);
      });
    });
  }
  
  if (path === 'game') {
    const GAMES = getGames();
    const g = GAMES.find(x => x.id === arg);
    if (!g) return;

    import('./main.js').then(({ buildBuyMessage, openOrderModal }) => {
      const handleOrder = () => {
        const msg = buildBuyMessage(g);
        openOrderModal(msg);
      };

      const preBtn = document.querySelector('#preorderBtn');
      if (preBtn) preBtn.addEventListener('click', handleOrder);

      const msgBtn = document.querySelector('#buyMsgBtn');
      if (msgBtn) msgBtn.addEventListener('click', handleOrder);
    });
  }
  
  if (path === 'psplus') {
    document.querySelectorAll('.buyPlusBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.tier-card');
        const dur = card.querySelector('.durSel').value;
        const tier = btn.dataset.tier || '';
        import('./main.js').then(({ buildPsPlusMessage, openOrderModal }) => {
          const msg = buildPsPlusMessage(tier, dur);
          openOrderModal(msg);
        });
      });
    });
  }

  if (path === 'giftcards') {
    // Denomination selector chip toggle
    document.querySelectorAll('.giftcard-denom-btn').forEach(denomBtn => {
      denomBtn.addEventListener('click', () => {
        const cardId = denomBtn.dataset.cardId;
        const val = denomBtn.dataset.value;
        const currency = denomBtn.dataset.currency;

        const parent = denomBtn.closest('.giftcard-box');
        if (!parent) return;

        // Toggle active button class
        parent.querySelectorAll('.giftcard-denom-btn').forEach(b => b.classList.remove('active'));
        denomBtn.classList.add('active');

        // Update hidden select
        const sel = parent.querySelector(`#denomSel-${cardId}`);
        if (sel) sel.value = val;

        // Update visual card value display
        const display = parent.querySelector(`#valDisplay-${cardId}`);
        if (display) display.textContent = `${currency}${val}`;
      });
    });

    // Order button handler
    document.querySelectorAll('.buyGiftCardBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cardBox = btn.closest('.giftcard-box');
        const cardId = btn.dataset.cardId;
        const country = btn.dataset.country;
        const currency = btn.dataset.currency;

        const activeBtn = cardBox?.querySelector('.giftcard-denom-btn.active');
        const amount = activeBtn ? activeBtn.dataset.value : (cardBox?.querySelector(`#denomSel-${cardId}`)?.value || '10');

        import('./main.js').then(({ buildGiftCardMessage, openOrderModal }) => {
          const msg = buildGiftCardMessage(country, currency, amount);
          openOrderModal(msg);
        });
      });
    });

    // Custom Region Button trigger
    const customRegionBtn = document.querySelector('#openCustomRegionModalBtn');
    if (customRegionBtn) {
      customRegionBtn.addEventListener('click', () => {
        import('./main.js').then(({ openCustomRegionModal }) => {
          openCustomRegionModal();
        });
      });
    }
  }
  
  if (path === 'admin') {
    if (!adminAuthed) {
      const btn = document.querySelector('#adminLoginBtn');
      btn && btn.addEventListener('click', () => {
        const val = document.querySelector('#adminPass').value;
        import('./data.js').then(({ getAdminPassword }) => {
          if (val === getAdminPassword()) { 
            setAdminAuthed(true); 
            route(); 
            showToast(t('toastLoginOk')); 
          } else {
            showToast(t('toastLoginFail'));
          }
        });
      });
      document.querySelector('#adminPass')?.addEventListener('keydown', e => { 
        if (e.key === 'Enter') document.querySelector('#adminLoginBtn').click(); 
      });
    } else {
      renderAdminList();

      // Real-time admin game search filter
      document.querySelector('#adminSearchInput')?.addEventListener('input', e => {
        renderAdminList(e.target.value);
      });

      // Export Data Handler
      document.querySelector('#exportGamesDataBtn')?.addEventListener('click', () => {
        import('./data.js').then(({ getGames }) => {
          const games = getGames();
          const payload = { updatedAt: Date.now(), games };
          const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'games.json';
          a.click();
          URL.revokeObjectURL(url);
          showToast('✨ تم تحميل ملف الألعاب games.json بنجاح!');
        });
      });

      // Password Change Modal Handlers
      const passModal = document.querySelector('#changePassModal');
      document.querySelector('#openPassModalBtn')?.addEventListener('click', () => {
        passModal?.classList.add('open');
      });
      document.querySelector('#closePassModalBtn')?.addEventListener('click', () => {
        passModal?.classList.remove('open');
      });
      passModal?.addEventListener('click', e => {
        if (e.target === passModal) passModal.classList.remove('open');
      });

      document.querySelector('#changePassForm')?.addEventListener('submit', e => {
        e.preventDefault();
        const curr = document.querySelector('#currPass').value;
        const newP = document.querySelector('#newPass').value;
        const confP = document.querySelector('#confirmPass').value;

        import('./data.js').then(({ getAdminPassword, setAdminPassword }) => {
          if (curr !== getAdminPassword()) {
            showToast(t('passIncorrect'));
            return;
          }
          if (newP !== confP) {
            showToast(t('passMismatch'));
            return;
          }
          setAdminPassword(newP);
          showToast(t('passChangedSuccess'));
          passModal?.classList.remove('open');
          document.querySelector('#changePassForm')?.reset();
        });
      });

      document.querySelector('#adminLogout')?.addEventListener('click', () => { 
        setAdminAuthed(false); 
        route(); 
      });

      document.querySelector('#cancelEditBtn')?.addEventListener('click', () => {
        resetAdminForm();
      });

      // Cloud Settings Modal Events
      const cloudModal = document.querySelector('#cloudSettingsModal');
      document.querySelector('#openCloudModalBtn')?.addEventListener('click', () => {
        cloudModal?.classList.add('open');
      });
      document.querySelector('#closeCloudModalBtn')?.addEventListener('click', () => {
        cloudModal?.classList.remove('open');
      });
      cloudModal?.addEventListener('click', e => {
        if (e.target === cloudModal) cloudModal.classList.remove('open');
      });

      document.querySelector('#cloudSettingsForm')?.addEventListener('submit', async e => {
        e.preventDefault();
        const imgbbKey = document.querySelector('#cfgImgbbKey').value.trim();
        const jsonbinId = document.querySelector('#cfgJsonbinId').value.trim();
        const jsonbinKey = document.querySelector('#cfgJsonbinKey').value.trim();
        const customApi = document.querySelector('#cfgCustomApi').value.trim();

        saveCloudConfig({ imgbbKey, jsonbinId, jsonbinKey, customApi });
        showToast(t('cloudSettingsSaved'));
        cloudModal?.classList.remove('open');
      });

      document.querySelector('#manualSyncBtn')?.addEventListener('click', async () => {
        showToast('⏳ جاري التزامن مع السحابة...');
        const ok = await saveGamesToCloud(getGames());
        if (ok) {
          showToast(t('cloudSyncSuccess'));
        } else {
          const synced = await syncGamesWithServer();
          if (synced) showToast(t('cloudSyncSuccess'));
          else showToast(t('cloudSyncFail'));
        }
      });

      // Cover Image File Upload Handling with Compression & Cloud Host
      document.querySelector('#gImageFile')?.addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;

        try {
          showToast(t('compressingImage'));
          const compressedDataUrl = await compressImage(file, 800, 0.82);
          
          const cloudCfg = getCloudConfig();
          let finalUrl = compressedDataUrl;

          if (cloudCfg.imgbbKey) {
            try {
              showToast(t('uploadingImage'));
              finalUrl = await uploadImageToImgBB(compressedDataUrl, cloudCfg.imgbbKey);
              showToast(t('imageUploadedOk'));
            } catch (err) {
              console.warn('ImgBB upload failed, falling back to compressed local WebP:', err);
              showToast('⚠️ تعذر الرفع على ImgBB، تم استخدام النسخة المضغوطة.');
            }
          }

          document.querySelector('#gImage').value = finalUrl;
          updateImagePreview(finalUrl);
        } catch (err) {
          console.error('Image compression error:', err);
        }
      });

      document.querySelector('#gImage')?.addEventListener('input', e => {
        updateImagePreview(e.target.value.trim());
      });
      
      document.querySelector('#gameAdminForm')?.addEventListener('submit', e => {
        e.preventDefault();
        const editId = document.querySelector('#editGameIdVal').value;
        const name = document.querySelector('#gName').value.trim();
        if (!name) return;
        
        const chkPs4 = document.querySelector('#chkPs4').checked;
        const chkPs5 = document.querySelector('#chkPs5').checked;
        const consoles = [];
        if (chkPs4) consoles.push('ps4');
        if (chkPs5) consoles.push('ps5');
        if (consoles.length === 0) consoles.push('ps5');
        
        const descAr = document.querySelector('#gDescAr').value.trim();
        const descEn = document.querySelector('#gDescEn').value.trim();
        const image = document.querySelector('#gImage').value.trim();
        const genre = document.querySelector('#gGenre').value;
        const preorder = document.querySelector('#gPreorder').checked;
        
        const GAMES = getGames();

        if (editId) {
          // MODIFICATION OF EXISTING GAME
          const index = GAMES.findIndex(g => g.id === editId);
          if (index !== -1) {
            GAMES[index] = {
              ...GAMES[index],
              name,
              consoles,
              genre,
              preorder,
              image,
              desc: {
                ar: descAr || (typeof GAMES[index].desc === 'object' ? GAMES[index].desc.ar : GAMES[index].desc) || 'وصف اللعبة',
                en: descEn || (typeof GAMES[index].desc === 'object' ? GAMES[index].desc.en : '') || name
              }
            };
            saveGames(GAMES);
            resetAdminForm();
            renderAdminList();
            showToast(t('toastModified'));
          }
        } else {
          // CREATION OF NEW GAME
          const newGame = {
            id: 'g' + Date.now(),
            name,
            consoles,
            genre,
            preorder,
            hidden: false,
            desc: {
              ar: descAr || 'وصف اللعبة هيُضاف قريبًا.',
              en: descEn || 'Description will be added soon.'
            },
            image: image || '',
            versions: [], versionNote: { ar: '', en: '' }, languages: [],
            accounts: ['Primary', 'Secondary']
          };
          
          GAMES.unshift(newGame);
          saveGames(GAMES);
          resetAdminForm();
          renderAdminList();
          showToast(t('toastAdded'));
        }
      });
      
      document.querySelector('#adminList')?.addEventListener('click', e => {
        const btn = e.target.closest('.btn-admin-act');
        if (!btn) return;

        const preorderId = btn.dataset.preorder;
        const editId = btn.dataset.edit;
        const hideId = btn.dataset.hide;
        const delId = btn.dataset.del;

        if (preorderId) {
          const GAMES = getGames();
          const target = GAMES.find(g => g.id === preorderId);
          if (target) {
            target.preorder = !target.preorder;
            saveGames(GAMES);
            renderAdminList();
            showToast(target.preorder ? t('preorderToggleOn') : t('preorderToggleOff'));
          }
        } else if (editId) {
          populateEditForm(editId);
        } else if (hideId) {
          const GAMES = getGames();
          const target = GAMES.find(g => g.id === hideId);
          if (target) {
            target.hidden = !target.hidden;
            saveGames(GAMES);
            renderAdminList();
            showToast(t('toastVisibility'));
          }
        } else if (delId) {
          let GAMES = getGames();
          GAMES = GAMES.filter(g => g.id !== delId);
          saveGames(GAMES);
          renderAdminList();
          showToast(t('toastDeleted'));
        }
      });
    }
  }
}
