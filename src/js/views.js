import { CONFIG, GENRES, genreMap, PSPLUS_TIERS, PSN_GIFT_CARDS, getGames, normalizeQuery } from './data.js';
import { consoleLabel } from './main.js';
import { t, currentLang } from './i18n.js';

function getLang(obj) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[currentLang] || obj['ar'] || '';
}

export function safeBgStyle(img) {
  if (!img) return '';
  const safeUrl = img.replace(/'/g, "%27");
  return `background-image: url('${safeUrl}');`;
}

export function gameCard(g) {
  const isBoth = g.consoles.includes('ps4') && g.consoles.includes('ps5');
  const isPs5Only = !isBoth && g.consoles.includes('ps5');
  
  let cLabel = 'PS5';
  let badgeClass = 'badge-ps5';
  
  if (isBoth) {
    cLabel = 'PS4 • PS5';
    badgeClass = 'badge-both';
  } else if (isPs5Only) {
    cLabel = 'PS5';
    badgeClass = 'badge-ps5';
  } else {
    cLabel = 'PS4';
    badgeClass = 'badge-ps4';
  }

  const genre = genreMap[g.genre] || GENRES[0];
  const preorderBanner = g.preorder
    ? `<span class="badge-preorder" aria-hidden="true">${t('preorder')}</span>`
    : '';

  const safeUrl = g.image ? g.image.replace(/'/g, "%27") : '';

  return `
  <a class="game-card" href="#game/${g.id}" aria-label="${g.name} — ${cLabel}">
    <div class="game-cover cover-skeleton">
      ${preorderBanner}
      ${safeUrl ? `
        <img src="${safeUrl}" alt="${g.name}" class="card-img smooth-img" loading="lazy" decoding="async" onload="this.classList.add('loaded')" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';">
        <span style="display:none; font-size:52px; justify-content:center; align-items:center; width:100%; height:100%;">${genre.icon}</span>
      ` : `
        <span style="font-size:52px; display:flex; justify-content:center; align-items:center; width:100%; height:100%;">${genre.icon}</span>
      `}
      <span class="badge ${badgeClass}">${cLabel}</span>
    </div>
    <div class="game-info">
      <h3>${g.name}</h3>
      <span class="genre">${genre.icon} ${getLang(genre.label)}</span>
      <span class="more">${g.preorder ? t('preorderBtn') + ' ←' : t('showPackages')}</span>
    </div>
  </a>`;
}

const ITEMS_PER_PAGE = 24;

export function renderPagination(currentPage, totalPages) {
  if (totalPages <= 1) return '';

  let pageButtons = [];
  pageButtons.push(1);

  const rangeStart = Math.max(2, currentPage - 2);
  const rangeEnd = Math.min(totalPages - 1, currentPage + 2);

  if (rangeStart > 2) {
    pageButtons.push('...');
  }

  for (let i = rangeStart; i <= rangeEnd; i++) {
    pageButtons.push(i);
  }

  if (rangeEnd < totalPages - 1) {
    pageButtons.push('...');
  }

  if (totalPages > 1) {
    pageButtons.push(totalPages);
  }

  const prevDisabled = currentPage === 1 ? 'disabled' : '';
  const nextDisabled = currentPage === totalPages ? 'disabled' : '';

  return `
  <div class="pagination-bar" role="navigation" aria-label="Pagination Navigation">
    <button class="page-btn page-nav-btn" data-page="${currentPage - 1}" ${prevDisabled}>
      ◄ ${t('prevPage')}
    </button>

    <div class="page-numbers">
      ${pageButtons.map(p => {
        if (p === '...') return `<span class="page-ellipsis">...</span>`;
        const activeClass = p === currentPage ? 'active' : '';
        return `<button class="page-btn ${activeClass}" data-page="${p}">${p}</button>`;
      }).join('')}
    </div>

    <button class="page-btn page-nav-btn" data-page="${currentPage + 1}" ${nextDisabled}>
      ${t('nextPage')} ►
    </button>
  </div>
  <div class="pagination-info">
    ${t('pageLabel')} ${currentPage} / ${totalPages}
  </div>`;
}

export let catalogFilterState = {
  genre: 'all',
  platform: 'all',
  sort: 'default',
  search: '',
  page: 1
};

export function setCatalogFilterState(partial) {
  catalogFilterState = { ...catalogFilterState, ...partial };
}

export function renderCatalogBlock(filterOverrides = {}) {
  const state = { ...catalogFilterState, ...filterOverrides };
  const ALL_GAMES = getGames().filter(g => !g.hidden);

  // Filter by Platform
  let platformFiltered = ALL_GAMES;
  if (state.platform === 'ps5') {
    platformFiltered = ALL_GAMES.filter(g => g.consoles.length === 1 && g.consoles.includes('ps5'));
  } else if (state.platform === 'ps4') {
    platformFiltered = ALL_GAMES.filter(g => g.consoles.length === 1 && g.consoles.includes('ps4'));
  } else if (state.platform === 'both') {
    platformFiltered = ALL_GAMES.filter(g => g.consoles.includes('ps4') && g.consoles.includes('ps5'));
  }

  // Filter by Search Query
  let searchFiltered = platformFiltered;
  if (state.search && state.search.trim()) {
    const rawQ = state.search.toLowerCase().trim();
    const normalizedQ = normalizeQuery(rawQ);
    searchFiltered = platformFiltered.filter(g => {
      const n = g.name.toLowerCase();
      const dAr = (g.desc?.ar || '').toLowerCase();
      const dEn = (g.desc?.en || '').toLowerCase();
      return n.includes(rawQ) || n.includes(normalizedQ) || dAr.includes(rawQ) || dEn.includes(rawQ);
    });
  }

  // Genre counts based on current platform & search
  const genreCounts = { all: searchFiltered.length };
  GENRES.forEach(gen => {
    genreCounts[gen.id] = searchFiltered.filter(g => g.genre === gen.id).length;
  });

  // Filter by Genre
  let genreFiltered = searchFiltered;
  if (state.genre !== 'all') {
    genreFiltered = searchFiltered.filter(g => g.genre === state.genre);
  }

  // Sort games
  let sortedGames = [...genreFiltered];
  if (state.sort === 'name-asc') {
    sortedGames.sort((a, b) => a.name.localeCompare(b.name));
  } else if (state.sort === 'name-desc') {
    sortedGames.sort((a, b) => b.name.localeCompare(a.name));
  }

  const pageNum = Math.max(1, parseInt(state.page, 10) || 1);
  const totalPages = Math.max(1, Math.ceil(sortedGames.length / ITEMS_PER_PAGE));
  const currentPageNum = Math.min(pageNum, totalPages);
  
  const startIndex = (currentPageNum - 1) * ITEMS_PER_PAGE;
  const pagedGames = sortedGames.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const paginationHtml = renderPagination(currentPageNum, totalPages);

  const hasActiveFilters = state.genre !== 'all' || state.platform !== 'all' || state.sort !== 'default' || (state.search && state.search.trim());

  return `
  <section class="block fade-in" id="catalogBlock">
    <div class="block-head" style="margin-bottom:18px;">
      <div>
        <span class="eyebrow">${t('fullLibrary')}</span>
        <h2>${t('all')}</h2>
      </div>
    </div>

    <!-- Interactive Filter Toolbar -->
    <div class="catalog-filters">
      <div class="filter-top-row">
        <div class="filter-search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--cyan); flex-shrink:0;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="catalogSearchInput" placeholder="${t('searchPlaceholder')}" value="${state.search || ''}">
        </div>

        <div class="filter-controls-group">
          <!-- Sort Dropdown -->
          <select id="catalogSortSelect" class="filter-select" aria-label="${t('filterSort')}">
            <option value="default" ${state.sort === 'default' ? 'selected' : ''}>✨ ${t('sortFeatured')}</option>
            <option value="name-asc" ${state.sort === 'name-asc' ? 'selected' : ''}>🔤 ${t('sortNameAsc')}</option>
            <option value="name-desc" ${state.sort === 'name-desc' ? 'selected' : ''}>🔤 ${t('sortNameDesc')}</option>
          </select>

          <!-- Reset Filter Button -->
          ${hasActiveFilters ? `
            <button id="catalogResetBtn" class="filter-reset-btn" title="${t('filterReset')}">
              ✕ ${t('filterReset')}
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Platform Selection Pills -->
      <div class="filter-platforms-row" role="group" aria-label="${t('filterByPlatform')}">
        <button class="filter-platform-btn ${state.platform === 'all' ? 'active' : ''}" data-platform="all">
          🎮 ${t('allPlatforms')}
        </button>
        <button class="filter-platform-btn ${state.platform === 'ps5' ? 'active' : ''}" data-platform="ps5">
          <span style="color:var(--cyan);">PS5</span> ${t('platformPs5Only')}
        </button>
        <button class="filter-platform-btn ${state.platform === 'both' ? 'active' : ''}" data-platform="both">
          <span style="color:var(--purple-light);">PS4 & PS5</span> ${t('platformCrossGen')}
        </button>
      </div>

      <!-- Genre Chips -->
      <div class="chip-row" id="catalogGenreChips" role="group" aria-label="${t('filterByGenre')}">
        <button class="chip ${state.genre === 'all' ? 'active' : ''}" data-genre="all">
          ${t('all')} (${genreCounts.all})
        </button>
        ${GENRES.map(gen => (genreCounts[gen.id] !== undefined)
          ? `<button class="chip ${state.genre === gen.id ? 'active' : ''}" data-genre="${gen.id}">
               ${gen.icon} ${getLang(gen.label)} (${genreCounts[gen.id] || 0})
             </button>`
          : ''
        ).join('')}
      </div>

      <!-- Meta count summary -->
      <div class="filter-meta-bar">
        <span>${t('showingGamesCount').replace('{count}', `<span class="filter-meta-count">${sortedGames.length}</span>`)}</span>
        <span>${t('pageLabel')} ${currentPageNum} / ${totalPages}</span>
      </div>
    </div>

    <!-- Games Grid or Empty State -->
    ${pagedGames.length ? `
      <div class="game-grid">${pagedGames.map(gameCard).join('')}</div>
      ${paginationHtml}
    ` : `
      <div style="padding:50px 20px; text-align:center; color:var(--text-muted); background:var(--card); border:1px dashed var(--border); border-radius:var(--radius); margin-top:20px;">
        <div style="font-size:40px; margin-bottom:12px;">🔍</div>
        <h3 style="font-size:18px; color:var(--text); margin-bottom:8px;">${t('noFilterResults')}</h3>
        <p style="font-size:14px; margin-bottom:16px;">${t('noSearchRes')}</p>
        <button id="catalogResetEmptyBtn" class="btn btn-outline btn-sm">✕ ${t('filterReset')}</button>
      </div>
    `}
  </section>`;
}

export function viewHome(pageArg = 1) {
  const ALL_GAMES = getGames().filter(g => !g.hidden);
  const preOrders = ALL_GAMES.filter(g => g.preorder);

  const preorderBlock = preOrders.length > 0 ? `
  <section class="block fade-in" id="preorderBlock" style="margin-top:10px; margin-bottom:20px;">
    <div class="block-head" style="margin-bottom:16px;">
      <div>
        <span class="eyebrow" style="color:var(--cyan); font-weight:800;">🚀 PRE-ORDER NOW</span>
        <h2>${t('preorderSectionTitle')} (${preOrders.length})</h2>
      </div>
    </div>
    <div class="game-grid">${preOrders.map(gameCard).join('')}</div>
  </section>` : '';

  return `
  <section class="hero fade-in" aria-label="${t('heroTag')}">
    <div class="ring-glow"></div>
    <div class="hero-inner">
      <div class="hero-text">
        <span class="hero-tag eyebrow">${t('heroTag')}</span>
        <h1 class="slide-up" style="animation-delay:0.1s">${t('heroTitle')}</h1>
        <p class="lead slide-up" style="animation-delay:0.2s">${t('heroDesc')}</p>
        <div class="hero-cta slide-up" style="animation-delay:0.3s">
          <a href="#catalogBlock" class="btn btn-grad pulse">${t('btnBrowseAll')}</a>
          <a href="#psplus" class="btn btn-outline">${t('btnPsPlus')}</a>
          <a href="#giftcards" class="btn btn-outline" style="border-color:var(--cyan); color:var(--cyan);"><span style="color:var(--cyan);">💳</span> ${t('btnGiftCards')}</a>
        </div>
      </div>
      <div class="hero-emblem-wrap slide-up" style="animation-delay:0.15s">
        <img src="/assets/logo.png" alt="GG Store logo">
      </div>
    </div>
  </section>

  <section class="block" aria-label="${t('trustFast')}">
    <div class="trust-bar">
      <div class="trust-item">
        <div class="ic">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
        </div>
        <div class="t">${t('trustFast')}</div>
        <div class="d">${t('trustFastDesc')}</div>
      </div>
      <div class="trust-item">
        <div class="ic">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        </div>
        <div class="t">${t('trustSafe')}</div>
        <div class="d">${t('trustSafeDesc')}</div>
      </div>
      <div class="trust-item">
        <div class="ic">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </div>
        <div class="t">${t('trustSupport')}</div>
        <div class="d">${t('trustSupportDesc')}</div>
      </div>
      <div class="trust-item">
        <div class="ic">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
        </div>
        <div class="t">${t('trustNoContract')}</div>
        <div class="d">${t('trustNoContractDesc')}</div>
      </div>
    </div>
  </section>

  ${preorderBlock}

  ${renderCatalogBlock(pageArg)}
  `;
}

export function viewConsole(c, activeGenre = 'all') {
  const ALL_GAMES = getGames().filter(g => !g.hidden);
  let cName = 'PS4 / PS5';
  let gamesList = [];

  if (c === 'ps5') {
    cName = t('consoleTitlePs5');
    gamesList = ALL_GAMES.filter(g => g.consoles.length === 1 && g.consoles.includes('ps5'));
  } else if (c === 'ps4') {
    cName = t('consoleTitlePs4');
    gamesList = ALL_GAMES.filter(g => g.consoles.length === 1 && g.consoles.includes('ps4'));
  } else if (c === 'both') {
    cName = t('consoleTitleBoth');
    gamesList = ALL_GAMES.filter(g => g.consoles.includes('ps4') && g.consoles.includes('ps5'));
  } else {
    cName = 'PS4 / PS5';
    gamesList = ALL_GAMES;
  }

  const counts = { all: gamesList.length };
  GENRES.forEach(gen => {
    counts[gen.id] = gamesList.filter(g => g.genre === gen.id).length;
  });

  const filtered = activeGenre === 'all'
    ? gamesList
    : gamesList.filter(g => g.genre === activeGenre);

  return `
  <section class="block fade-in" aria-label="${cName}">
    <div class="block-head">
      <div><span class="eyebrow">${t('fullLibrary')}</span><h2>${cName}</h2></div>
    </div>

    <div class="chip-row" id="genreChips" role="group" aria-label="${t('filterByGenre')}">
      <button class="chip ${activeGenre === 'all' ? 'active' : ''}" data-genre="all">
        ${t('all')} (${counts.all})
      </button>
      ${GENRES.map(gen => counts[gen.id] > 0
        ? `<button class="chip ${activeGenre === gen.id ? 'active' : ''}" data-genre="${gen.id}" aria-pressed="${activeGenre === gen.id}">
             ${gen.icon} ${getLang(gen.label)} (${counts[gen.id]})
           </button>`
        : ''
      ).join('')}
    </div>

    ${filtered.length
      ? `<div class="game-grid">${filtered.map(gameCard).join('')}</div>`
      : `<div style="padding:40px;text-align:center;color:var(--text-muted);">${t('noGames')}</div>`
    }
  </section>`;
}

const FRANCHISE_PATTERNS = [
  { stem: 'gta', patterns: ['grand theft auto', 'gta'] },
  { stem: 'fc', patterns: ['ea sports fc', 'fifa', 'fc 2'] },
  { stem: 'cod', patterns: ['call of duty', 'black ops', 'modern warfare', 'warzone', 'cod'] },
  { stem: 'gow', patterns: ['god of war', 'gow'] },
  { stem: 'spiderman', patterns: ['spider-man', 'spiderman', 'spider man'] },
  { stem: 'tlou', patterns: ['the last of us', 'last of us', 'tlou'] },
  { stem: 're', patterns: ['resident evil', 'biohazard'] },
  { stem: 'rdr', patterns: ['red dead', 'rdr'] },
  { stem: 'horizon', patterns: ['horizon zero', 'horizon forbidden', 'horizon call'] },
  { stem: 'ac', patterns: ['assassin\'s creed', 'assassins creed'] },
  { stem: 'tekken', patterns: ['tekken'] },
  { stem: 'mk', patterns: ['mortal kombat'] },
  { stem: 'nba', patterns: ['nba 2k'] },
  { stem: 'wwe', patterns: ['wwe 2k'] },
  { stem: 'ufc', patterns: ['ufc'] },
  { stem: 'nfs', patterns: ['need for speed', 'nfs'] },
  { stem: 'gt', patterns: ['gran turismo'] },
  { stem: 'ff', patterns: ['final fantasy'] },
  { stem: 'mh', patterns: ['monster hunter'] },
  { stem: 'farcry', patterns: ['far cry'] },
  { stem: 'bf', patterns: ['battlefield'] },
  { stem: 'souls', patterns: ['dark souls', 'demon\'s souls', 'demons souls', 'elden ring', 'bloodborne'] },
  { stem: 'ds', patterns: ['death stranding'] },
  { stem: 'sh', patterns: ['silent hill'] },
  { stem: 'db', patterns: ['dragon ball', 'sparking! zero'] },
  { stem: 'naruto', patterns: ['naruto', 'boruto'] },
  { stem: 'crash', patterns: ['crash bandicoot', 'crash team'] },
  { stem: 'ratchet', patterns: ['ratchet & clank', 'ratchet and clank'] },
  { stem: 'uncharted', patterns: ['uncharted'] },
  { stem: 'batman', patterns: ['batman', 'arkham', 'gotham knights'] },
  { stem: 'starwars', patterns: ['star wars', 'jedi: survivor', 'jedi: fallen'] },
  { stem: 'tombraider', patterns: ['tomb raider', 'lara croft'] },
  { stem: 'metro', patterns: ['metro 2033', 'metro last light', 'metro exodus', 'metro awakening'] },
  { stem: 'fallout', patterns: ['fallout'] },
  { stem: 'witcher', patterns: ['the witcher', 'witcher'] },
  { stem: 'persona', patterns: ['persona'] },
  { stem: 'mafia', patterns: ['mafia'] },
  { stem: 'watchdogs', patterns: ['watch dogs', 'watch_dogs'] },
  { stem: 'hitman', patterns: ['hitman'] },
  { stem: 'deadspace', patterns: ['dead space'] },
  { stem: 'alanwake', patterns: ['alan wake'] },
  { stem: 'plague', patterns: ['plague tale'] },
  { stem: 'yakuza', patterns: ['like a dragon', 'yakuza', 'judgment'] },
  { stem: 'sonic', patterns: ['sonic'] },
  { stem: 'lego', patterns: ['lego'] },
  { stem: 'borderlands', patterns: ['borderlands', 'tiny tina'] },
  { stem: 'lifeisstrange', patterns: ['life is strange'] },
  { stem: 'sniper', patterns: ['sniper elite', 'sniper ghost'] }
];

function getFranchiseStem(gameName) {
  const lower = gameName.toLowerCase();
  for (const f of FRANCHISE_PATTERNS) {
    if (f.patterns.some(p => lower.includes(p))) {
      return f.stem;
    }
  }
  const cleaned = lower
    .replace(/[\d:\-\(\)\.]+/g, ' ')
    .replace(/\b(part|volume|vol|edition|remastered|remake|definitive|deluxe|bundle|collection|series|hd|ps4|ps5)\b/gi, '')
    .trim();
  const words = cleaned.split(/\s+/).filter(w => w.length > 2);
  if (words.length >= 2) return words.slice(0, 2).join(' ');
  return words[0] || lower;
}

function getRelatedGames(target, allGames, limit = 4) {
  const targetStem = getFranchiseStem(target.name);
  const candidateGames = allGames.filter(x => !x.hidden && x.id !== target.id);

  // 1. Franchise parts / same series matches
  const franchiseMatches = candidateGames.filter(x => {
    const stem = getFranchiseStem(x.name);
    return stem && stem === targetStem;
  });

  // 2. Same genre matches
  const franchiseSet = new Set(franchiseMatches.map(x => x.id));
  const genreMatches = candidateGames.filter(x => !franchiseSet.has(x.id) && x.genre === target.genre);

  // 3. Fallback matching same platform
  const genreSet = new Set(genreMatches.map(x => x.id));
  const fallbackMatches = candidateGames.filter(x => !franchiseSet.has(x.id) && !genreSet.has(x.id));

  const list = [...franchiseMatches, ...genreMatches, ...fallbackMatches].slice(0, limit);
  const hasFranchise = franchiseMatches.length > 0;
  return { list, hasFranchise };
}

export function viewGame(id) {
  const GAMES = getGames();
  const g = GAMES.find(x => x.id === id);
  if (!g || g.hidden) return `
    <div style="padding:60px 0;text-align:center;">
      <h2>${t('gameNotFound')}</h2>
      <a href="#home" class="btn btn-outline">${t('backHome')}</a>
    </div>`;

  const genre = genreMap[g.genre] || GENRES[0];
  const { list: related, hasFranchise } = getRelatedGames(g, GAMES, 4);
  const relatedTitle = hasFranchise ? t('franchiseAndSimilar') : t('similarGames');
  const bgStyle = safeBgStyle(g.image) ? `${safeBgStyle(g.image)}background-size:cover;background-position:center;` : '';

  // Buy / Pre-order section
  const buySection = g.preorder ? `
    <div class="preorder-notice" role="status">
      ${t('preorderNotice')}
    </div>
    <div class="buy-row">
      <button class="btn btn-preorder btn-block" id="preorderBtn"
              aria-label="${t('preorderBtn')} — ${g.name}">
        🚀 ${t('preorderBtn')}
      </button>
    </div>` : `
    <div class="buy-row">
      <button class="btn btn-msg btn-block pulse" id="buyMsgBtn"
              aria-label="${t('buyMsg')} — ${g.name}">💬 ${t('buyMsg')}</button>
    </div>`;

  const safeUrl = g.image ? g.image.replace(/'/g, "%27") : '';

  return `
  <div class="fade-in">
    <div class="game-detail">
      <div>
        <div class="gallery-main cover-skeleton" style="position:relative; overflow:hidden;">
          ${safeUrl ? `
            <img src="${safeUrl}" alt="${g.name}" class="card-img smooth-img" loading="eager" fetchpriority="high" decoding="async" onload="this.classList.add('loaded')" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" style="width:100%; height:100%; object-fit:cover;">
            <span style="display:none; font-size:72px; justify-content:center; align-items:center; width:100%; height:100%;">${genre.icon}</span>
          ` : `
            <span class="cover-icon-large" aria-hidden="true">${genre.icon}</span>
          `}
        </div>
      </div>
      <div>
        <h1 class="detail-title">${g.name}</h1>
      <p class="detail-desc">${getLang(g.desc)}</p>
      <div class="detail-badges" style="margin-bottom:20px;">
        ${g.consoles.map(c => `<span class="pill">${consoleLabel(c)}</span>`).join('')}
        ${g.preorder ? `<span class="pill pill-preorder">🚀 ${t('preorder')}</span>` : ''}
        <span class="pill">${genre.icon} ${getLang(genre.label)}</span>
      </div>

      ${g.versions && g.versions.length ? `
      <div class="version-box">
        <div style="margin-bottom:8px;"><b>${t('versionsAvailable')}</b> ${g.versions.join(' / ')}</div>
        ${g.versionNote ? `<div style="font-size:12.5px;">💡 ${getLang(g.versionNote)}</div>` : ''}
      </div>` : ''}

      <div class="policy-box" aria-label="${t('readBefore')}">
        <div class="ph">⚠️ ${t('readBefore')}</div>
        <ul>
          ${CONFIG.defaultPolicy.map(p => `<li>${getLang(p)}</li>`).join('')}
        </ul>
      </div>

      <div class="selectors">
        ${g.versions && g.versions.length ? `
        <div class="field">
          <label for="selVersion">${t('selVersion')}</label>
          <select id="selVersion">
            ${g.versions.map(v => `<option value="${v}">${v}</option>`).join('')}
          </select>
        </div>` : ''}

        ${g.consoles && g.consoles.length > 1 ? `
        <div class="field">
          <label for="selPlatform">${t('selPlatform')}</label>
          <select id="selPlatform">
            ${g.consoles.map(c => `<option value="${consoleLabel(c)}">${consoleLabel(c)}</option>`).join('')}
          </select>
        </div>` : ''}

        ${g.languages && g.languages.length ? `
        <div class="field">
          <label for="selLang">${t('selLang')}</label>
          <select id="selLang">
            ${g.languages.map(l => `<option value="${l}">${l}</option>`).join('')}
          </select>
        </div>` : ''}

        ${g.accounts && g.accounts.length > 0 && !g.preorder ? `
        <div class="field">
          <label for="selAccount">${t('selAccount')}</label>
          <select id="selAccount">
            ${g.accounts.map(a => `<option value="${a}">${a}</option>`).join('')}
          </select>
        </div>` : ''}
      </div>

      ${buySection}
      ${!g.preorder ? `<p class="note-inline">${t('priceNote')}</p>` : ''}
    </div>
  </div>

  ${related.length ? `
  <section class="block">
    <div class="block-head"><div><h2>${relatedTitle}</h2></div></div>
    <div class="game-grid">${related.map(gameCard).join('')}</div>
  </section>` : ''}
  </div>
  `;
}

export function viewPsPlus() {
  return `
  <section class="block fade-in" aria-label="PlayStation Plus">
    <div class="psplus-banner">
      <div>
        <span class="eyebrow">PLAYSTATION PLUS</span>
        <h2>${t('compareTiers')}</h2>
        <p>${t('plusDesc')}</p>
      </div>
    </div>
    <div class="tier-grid">
      ${PSPLUS_TIERS.map((tier, i) => `
      <div class="tier-card slide-up ${tier.featured ? 'featured' : ''}" style="animation-delay:${i * 0.1}s">
        ${tier.featured ? `<span class="tag">${t('mostRequested')}</span>` : ''}
        <h3>${tier.name}</h3>
        <ul aria-label="${tier.name} features">
          ${tier.features.map(f => `<li>${getLang(f)}</li>`).join('')}
        </ul>
        <div class="field" style="margin-bottom:14px;">
          <label for="durSel-${tier.id}">${t('duration')}</label>
          <select id="durSel-${tier.id}" data-tier="${tier.id}" class="durSel" aria-label="${t('duration')} — ${tier.name}">
            <option value="${t('dur1')}">${t('dur1')}</option>
            <option value="${t('dur3')}">${t('dur3')}</option>
            <option value="${t('dur12')}">${t('dur12')}</option>
          </select>
        </div>
        <button class="btn btn-grad btn-block buyPlusBtn"
                data-tier="${tier.name}"
                aria-label="${t('subscribe')} ${tier.name}">
          ${t('subscribe')}
        </button>
      </div>`).join('')}
    </div>
  </section>`;
}

function getCountryFlagSvg(code) {
  const codeMap = { us: 'us', gb: 'gb', sa: 'sa', ae: 'ae' };
  const c = codeMap[code] || code;
  return `<img src="https://flagcdn.com/${c}.svg" width="24" height="18" alt="${c.toUpperCase()} Flag" class="giftcard-flag-img" loading="lazy">`;
}

export function viewGiftCards() {
  const giftLogoUrl = '/assets/image of the games/psn gift.png'.replace(/'/g, "%27");
  return `
  <section class="block fade-in" aria-label="PSN Gift Cards">
    <div class="giftcards-banner">
      <div class="giftcards-banner-content">
        <span class="eyebrow" style="color:var(--cyan); font-weight:800;">PLAYSTATION NETWORK (PSN)</span>
        <h2>${t('giftCardsTitle')}</h2>
        <p>${t('giftCardsSubtitle')}</p>
        <div class="giftcards-highlights">
          <span class="pill" style="border-color:var(--cyan); color:var(--cyan);">${t('giftCardsInstantBadge')}</span>
          <span class="pill" style="border-color:var(--purple-light); color:var(--purple-light);">🔒 ${t('giftCardsOfficial')}</span>
        </div>
      </div>
      <div class="giftcards-banner-badge">
        <img src="${giftLogoUrl}" alt="PSN Gift Cards" class="giftcards-main-logo">
      </div>
    </div>

    <div class="giftcards-grid">
      ${PSN_GIFT_CARDS.map((card, idx) => `
        <div class="giftcard-box slide-up" style="animation-delay:${idx * 0.1}s">
          <div class="giftcard-header">
            <div class="giftcard-region-info">
              <span class="giftcard-badge-pill">${card.badge}</span>
              <h3 class="giftcard-name">
                <span class="giftcard-flag-inline" aria-hidden="true">${getCountryFlagSvg(card.flagCode)}</span>
                <span>${getLang(card.country)}</span>
              </h3>
            </div>
          </div>

          <div class="giftcard-visual">
            <div class="giftcard-visual-top">
              <div class="giftcard-chip-sim">
                <svg width="30" height="26" viewBox="0 0 28 24" fill="none">
                  <rect width="28" height="24" rx="4" fill="url(#chipGrad)" />
                  <path d="M7 0v24M14 0v24M21 0v24M0 8h28M0 16h28" stroke="rgba(0,0,0,0.3)" stroke-width="1.5"/>
                  <defs>
                    <linearGradient id="chipGrad" x1="0" y1="0" x2="28" y2="24" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#E2B142"/>
                      <stop offset="1" stop-color="#9E731B"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div class="giftcard-official-logo">
                <img src="${giftLogoUrl}" alt="PSN Gift" class="giftcard-logo-img">
              </div>
            </div>
            <div class="giftcard-logo-area">
              <span class="giftcard-ps-logo">PlayStation Store</span>
              <span class="giftcard-active-val" id="valDisplay-${card.id}">${card.currency}${card.denominations[0]}</span>
            </div>
          </div>

          <div class="giftcard-selector-area">
            <label class="giftcard-label" for="denomSel-${card.id}">
              <span>${t('giftCardsSelectValue')}</span>
            </label>
            
            <div class="giftcard-chips-group" id="chipGroup-${card.id}">
              ${card.denominations.map((denom, i) => `
                <button type="button" 
                        class="giftcard-denom-btn ${i === 0 ? 'active' : ''}" 
                        data-card-id="${card.id}" 
                        data-value="${denom}" 
                        data-currency="${card.currency}"
                        aria-label="${card.currency}${denom}">
                  ${card.currency}${denom}
                </button>
              `).join('')}
            </div>

            <select id="denomSel-${card.id}" data-card="${card.id}" class="denomSel visually-hidden" aria-hidden="true">
              ${card.denominations.map(d => `<option value="${d}">${card.currency}${d}</option>`).join('')}
            </select>
          </div>

          <button class="btn btn-grad btn-block buyGiftCardBtn"
                  data-card-id="${card.id}"
                  data-country="${getLang(card.country)}"
                  data-currency="${card.currency}"
                  aria-label="${t('giftCardsOrderBtn')} — ${getLang(card.country)}">
            🛒 ${t('giftCardsOrderBtn')}
          </button>
        </div>
      `).join('')}
    </div>

    <!-- Custom Region / Not Listed Notice Box -->
    <div class="custom-region-box slide-up" style="margin-top:28px;">
      <div class="custom-region-inner">
        <div class="custom-region-icon">🌍</div>
        <div class="custom-region-text">
          <p>${t('giftCardsCustomRegionNotice')}</p>
        </div>
        <button type="button" id="openCustomRegionModalBtn" class="btn btn-msg custom-region-btn">
          ${t('giftCardsContactUs')}
        </button>
      </div>
    </div>
  </section>`;
}

export function viewHowTo() {
  const isEn = currentLang === 'en';
  const steps = [
    [isEn ? 'Browse' : 'تصفح', isEn ? 'Choose your console and explore games by genre.' : 'اختار جهازك (PS4/PS5) وتصفح الألعاب حسب النوع اللي بتحبه.'],
    [isEn ? 'Select Package' : 'اختار الباقة', isEn ? 'Go to the game page and pick your version, platform, and account type.' : 'ادخل صفحة اللعبة وحدد نسخة اللعبة، المنصة، ونوع الحساب المناسب ليك.'],
    [isEn ? 'Contact Us' : 'كلمنا', isEn ? 'Click "Order" to jump into a ready-made Messenger chat.' : 'اضغط "اطلب الآن" وهيتحول طلبك جاهز لماسنجر مباشرة.'],
    [isEn ? 'Receive Game' : 'استلم لعبتك', isEn ? 'Our team confirms details and delivers your account or code in minutes.' : 'فريقنا يأكدلك التفاصيل ويوصلك الحساب أو الكود خلال دقائق.']
  ];
  const faqs = [
    [
      isEn ? 'Why are there no prices listed?' : 'ليه مفيش أسعار على الموقع؟',
      isEn ? 'We provide real-time best pricing based on account availability and current offers via chat.' : 'عشان نقدر نوفرلك أفضل سعر لحظة بلحظة حسب توفر الحساب والعروض، فالتسعير بيتم مباشرة معانا على واتساب أو ماسنجر.'
    ],
    [
      isEn ? 'What is Primary / Secondary?' : 'إيه الفرق بين Primary وSecondary؟',
      isEn ? 'Primary: You can play the game on any account on your console, both online and offline.<br>Secondary: You play the game directly from the provided account, online only.' : 'Primary: تقدر تلعب اللعبة على أي حساب على جهازك سواء أونلاين أو أوفلاين.<br>Secondary: بتلعب اللعبة من الحساب اللي بندهولك وأونلاين فقط.'
    ],
    [
      isEn ? 'Are accounts guaranteed?' : 'هل الحسابات مضمونة؟',
      isEn ? 'Yes. We detail the usage policy and warranty terms before every purchase.' : 'آه، بنوضح سياسة الاستخدام وشروط الضمان بالتفصيل مع كل عملية شراء.'
    ]
  ];

  return `
  <section class="block fade-in">
    <div class="block-head"><div><span class="eyebrow">${t('guide')}</span><h2>${t('howToBuy')}</h2></div></div>
    <div class="steps" role="list">
      ${steps.map((s, i) => `
      <div class="step slide-up" style="animation-delay:${i * 0.1}s" role="listitem">
        <span class="n" aria-hidden="true">0${i + 1}</span>
        <h4>${s[0]}</h4>
        <p>${s[1]}</p>
      </div>`).join('')}
    </div>
  </section>
  <section class="block fade-in">
    <div class="block-head"><div><h2>${t('faq')}</h2></div></div>
    ${faqs.map((f, i) => `
    <details class="faq-item slide-up" style="animation-delay:${i * 0.1}s">
      <summary>${f[0]}</summary>
      <p>${f[1]}</p>
    </details>`).join('')}
  </section>`;
}

export function viewSearch(query) {
  const ALL_GAMES = getGames().filter(g => !g.hidden);
  const rawQ = query.toLowerCase().trim();
  const normalizedQ = normalizeQuery(rawQ);

  const results = ALL_GAMES.filter(g => {
    const n = g.name.toLowerCase();
    const dAr = (g.desc?.ar || '').toLowerCase();
    const dEn = (g.desc?.en || '').toLowerCase();

    // FIFA -> FC smart matching
    const isFifaQuery = rawQ.includes('fifa') || rawQ.includes('fc');
    const isFcGame = n.includes('fc') || n.includes('ea sports fc');

    // GTA matching
    const isGtaQuery = rawQ.includes('gta') || rawQ.includes('grand theft');
    const isGtaGame = n.includes('grand theft auto');

    // COD matching
    const isCodQuery = rawQ.includes('cod') || rawQ.includes('black ops') || rawQ.includes('call of duty');
    const isCodGame = n.includes('call of duty');

    return (
      n.includes(rawQ) ||
      n.includes(normalizedQ) ||
      dAr.includes(rawQ) ||
      dEn.includes(rawQ) ||
      (isFifaQuery && isFcGame) ||
      (isGtaQuery && isGtaGame) ||
      (isCodQuery && isCodGame)
    );
  });

  const aliasNote = (rawQ.includes('fifa') || rawQ.includes('fc') || normalizedQ !== rawQ) && results.length > 0
    ? `<p style="color:var(--purple-light);font-size:13px;margin-bottom:16px;">
        💡 ${currentLang === 'ar' ? `نتائج البحث عن: "${query}" (تشمل ألعاب EA Sports FC & FIFA)` : `Search results for: "${query}" (Includes EA Sports FC & FIFA games)`}
       </p>`
    : '';

  return `
  <section class="block fade-in" aria-label="${t('searchResults')}">
    <div class="block-head">
      <div>
        <span class="eyebrow">${t('searchResults')}</span>
        <h2>"${query}" (${results.length})</h2>
      </div>
    </div>
    ${aliasNote}
    ${results.length
      ? `<div class="game-grid">${results.map(gameCard).join('')}</div>`
      : `<div style="padding:40px;text-align:center;color:var(--text-muted);">${t('noSearchRes')}</div>`
    }
  </section>`;
}
