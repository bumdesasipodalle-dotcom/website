/**
 * BUMDESA SIPODALLE BATETANGNGA SEJAHTERA - APPLICATION LOGIC
 * Responsif Otomatis Desktop & Mobile + In-Page News Reader (Tanpa Modal)
 */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  setupNavigation();
  setupMobileMenu();
  setupHeaderScroll();
  renderAllSections();
  handleInitialHash();
}

/* ==========================================================================
   1. NAVIGATION & SPA ROUTING (DESKTOP + MOBILE APP BAR)
   ========================================================================== */
function setupNavigation() {
  // Desktop Header Links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPage = link.getAttribute('data-nav');
      if (targetPage) navigateTo(targetPage);
    });
  });

  // Mobile Bottom App Bar Links
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPage = item.getAttribute('data-bottom-nav');
      if (targetPage) navigateTo(targetPage);
    });
  });

  window.addEventListener('hashchange', () => {
    const rawHash = window.location.hash.replace('#', '');
    if (rawHash) {
      if (rawHash.startsWith('berita-')) {
        const newsId = parseInt(rawHash.replace('berita-', ''));
        navigateTo('berita', false);
        openNewsDetail(newsId, false);
      } else {
        navigateTo(rawHash, false);
      }
    }
  });
}

function navigateTo(pageId, updateHash = true) {
  const validPages = ['beranda', 'profil', 'berita', 'unit-usaha', 'laporan-keuangan'];
  if (!validPages.includes(pageId)) pageId = 'beranda';

  // If navigating back to berita list, ensure list view is shown
  if (pageId === 'berita' && updateHash) {
    backToNewsList(false);
  }

  // Hide all sections
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active-page'));
  const targetSection = document.getElementById(pageId);
  if (targetSection) targetSection.classList.add('active-page');

  // Update Desktop Nav Link States
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('data-nav') === pageId) link.classList.add('active');
    else link.classList.remove('active');
  });

  // Update Mobile Bottom Nav States
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    if (item.getAttribute('data-bottom-nav') === pageId) item.classList.add('active');
    else item.classList.remove('active');
  });

  // Close mobile drawer if open
  const navMenu = document.getElementById('navMenu');
  if (navMenu && navMenu.classList.contains('mobile-open')) {
    navMenu.classList.remove('mobile-open');
    const icon = document.getElementById('mobileToggle')?.querySelector('i');
    if (icon) icon.className = 'fa-solid fa-bars';
  }

  if (updateHash) history.pushState(null, null, `#${pageId}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleInitialHash() {
  const rawHash = window.location.hash.replace('#', '');
  if (rawHash) {
    if (rawHash.startsWith('berita-')) {
      const newsId = parseInt(rawHash.replace('berita-', ''));
      navigateTo('berita', false);
      openNewsDetail(newsId, false);
    } else {
      navigateTo(rawHash, false);
    }
  } else {
    navigateTo('beranda', false);
  }
}

/* ==========================================================================
   2. MOBILE MENU & HEADER SCROLL
   ========================================================================== */
function setupMobileMenu() {
  const toggleBtn = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.className = navMenu.classList.contains('mobile-open') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
      }
    });
  }
}

function setupHeaderScroll() {
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  });
}

/* ==========================================================================
   3. RENDERING DATA
   ========================================================================== */
function renderAllSections() {
  if (typeof BUMDES_DATA === 'undefined') return;

  renderStatsCounters();
  renderHomeUnitsPreview();
  renderHomeNewsPreview();
  renderTestimonials();
  renderProfileData();
  renderAllNews('Semua');
  renderAllUnits('Semua');
  renderFinancialTransparency();
}

function renderStatsCounters() {
  const container = document.getElementById('statsCounterContainer');
  if (!container) return;
  const data = BUMDES_DATA.statistik;
  const stats = [
    { icon: 'fa-solid fa-money-bill-trend-up', color: 'green', num: data.totalOmset, label: 'Akumulasi Omset Usaha', sub: 'Tahun Buku 2026' },
    { icon: 'fa-solid fa-hand-holding-dollar', color: 'orange', num: data.padesDisalurkan, label: 'Kontribusi PADes Batetangnga', sub: 'Mendukung Dana Desa' },
    { icon: 'fa-solid fa-cubes-stacked', color: 'blue', num: '2 Unit Aktif', label: 'Pasar Desa & Budidaya Ikan Nila', sub: '2 Unit Dalam Rencana' },
    { icon: 'fa-solid fa-users', color: 'purple', num: data.pengurusTotal, label: 'Personil Kepengurusan', sub: 'Dusun Kanang, Batetangnga' }
  ];
  container.innerHTML = stats.map(st => `
    <div class="stat-card">
      <div class="stat-card-icon ${st.color}"><i class="${st.icon}"></i></div>
      <div class="stat-card-num">${st.num}</div>
      <div class="stat-card-label">${st.label}</div>
      <div style="font-size: 0.78rem; color: var(--neutral-400); margin-top: 4px;">${st.sub}</div>
    </div>
  `).join('');
}

function renderHomeUnitsPreview() {
  const container = document.getElementById('homeUnitsPreview');
  if (!container) return;
  const units = BUMDES_DATA.unitUsaha;
  container.innerHTML = units.map(u => {
    const isPlan = !u.isActive;
    return `
      <div class="news-card">
        <div class="news-thumb">
          <img src="${u.gambar}" alt="${u.nama}" onerror="handleImgError(this, '${u.kategori.toLowerCase()}', '${u.nama.replace(/\'/g, `\\`\'`)}', '${u.tagline.replace(/\'/g, `\\`\'`)}')" loading="lazy">
          <span class="news-category-badge" style="background: ${isPlan ? '#475569' : 'var(--primary-800)'};">
            ${isPlan ? 'Rencana' : 'Unit Aktif'}
          </span>
        </div>
        <div class="news-body">
          <div style="font-size: 0.8rem; font-weight: 700; color: ${isPlan ? 'var(--neutral-500)' : 'var(--accent-600)'}; margin-bottom: 4px;">
            ${u.kode} â€¢ ${u.status}
          </div>
          <h3 class="news-title" style="font-size: 1.15rem;">${u.nama}</h3>
          <p class="news-excerpt">${u.deskripsiSingkat}</p>
          <div class="news-footer">
            <button class="btn btn-outline-primary btn-sm" onclick="navigateTo('unit-usaha')">
              Detail Unit <i class="fa-solid fa-arrow-right"></i>
            </button>
            <a href="https://wa.me/${BUMDES_DATA.info.whatsapp}?text=Halo%20Admin%20BUMDesa%20Sipodalle,%20saya%20tertarik%20mengenai%20${encodeURIComponent(u.nama)}" target="_blank" rel="noopener noreferrer" class="btn btn-accent btn-sm" style="padding: 6px 12px;">
              <i class="fa-brands fa-whatsapp"></i> WhatsApp
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderHomeNewsPreview() {
  const container = document.getElementById('homeNewsPreview');
  if (!container) return;
  const news = BUMDES_DATA.berita.slice(0, 3);
  container.innerHTML = news.map(n => `
    <div class="news-card">
      <div class="news-thumb">
        <img src="${n.gambar}" alt="${n.judul}" onerror="handleImgError(this, '${n.kategori.toLowerCase()}', '${n.judul.replace(/\'/g, `\\`\'`)}', '${n.tanggal}')" loading="lazy">
        <span class="news-category-badge">${n.kategori}</span>
      </div>
      <div class="news-body">
        <div class="news-meta">
          <span><i class="fa-regular fa-calendar"></i> ${n.tanggal}</span>
          <span><i class="fa-regular fa-clock"></i> ${n.durasi}</span>
        </div>
        <h3 class="news-title">${n.judul}</h3>
        <p class="news-excerpt">${n.ringkasan}</p>
        <div class="news-footer">
          <button class="read-more-btn" onclick="openNewsDetail(${n.id})">
            Baca Selengkapnya <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderTestimonials() {
  const container = document.getElementById('testimoniContainer');
  if (!container) return;
  container.innerHTML = BUMDES_DATA.testimoni.map(t => `
    <div class="testi-card">
      <div class="testi-quote">"${t.komentar}"</div>
      <div class="testi-user">
        <img src="${t.foto}" alt="${t.nama}" onerror="this.onerror=null; this.src=createAvatarSvg('${t.inisial}', '${t.peran}', '${t.col1}', '${t.col2}')" loading="lazy">
        <div class="testi-user-info">
          <h4>${t.nama}</h4>
          <span>${t.peran}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderProfileData() {
  const misiContainer = document.getElementById('profileMisiList');
  if (misiContainer) {
    misiContainer.innerHTML = BUMDES_DATA.visiMisi.misi.map(m => `
      <li><i class="fa-solid fa-circle-check"></i><span>${m}</span></li>
    `).join('');
  }

  const orgContainer = document.getElementById('orgStructureContainer');
  if (orgContainer) {
    orgContainer.innerHTML = BUMDES_DATA.pengurus.map(p => {
      const isOrange = p.kategori === 'direksi' || p.kategori === 'penasihat';
      const isBlue = p.kategori === 'pengawas';
      let badgeClass = 'org-role-badge';
      let cardClass = 'org-card';
      if (isOrange) cardClass += ' orange';
      if (isBlue) cardClass += ' blue';

      return `
        <div class="${cardClass}">
          <div class="org-avatar-icon"><i class="fa-solid fa-${p.fotoIcon}"></i></div>
          <h4>${p.nama}</h4>
          <span class="${badgeClass}">${p.jabatan}</span>
          <p>${p.deskripsi}</p>
        </div>
      `;
    }).join('');
  }
}

/* ==========================================================================
   4. KONTEN BERITA (IN-PAGE READER - TANPA MODAL)
   ========================================================================== */
function filterNews(category) {
  document.querySelectorAll('#newsCategoryPills .cat-btn').forEach(btn => {
    if (btn.getAttribute('data-cat') === category) btn.classList.add('active');
    else btn.classList.remove('active');
  });
  const searchVal = document.getElementById('newsSearchInput')?.value || '';
  renderAllNews(category, searchVal);
}

function searchNews() {
  const activeBtn = document.querySelector('#newsCategoryPills .cat-btn.active');
  const category = activeBtn ? activeBtn.getAttribute('data-cat') : 'Semua';
  const searchVal = document.getElementById('newsSearchInput')?.value || '';
  renderAllNews(category, searchVal);
}

function renderAllNews(category = 'Semua', query = '') {
  const grid = document.getElementById('allNewsGrid');
  if (!grid) return;
  let list = BUMDES_DATA.berita;
  if (category !== 'Semua') {
    list = list.filter(n => n.kategori.toLowerCase() === category.toLowerCase());
  }
  if (query.trim()) {
    const q = query.toLowerCase();
    list = list.filter(n => n.judul.toLowerCase().includes(q) || n.ringkasan.toLowerCase().includes(q));
  }
  grid.innerHTML = list.map(n => `
    <div class="news-card">
      <div class="news-thumb">
        <img src="${n.gambar}" alt="${n.judul}" onerror="handleImgError(this, '${n.kategori.toLowerCase()}', '${n.judul.replace(/\'/g, `\\`\'`)}', '${n.tanggal}')" loading="lazy">
        <span class="news-category-badge">${n.kategori}</span>
      </div>
      <div class="news-body">
        <div class="news-meta">
          <span><i class="fa-regular fa-calendar"></i> ${n.tanggal}</span>
          <span><i class="fa-regular fa-clock"></i> ${n.durasi}</span>
        </div>
        <h3 class="news-title">${n.judul}</h3>
        <p class="news-excerpt">${n.ringkasan}</p>
        <div class="news-footer">
          <button class="read-more-btn" onclick="openNewsDetail(${n.id})">
            Baca Berita Lengkap <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Membuka konten artikel berita langsung di halaman (In-Page Reader - Tanpa Modal)
 */
function openNewsDetail(newsId, updateHash = true) {
  const item = BUMDES_DATA.berita.find(n => n.id === newsId);
  if (!item) return;

  // Pastikan kita ada di section berita
  navigateTo('berita', false);

  const listView = document.getElementById('newsListView');
  const detailView = document.getElementById('newsDetailView');
  const detailContent = document.getElementById('newsDetailContent');

  if (listView && detailView && detailContent) {
    listView.style.display = 'none';
    detailView.style.display = 'block';

    detailContent.innerHTML = `
      <div class="article-reader-wrapper">
        <!-- Tombol Kembali -->
        <button class="btn btn-outline-primary btn-sm back-to-list-btn" onclick="backToNewsList()">
          <i class="fa-solid fa-arrow-left"></i> Kembali ke Daftar Berita
        </button>

        <!-- Header Artikel -->
        <div class="article-header">
          <span class="article-badge">${item.kategori}</span>
          <h1 class="article-title">${item.judul}</h1>
          <div class="article-meta-bar">
            <span><i class="fa-regular fa-calendar"></i> Dipublikasikan: <strong>${item.tanggal}</strong></span>
            <span><i class="fa-solid fa-user-pen"></i> Penulis: <strong>${item.penulis}</strong></span>
            <span><i class="fa-regular fa-clock"></i> Waktu Baca: <strong>${item.durasi}</strong></span>
          </div>
        </div>

        <!-- Gambar Utama Artikel -->
        <div class="article-featured-img">
          <img src="${item.gambar}" alt="${item.judul}" onerror="handleImgError(this, '${item.kategori.toLowerCase()}', '${item.judul.replace(/\'/g, `\\`\'`)}', '${item.tanggal}')">
        </div>

        <!-- Isi Teks Artikel -->
        <div class="article-body-text">
          ${item.konten}
        </div>

        <!-- Bagikan & Aksi Bawah -->
        <div class="article-share-box">
          <div class="share-left">
            <span><i class="fa-solid fa-share-nodes"></i> Bagikan Berita:</span>
            <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(item.judul + ' - BUMDesa Sipodalle: ' + window.location.href)}" target="_blank" rel="noopener noreferrer" class="btn btn-accent btn-sm">
              <i class="fa-brands fa-whatsapp"></i> Bagikan ke WhatsApp
            </a>
            <button class="btn btn-outline-primary btn-sm" onclick="window.print()">
              <i class="fa-solid fa-print"></i> Cetak Artikel
            </button>
          </div>
          <button class="btn btn-primary btn-sm" onclick="backToNewsList()">
            <i class="fa-solid fa-list"></i> Lihat Berita Lainnya
          </button>
        </div>
      </div>
    `;

    if (updateHash) {
      history.pushState(null, null, `#berita-${newsId}`);
    }
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }
}

