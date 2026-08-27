import { CONFIG, GENRES, genreMap, getGames, saveGames, getCloudConfig, saveCloudConfig, saveGamesToCloud, syncGamesWithServer } from './data.js';
import { showToast } from './main.js';
import { safeBgStyle } from './views.js';
import { t, currentLang } from './i18n.js';

function getLang(obj) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[currentLang] || obj['ar'] || '';
}

export let adminAuthed = false;
export let editingGameId = null;

export function viewAdmin() {
  if (!adminAuthed) {
    return `
    <div class="admin-gate fade-in">
      <div class="admin-gate-icon">🔐</div>
      <h2>${t('adminPanel')}</h2>
      <p style="color:var(--text-muted); font-size:13.5px; margin-top:6px;">${t('adminGateDesc')}</p>
      <input type="password" id="adminPass" class="admin-gate-pass" placeholder="Password">
      <button class="btn btn-grad btn-block" id="adminLoginBtn">Login</button>
    </div>`;
  }
  const cloudCfg = getCloudConfig();
  return `
  <div class="admin-wrap fade-in">
    <div class="block-head admin-header">
      <div><span class="eyebrow">${t('adminEyebrow')}</span><h2>${t('adminTitle')}</h2></div>
      <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
        <button class="btn btn-outline btn-sm" id="exportGamesDataBtn">📥 تصدير (JSON)</button>
        <button class="btn btn-outline btn-sm" id="openCloudModalBtn">${t('cloudSettingsBtn')}</button>
        <button class="btn btn-outline btn-sm" id="openPassModalBtn">🔑 ${t('changePasswordBtn')}</button>
        <button class="btn btn-outline btn-sm" id="adminLogout">${t('logout')}</button>
      </div>
    </div>
    
    <div class="banner-note">
      ${t('adminBannerNote')}
    </div>

    <div class="admin-grid">
      
      <!-- ADD / EDIT GAME FORM PANEL -->
      <div class="panel" id="adminFormPanel">
        <h3 id="formPanelTitle" style="margin:0 0 16px; font-size:17px;">${t('addGame')}</h3>
        <form id="gameAdminForm">
          <input type="hidden" id="editGameIdVal" value="">
          
          <div class="admin-form-group">
            <label class="admin-form-label">${t('gameName')}</label>
            <input required id="gName" class="admin-input" placeholder="e.g. EA Sports FC 26">
          </div>
          
          <!-- COVER IMAGE INPUT WITH FILE UPLOAD -->
          <div class="admin-form-group">
            <label class="admin-form-label">${t('coverImage')}</label>
            
            <div style="display:flex; flex-direction:column; gap:8px;">
              <label class="admin-file-label">
                📂 ${t('uploadCover')}
                <input type="file" id="gImageFile" accept="image/*" style="display:none;">
              </label>
              
              <span style="font-size:11.5px; color:var(--text-faint); text-align:center;">— ${t('orEnterUrl')} —</span>
              
              <input id="gImage" class="admin-input" style="border-radius:999px;" placeholder="/assets/image of the games/FC26.jpg أو https://...">
            </div>

            <!-- IMAGE PREVIEW THUMB -->
            <div id="imagePreviewBox" style="margin-top:8px; display:none; align-items:center; gap:10px; background:var(--bg-soft); padding:8px 12px; border-radius:10px; border:1px solid var(--border);">
              <div id="previewThumb" style="width:42px; height:56px; border-radius:6px; background-size:cover; background-position:center; flex-shrink:0;"></div>
              <span style="font-size:12px; color:var(--text-muted);">معاينة الغلاف / Cover Preview</span>
            </div>
          </div>
          
          <div class="form-row-2">
            <div class="admin-form-group">
              <label class="admin-form-label">${t('genre')}</label>
              <select id="gGenre" class="admin-input">
                ${GENRES.map(g => `<option value="${g.id}">${g.icon} ${getLang(g.label)}</option>`).join('')}
              </select>
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">${t('preorder')}</label>
              <label style="background:var(--bg-soft); border:1px solid var(--border); padding:9px 12px; border-radius:9px; font-size:13px; display:flex; align-items:center; gap:8px; cursor:pointer; height:42px; box-sizing:border-box;">
                <input type="checkbox" id="gPreorder"> 🚀 ${t('preorder')}
              </label>
            </div>
          </div>
          
          <div class="admin-form-group">
            <label class="admin-form-label">${t('platforms')}</label>
            <div class="chip-select" style="display:flex; gap:12px;">
              <label style="background:var(--bg-soft); border:1px solid var(--border); padding:8px 14px; border-radius:999px; font-size:13px; display:flex; align-items:center; gap:6px; cursor:pointer;">
                <input type="checkbox" value="ps4" id="chkPs4" checked> PS4
              </label>
              <label style="background:var(--bg-soft); border:1px solid var(--border); padding:8px 14px; border-radius:999px; font-size:13px; display:flex; align-items:center; gap:6px; cursor:pointer;">
                <input type="checkbox" value="ps5" id="chkPs5" checked> PS5
              </label>
            </div>
          </div>
          
          <div class="admin-form-group">
            <label class="admin-form-label">${t('descTitle')}</label>
            <textarea id="gDescAr" class="admin-input" rows="2" placeholder="..." style="resize:vertical;"></textarea>
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label">${t('descEnTitle')}</label>
            <textarea id="gDescEn" class="admin-input" rows="2" placeholder="..." style="resize:vertical;"></textarea>
          </div>

          <div style="display:flex; gap:10px; margin-top:8px;">
            <button class="btn btn-grad" id="formSubmitBtn" type="submit" style="flex:1;">${t('addBtn')}</button>
            <button class="btn btn-outline" id="cancelEditBtn" type="button" style="display:none;">${t('cancelBtn')}</button>
          </div>
        </form>
      </div>

      <!-- GAME LIST PANEL -->
      <div class="panel">
        <div class="admin-list-head" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="margin:0; font-size:17px;">${t('currentGames')}</h3>
          <span id="gameCountBadge" style="font-size:12px; color:var(--text-muted); background:var(--bg-soft); padding:4px 10px; border-radius:999px;"></span>
        </div>

        <!-- REAL-TIME SEARCH FILTER INPUT FOR ADMIN -->
        <div style="margin-bottom:14px;">
          <input type="text" id="adminSearchInput" class="admin-input" placeholder="${t('adminSearchPlaceholder')}" style="border-radius:999px;">
        </div>

        <div class="admin-list" id="adminList"></div>
      </div>
    </div>

    <!-- CHANGE PASSWORD MODAL -->
    <div class="modal-overlay" id="changePassModal" aria-hidden="true" role="dialog">
      <div class="modal-card slide-up" style="max-width:400px;">
        <button class="modal-close" id="closePassModalBtn" type="button" aria-label="Close">&times;</button>
        <div class="modal-header">
          <h3>🔑 ${t('changePasswordTitle')}</h3>
        </div>
        <form id="changePassForm">
          <div class="admin-form-group">
            <label class="admin-form-label">${t('currentPassword')}</label>
            <input type="password" id="currPass" class="admin-input" required>
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label">${t('newPassword')}</label>
            <input type="password" id="newPass" class="admin-input" required minlength="4">
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label">${t('confirmNewPassword')}</label>
            <input type="password" id="confirmPass" class="admin-input" required minlength="4">
          </div>
          <button class="btn btn-grad btn-block" type="submit" style="margin-top:14px;">
            💾 ${t('saveNewPasswordBtn')}
          </button>
        </form>
      </div>
    </div>

    <!-- CLOUD SETTINGS MODAL -->
    <div class="modal-overlay" id="cloudSettingsModal" aria-hidden="true" role="dialog">
      <div class="modal-card slide-up" style="max-width:480px;">
        <button class="modal-close" id="closeCloudModalBtn" type="button" aria-label="Close">&times;</button>
        <div class="modal-header">
          <h3>${t('cloudSettingsTitle')}</h3>
        </div>
        <p style="font-size:12.5px; color:var(--text-muted); margin-bottom:14px;">${t('cloudSettingsDesc')}</p>
        <form id="cloudSettingsForm">
          <div class="admin-form-group">
            <label class="admin-form-label">${t('imgbbKeyLabel')}</label>
            <input type="text" id="cfgImgbbKey" class="admin-input" placeholder="e.g. 1a2b3c4d5e6f..." value="${cloudCfg.imgbbKey}">
            <span style="font-size:11px; color:var(--text-faint); display:block; margin-top:4px;">
              ${t('imgbbHint')} <a href="https://imgbb.com/signup" target="_blank" style="color:var(--accent); font-weight:bold;">imgbb.com</a>
            </span>
          </div>

          <div style="border-top:1px dashed var(--border); margin:14px 0; padding-top:14px;">
            <b style="font-size:13px; color:var(--text-bright); display:block; margin-bottom:10px;">⚡ مزامنة بيانات الألعاب مع سحابة JSONBin / API</b>
            
            <div class="admin-form-group">
              <label class="admin-form-label">${t('jsonbinIdLabel')}</label>
              <input type="text" id="cfgJsonbinId" class="admin-input" placeholder="e.g. 65f... (Bin ID)" value="${cloudCfg.jsonbinId}">
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">${t('jsonbinKeyLabel')}</label>
              <input type="password" id="cfgJsonbinKey" class="admin-input" placeholder="$2a$10$..." value="${cloudCfg.jsonbinKey}">
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">${t('customApiLabel')}</label>
              <input type="url" id="cfgCustomApi" class="admin-input" placeholder="https://my-api.com/games" value="${cloudCfg.customApi}">
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px; margin-top:14px;">
            <button class="btn btn-grad btn-block" type="submit">
              💾 ${t('saveCloudSettingsBtn')}
            </button>
            <button class="btn btn-outline btn-block" id="manualSyncBtn" type="button">
              ${t('syncNowBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>`;
}

export function compressImage(file, maxWidth = 800, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadImageToImgBB(fileOrDataUrl, apiKey) {
  let blob = fileOrDataUrl;
  if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:')) {
    const arr = fileOrDataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    blob = new Blob([u8arr], { type: mime });
  }

  const formData = new FormData();
  formData.append('image', blob);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) throw new Error('ImgBB status ' + res.status);
  const json = await res.json();
  if (json && json.data && json.data.url) {
    return json.data.url;
  }
  throw new Error('Invalid response');
}

export function updateImagePreview(url) {
  const previewBox = document.querySelector('#imagePreviewBox');
  const previewThumb = document.querySelector('#previewThumb');
  if (!previewBox || !previewThumb) return;

  if (url) {
    previewThumb.style.backgroundImage = `url('${url.replace(/'/g, "%27")}')`;
    previewBox.style.display = 'flex';
  } else {
    previewBox.style.display = 'none';
  }
}

export function renderAdminList(query = '') {
  const wrap = document.querySelector('#adminList');
  if (!wrap) return;
  const ALL_GAMES = getGames();
  const rawQ = (query || '').toLowerCase().trim();

  const GAMES = rawQ ? ALL_GAMES.filter(g => 
    g.name.toLowerCase().includes(rawQ) || 
    (g.genre && g.genre.toLowerCase().includes(rawQ)) ||
    (g.consoles && g.consoles.some(c => c.toLowerCase().includes(rawQ)))
  ) : ALL_GAMES;

  const consoleLabel = c => c === 'ps5' ? 'PS5' : 'PS4';
  
  const badgeCount = document.querySelector('#gameCountBadge');
  if (badgeCount) {
    badgeCount.textContent = rawQ ? `${GAMES.length} / ${ALL_GAMES.length}` : `${t('totalGames')}: ${ALL_GAMES.length}`;
  }

  if (GAMES.length === 0) {
    wrap.innerHTML = `<div style="padding:32px 16px; text-align:center; color:var(--text-muted); font-size:13.5px;">${t('noGamesFoundAdmin')}</div>`;
    return;
  }

  wrap.innerHTML = GAMES.map(g => {
    const genre = genreMap[g.genre] || GENRES[0];
    const isHidden = g.hidden;
    const hideStatusText = isHidden ? t('hiddenBadge') : t('visibleBadge');
    const bgStyle = safeBgStyle(g.image);

    return `
    <div class="admin-row ${isHidden ? 'is-hidden-row' : ''}">
      <div class="admin-row-main">
        <div class="thumb" style="width:42px; height:56px; border-radius:6px; background:var(--gradient); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; ${bgStyle} background-size:cover; background-position:center;">
          ${!g.image ? genre.icon : ''}
        </div>
        <div class="meta" style="flex:1; min-width:0;">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <b style="font-size:13.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;">${g.name}</b>
            <span style="font-size:10.5px; padding:2px 7px; border-radius:999px; background:${isHidden ? 'rgba(255,100,100,0.15)' : 'rgba(74,222,128,0.15)'}; color:${isHidden ? '#ff6b6b' : '#4ade80'}; font-weight:700;">${hideStatusText}</span>
          </div>
          <span style="font-size:11.5px; color:var(--text-muted); display:block; margin-top:2px;">
            ${g.consoles.map(consoleLabel).join(' / ')} · ${getLang(genre.label)} ${g.preorder ? '🚀' : ''}
          </span>
        </div>
      </div>
      
      <div class="actions">
        <button class="btn-admin-act toggle-preorder-btn" data-preorder="${g.id}" title="${g.preorder ? t('preorderToggleOff') : t('preorderToggleOn')}" style="padding:6px 10px; border-radius:7px; background:${g.preorder ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.05)'}; border:1px solid ${g.preorder ? 'rgba(6,182,212,0.5)' : 'var(--border)'}; color:${g.preorder ? 'var(--cyan)' : 'var(--text-muted)'}; font-size:12.5px; cursor:pointer; font-family:inherit; font-weight:600; display:flex; align-items:center; gap:4px;">
          ${g.preorder ? '🚀 ' + t('preorderToggleOff') : '🚀 ' + t('preorderToggleOn')}
        </button>
        <button class="btn-admin-act edit-game-btn" data-edit="${g.id}" title="${t('editBtn')}" style="padding:6px 10px; border-radius:7px; background:rgba(62,140,255,0.15); border:1px solid rgba(62,140,255,0.3); color:#3e8cff; font-size:12.5px; cursor:pointer; font-family:inherit; font-weight:600; display:flex; align-items:center; gap:4px;">
          ✏️ ${t('editBtn')}
        </button>
        <button class="btn-admin-act toggle-hide-btn" data-hide="${g.id}" title="${isHidden ? t('showBtn') : t('hideBtn')}" style="padding:6px 10px; border-radius:7px; background:${isHidden ? 'rgba(74,222,128,0.15)' : 'rgba(255,170,0,0.15)'}; border:1px solid ${isHidden ? 'rgba(74,222,128,0.3)' : 'rgba(255,170,0,0.3)'}; color:${isHidden ? '#4ade80' : '#ffaa00'}; font-size:12.5px; cursor:pointer; font-family:inherit; font-weight:600; display:flex; align-items:center; gap:4px;">
          ${isHidden ? '👁️ ' + t('showBtn') : '🙈 ' + t('hideBtn')}
        </button>
        <button class="btn-admin-act del-game-btn" data-del="${g.id}" title="${t('deleteBtn')}" style="padding:6px 8px; border-radius:7px; background:rgba(255,80,80,0.1); border:1px solid rgba(255,80,80,0.25); color:#ff5050; font-size:12.5px; cursor:pointer;">
          🗑
        </button>
      </div>
    </div>`;
  }).join('');
}