/**
 * Kembali dari mode pembaca artikel ke daftar grid berita
 */
function backToNewsList(updateHash = true) {
  const listView = document.getElementById('newsListView');
  const detailView = document.getElementById('newsDetailView');

  if (listView && detailView) {
    detailView.style.display = 'none';
    listView.style.display = 'block';
  }

  if (updateHash) {
    history.pushState(null, null, '#berita');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }
}

/* ==========================================================================
   5. UNIT USAHA & KATALOG
   ========================================================================== */
function filterUnits(category) {
  document.querySelectorAll('#unitCategoryFilter .cat-btn').forEach(btn => {
    if (btn.getAttribute('data-unitcat') === category) btn.classList.add('active');
    else btn.classList.remove('active');
  });
  renderAllUnits(category);
}

function filterUnitsAndNav(category) {
  navigateTo('unit-usaha');
  setTimeout(() => filterUnits(category), 100);
}

function renderAllUnits(category = 'Semua') {
  const container = document.getElementById('unitUsahaListContainer');
  if (!container) return;
  let list = BUMDES_DATA.unitUsaha;
  if (category !== 'Semua') {
    list = list.filter(u => u.kategori.toLowerCase().includes(category.toLowerCase()));
  }
  container.innerHTML = list.map(u => {
    const isPlan = !u.isActive;
    return `
      <div class="unit-card-full" style="${isPlan ? 'opacity: 0.94; border-style: dashed;' : ''}">
        <div class="unit-image-side">
          <img src="${u.gambar}" alt="${u.nama}" onerror="handleImgError(this, '${u.kategori.toLowerCase()}', '${u.nama.replace(/\'/g, `\\`\'`)}', '${u.tagline.replace(/\'/g, `\\`\'`)}')" loading="lazy">
          <div class="unit-image-overlay">
            <div class="unit-omset-pill" style="${isPlan ? 'background: rgba(15, 23, 42, 0.85); color: white;' : ''}">
              <i class="fa-solid ${isPlan ? 'fa-hourglass-half' : 'fa-chart-line text-green'}"></i> 
              ${isPlan ? 'Status: ' + u.omsetTahun : 'Estimasi Omset: ' + u.omsetTahun}
            </div>
          </div>
        </div>
        <div class="unit-content-side">
          <div>
            <div class="unit-header-top">
              <span class="unit-tag ${u.badgeColor}"><i class="fa-solid fa-${u.icon}"></i> ${u.kategori}</span>
              <div class="unit-status-badge" style="color: ${isPlan ? '#0284c7' : 'var(--primary-600)'};">
                <i class="fa-solid ${isPlan ? 'fa-clock' : 'fa-circle-check'}"></i> ${u.status}
              </div>
            </div>
            <h3 class="unit-title">${u.nama}</h3>
            <div class="unit-tagline">${u.tagline}</div>
            <p class="unit-desc">${u.deskripsiLengkap}</p>
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--neutral-800); margin-bottom: 8px;">
              <i class="fa-solid fa-star text-orange"></i> ${isPlan ? 'Rencana Program & Fasilitas:' : 'Produk & Layanan Unggulan:'}
            </div>
            <div class="unit-services-list">
              ${u.layananUnggulan.map(s => `
                <div class="srv-item">
                  <i class="fa-solid ${isPlan ? 'fa-circle-dot' : 'fa-check'}" style="color: ${isPlan ? '#0284c7' : 'var(--primary-600)'};"></i>
                  <span>${s}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="unit-footer-actions">
            <div class="unit-contact-info"><i class="fa-solid fa-user-gear"></i> PIC: <strong>${u.kontakPerson}</strong></div>
            <a href="https://wa.me/${BUMDES_DATA.info.whatsapp}?text=Halo%20Admin%20BUMDesa%20Sipodalle,%20saya%20ingin%20bertanya%20mengenai%20${encodeURIComponent(u.nama)}" target="_blank" rel="noopener noreferrer" class="btn ${isPlan ? 'btn-outline-primary' : 'btn-accent'} btn-sm">
              <i class="fa-brands fa-whatsapp"></i> ${isPlan ? 'Tanya Rencana / Kemitraan' : 'Hubungi / Pesan via WhatsApp'}
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   6. LAPORAN KEUANGAN (APPS SCRIPT)
   ========================================================================== */
function switchKeuanganTab(tabId) {
  const btnPortal = document.getElementById('tabBtnPortal');
  const btnTrans = document.getElementById('tabBtnTransparansi');
  const contentPortal = document.getElementById('tabContentPortal');
  const contentTrans = document.getElementById('tabContentTransparansi');

  if (tabId === 'portal') {
    btnPortal.classList.add('active');
    btnTrans.classList.remove('active');
    contentPortal.classList.add('active');
    contentTrans.classList.remove('active');
  } else {
    btnPortal.classList.remove('active');
    btnTrans.classList.add('active');
    contentPortal.classList.remove('active');
    contentTrans.classList.add('active');
  }
}

function openAppsScriptTab() {
  navigateTo('laporan-keuangan');
  switchKeuanganTab('portal');
}

function reloadAppsScriptIframe() {
  const iframe = document.getElementById('appsScriptIframe');
  if (iframe) {
    const src = iframe.src;
    iframe.src = '';
    setTimeout(() => { iframe.src = src; }, 150);
  }
}

function toggleIframeFullscreen() {
  const container = document.getElementById('appsScriptContainer');
  const btn = document.getElementById('fullscreenBtn');
  if (container) {
    container.classList.toggle('is-fullscreen');
    if (container.classList.contains('is-fullscreen')) {
      btn.innerHTML = '<i class="fa-solid fa-compress"></i> Kecilkan Layar';
      document.body.style.overflow = 'hidden';
    } else {
      btn.innerHTML = '<i class="fa-solid fa-expand"></i> Layar Penuh';
      document.body.style.overflow = '';
    }
  }
}

function renderFinancialTransparency() {
  const data = BUMDES_DATA.keuanganTransparansi;
  if (!data) return;

  const compContainer = document.getElementById('compBarsContainer');
  if (compContainer) {
    compContainer.innerHTML = data.komposisiPendapatan.map(c => `
      <div class="comp-bar-item">
        <div class="bar-label">
          <span>${c.unit}</span>
          <span style="color: ${c.warna}; font-weight: 700;">
            ${c.nominal > 0 ? 'Rp ' + (c.nominal / 1000000).toLocaleString('id-ID') + ' Jt (' + c.persen + '%)' : 'Tahap Persiapan'}
          </span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${c.persen}%; background: ${c.warna};"></div>
        </div>
      </div>
    `).join('');
  }

  const modulContainer = document.getElementById('modulLaporanContainer');
  if (modulContainer) {
    modulContainer.innerHTML = data.modulLaporan.map(m => `
      <div class="modul-card">
        <div class="modul-card-header">
          <div class="modul-icon"><i class="fa-solid fa-${m.icon}"></i></div>
          <span class="unit-tag green">${m.badge}</span>
        </div>
        <h4>${m.nama}</h4>
        <p>${m.deskripsi}</p>
        <button class="btn btn-outline-primary btn-sm" style="margin-top: 14px; width: 100%;" onclick="openAppsScriptTab()">
          Buka di Aplikasi PPAK <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    `).join('');
  }
}