export function populateEditForm(id) {
  const GAMES = getGames();
  const g = GAMES.find(x => x.id === id);
  if (!g) return;

  editingGameId = id;
  document.querySelector('#editGameIdVal').value = id;
  document.querySelector('#gName').value = g.name || '';
  document.querySelector('#gImage').value = g.image || '';
  document.querySelector('#gGenre').value = g.genre || 'action';
  document.querySelector('#gPreorder').checked = !!g.preorder;
  document.querySelector('#chkPs4').checked = g.consoles.includes('ps4');
  document.querySelector('#chkPs5').checked = g.consoles.includes('ps5');
  document.querySelector('#gDescAr').value = g.desc?.ar || (typeof g.desc === 'string' ? g.desc : '');
  document.querySelector('#gDescEn').value = g.desc?.en || '';

  updateImagePreview(g.image);

  const titleEl = document.querySelector('#formPanelTitle');
  const submitBtn = document.querySelector('#formSubmitBtn');
  const cancelBtn = document.querySelector('#cancelEditBtn');

  if (titleEl) titleEl.textContent = `📝 ${t('editGameTitle')}: ${g.name}`;
  if (submitBtn) submitBtn.textContent = t('saveEditBtn');
  if (cancelBtn) cancelBtn.style.display = 'inline-block';

  document.querySelector('#adminFormPanel')?.scrollIntoView({ behavior: 'smooth' });
}

export function resetAdminForm() {
  editingGameId = null;
  const form = document.querySelector('#gameAdminForm');
  if (form) form.reset();
  
  document.querySelector('#editGameIdVal').value = '';
  document.querySelector('#chkPs4').checked = true;
  document.querySelector('#chkPs5').checked = true;
  updateImagePreview('');
  
  const titleEl = document.querySelector('#formPanelTitle');
  const submitBtn = document.querySelector('#formSubmitBtn');
  const cancelBtn = document.querySelector('#cancelEditBtn');

  if (titleEl) titleEl.textContent = t('addGame');
  if (submitBtn) submitBtn.textContent = t('addBtn');
  if (cancelBtn) cancelBtn.style.display = 'none';
}

export function setAdminAuthed(val) {
  adminAuthed = val;
}
