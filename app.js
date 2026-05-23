/* ═══════════════════════════════════════════════
   SCUTE — App.js
   State management, views, trips, gamification
═══════════════════════════════════════════════ */

'use strict';

// ══════════════════════════════════════
// 1. INITIAL DATA
// ══════════════════════════════════════
const DEFAULT_VEHICLES = [
  { id: 'SC-001', type: 'Trotinete elétrica', battery: 88, distance: 320,  row: 2, col: 1, status: 'available' },
  { id: 'SC-002', type: 'Trotinete elétrica', battery: 15, distance: 780,  row: 1, col: 4, status: 'available' },
  { id: 'SC-003', type: 'E-Bike',             battery: 92, distance: 210,  row: 3, col: 3, status: 'available' },
  { id: 'SC-004', type: 'E-Bike',             battery: 67, distance: 450,  row: 5, col: 5, status: 'available' },
  { id: 'SC-005', type: 'Bicicleta',          battery: 100,distance: 180,  row: 4, col: 2, status: 'available' },
  { id: 'SC-006', type: 'Trotinete elétrica', battery: 55, distance: 620,  row: 6, col: 4, status: 'available' },
  { id: 'SC-007', type: 'E-Bike',             battery: 73, distance: 390,  row: 2, col: 6, status: 'maintenance' },
  { id: 'SC-008', type: 'Bicicleta',          battery: 100,distance: 540,  row: 7, col: 1, status: 'available' },
  { id: 'SC-009', type: 'Trotinete elétrica', battery: 41, distance: 870,  row: 1, col: 2, status: 'available' },
  { id: 'SC-010', type: 'E-Bike',             battery: 80, distance: 260,  row: 5, col: 3, status: 'maintenance' },
];

const DEFAULT_USER = {
  name: 'Mariana',
  points: 256,
  subscription: true,
};

const DEFAULT_MISSIONS = [
  { id: 'M1', desc: 'Relocate scooter to Aveiro center', reward: 200, icon: '🛴' },
  { id: 'M2', desc: 'Charge nearby e-bike in Station A', reward: 150, icon: '⚡' },
  { id: 'M3', desc: 'Return bike to Forum Aveiro rack',  reward: 100, icon: '🚲' },
  { id: 'M4', desc: 'Move e-bike to University campus',  reward: 200, icon: '🚴' },
];

const DEFAULT_TRIPS = [
  { id: 'T0', city: 'Aveiro', date: '2026-05-20', time: '08:14', distance: '2.3 km', vehicleType: 'Trotinete elétrica', duration: '00:07:42', cost: '€0.85' },
  { id: 'T1', city: 'Aveiro', date: '2026-05-18', time: '17:32', distance: '1.8 km', vehicleType: 'E-Bike',             duration: '00:05:20', cost: '€0.65' },
];

const LEADERBOARD = [
  { name: 'Pedro Costa',   pts: 1240 },
  { name: 'Ana Rodrigues', pts: 987  },
  { name: 'Mariana Silva', pts: 256  },
  { name: 'Diogo Santos',  pts: 198  },
  { name: 'Beatriz Lima',  pts: 120  },
];

const MARKETPLACE = [
  { name: 'Pedir Veículo',   cost: 100, emoji: '🛴' },
  { name: 'Bloquear Veículo',cost: 150, emoji: '🔒' },
  { name: 'Viagem Grátis',   cost: 200, emoji: '🎟️' },
  { name: 'Desconto Parceiro',cost: 80, emoji: '🏪' },
];

// ══════════════════════════════════════
// 2. STATE MANAGEMENT (LocalStorage)
// ══════════════════════════════════════
const LS = {
  get: key => { try { return JSON.parse(localStorage.getItem('scute_' + key)); } catch { return null; } },
  set: (key, val) => localStorage.setItem('scute_' + key, JSON.stringify(val)),
};

function initState() {
  if (!LS.get('vehicles')) LS.set('vehicles', DEFAULT_VEHICLES);
  if (!LS.get('user'))     LS.set('user', DEFAULT_USER);
  if (!LS.get('missions')) LS.set('missions', DEFAULT_MISSIONS);
  if (!LS.get('trips'))    LS.set('trips', DEFAULT_TRIPS);
}

function getVehicles()           { return LS.get('vehicles') || []; }
function getUser()               { return LS.get('user') || DEFAULT_USER; }
function getTrips()              { return LS.get('trips') || []; }
function updateVehicle(id, patch){ const v = getVehicles(); const i = v.findIndex(x => x.id === id); if(i<0) return; Object.assign(v[i], patch); LS.set('vehicles', v); }
function updatePoints(delta)     { const u = getUser(); u.points = Math.max(0, u.points + delta); LS.set('user', u); refreshPointsDisplay(); }
function addTrip(trip)           { const t = getTrips(); t.unshift(trip); LS.set('trips', t); }

// ══════════════════════════════════════
// 3. ACTIVE TRIP STATE
// ══════════════════════════════════════
let activeVehicleId = null;
let tripStartTime   = null;
let tripTimerRef    = null;
let tripSeconds     = 0;

// ══════════════════════════════════════
// 4. UTILITIES
// ══════════════════════════════════════
function fmtTime(secs) {
  const h = String(Math.floor(secs / 3600)).padStart(2,'0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2,'0');
  const s = String(secs % 60).padStart(2,'0');
  return `${h}:${m}:${s}`;
}

function typeToEmoji(type) {
  if (type === 'Trotinete elétrica') return '🛴';
  if (type === 'E-Bike')             return '⚡🚲';
  return '🚲';
}

function typeToCssClass(type) {
  if (type === 'Trotinete elétrica') return 'type-scooter';
  if (type === 'E-Bike')             return 'type-ebike';
  return 'type-bike';
}

function showToast(msg, dur = 2800) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add('hidden'), dur);
}

let _backdrop = null;
function showBackdrop(onClick) {
  if (_backdrop) _backdrop.remove();
  _backdrop = document.createElement('div');
  _backdrop.className = 'overlay-backdrop';
  _backdrop.addEventListener('click', onClick);
  document.body.appendChild(_backdrop);
}
function hideBackdrop() { if (_backdrop) { _backdrop.remove(); _backdrop = null; } }

// ══════════════════════════════════════
// 5. NAV / VIEW SWITCHING
// ══════════════════════════════════════
function switchView(viewName) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const view = document.getElementById('view-' + viewName);
  if (view) view.classList.add('active');
  const navBtn = document.querySelector(`.nav-item[data-view="${viewName}"]`);
  if (navBtn) navBtn.classList.add('active');
  // Refresh view data
  if (viewName === 'map')          renderMap();
  if (viewName === 'history')      renderHistory();
  if (viewName === 'gamification') renderGamification();
  if (viewName === 'admin')        renderAdmin();
}

// ══════════════════════════════════════
// 6. MAP RENDERING & FILTERING
// ══════════════════════════════════════
let currentTypeFilter    = 'all';
let currentBatteryFilter = 0;
let simConnectivity      = false;
let simGPS               = false;

function renderMap() {
  const grid = document.getElementById('map-grid');
  grid.innerHTML = '';

  // Error simulation
  document.getElementById('banner-connectivity').classList.toggle('hidden', !simConnectivity);
  document.getElementById('banner-gps').classList.toggle('hidden', !simGPS);

  if (simConnectivity || simGPS) { grid.innerHTML = ''; return; }

  const vehicles = getVehicles().filter(v => v.status === 'available');
  const filtered = vehicles.filter(v => {
    const typeOk = currentTypeFilter === 'all' || v.type === currentTypeFilter;
    const batOk  = v.battery >= currentBatteryFilter;
    return typeOk && batOk;
  });

  document.getElementById('no-results').classList.toggle('hidden', filtered.length > 0);

  // Build sparse grid mapping
  filtered.forEach((v, idx) => {
    const pin = document.createElement('div');
    pin.className = 'vehicle-pin';
    pin.style.gridRow    = v.row;
    pin.style.gridColumn = v.col;
    pin.style.animationDelay = (idx * 0.07) + 's';

    const bubbleClass = v.battery < 20 ? 'low-battery' : typeToCssClass(v.type);
    pin.innerHTML = `
      <div class="pin-bubble ${bubbleClass}">
        <span class="pin-inner">${typeToEmoji(v.type)}</span>
      </div>
      <div class="pin-label">${v.battery}%</div>`;
    pin.addEventListener('click', () => openVehiclePanel(v.id));
    grid.appendChild(pin);
  });

  updateAdminStats();
}

// ══════════════════════════════════════
// 7. VEHICLE PANEL
// ══════════════════════════════════════
let selectedVehicleId = null;

function openVehiclePanel(vehicleId) {
  selectedVehicleId = vehicleId;
  const v = getVehicles().find(x => x.id === vehicleId);
  if (!v) return;

  document.getElementById('vp-icon').textContent = typeToEmoji(v.type);
  document.getElementById('vp-type').textContent = v.type;
  document.getElementById('vp-id').textContent   = '#' + v.id;
  document.getElementById('vp-battery').textContent = v.battery + '%';
  document.getElementById('vp-distance').textContent = v.distance + 'm';

  const statusMap = { available: 'Disponível', in_use: 'Em Uso', maintenance: 'Manutenção' };
  document.getElementById('vp-status-text').textContent = statusMap[v.status] || v.status;

  const panel = document.getElementById('vehicle-panel');
  panel.classList.remove('hidden');
  showBackdrop(closeVehiclePanel);
}

function closeVehiclePanel() {
  document.getElementById('vehicle-panel').classList.add('hidden');
  hideBackdrop();
  selectedVehicleId = null;
}

// ══════════════════════════════════════
// 8. QR SCANNER
// ══════════════════════════════════════
function openQRScanner() {
  closeVehiclePanel();
  document.getElementById('qr-overlay').classList.remove('hidden');
}

function closeQRScanner() {
  document.getElementById('qr-overlay').classList.add('hidden');
}

function handleQRScan(vehicleId) {
  const id = vehicleId || selectedVehicleId;
  closeQRScanner();
  attemptStartTrip(id);
}

function attemptStartTrip(vehicleId) {
  const v = getVehicles().find(x => x.id === vehicleId);
  if (!v) { showToast('❌ Veículo não encontrado.'); return; }

  if (v.status === 'maintenance') {
    showToast('🔧 Este veículo requer manutenção e não está disponível para utilização. Por favor escolha outro veículo', 4000);
    return;
  }
  if (v.battery < 20) {
    showToast('🔋 Este veículo não tem carga suficiente para realizar uma viagem segura. Por favor escolha outro veículo', 4000);
    return;
  }

  // Start trip!
  startTrip(v);
}

// ══════════════════════════════════════
// 9. ACTIVE TRIP
// ══════════════════════════════════════
function startTrip(v) {
  activeVehicleId = v.id;
  tripStartTime   = Date.now();
  tripSeconds     = 0;

  updateVehicle(v.id, { status: 'in_use' });
  renderMap();

  // Setup overlay
  document.getElementById('trip-vehicle-icon').textContent = typeToEmoji(v.type);
  document.getElementById('trip-vehicle-name').textContent = v.type + ' #' + v.id;
  document.getElementById('trip-battery').textContent      = v.battery + '%';
  document.getElementById('trip-distance-live').textContent = '0.00 km';
  document.getElementById('trip-cost').textContent          = '€0.00';
  document.getElementById('trip-timer').textContent         = '00:00:00';

  document.getElementById('trip-overlay').classList.remove('hidden');

  // Start timer
  tripTimerRef = setInterval(() => {
    tripSeconds++;
    document.getElementById('trip-timer').textContent = fmtTime(tripSeconds);
    // Simulate distance & cost
    const km = (tripSeconds * 0.006).toFixed(2);
    const cost = (tripSeconds * 0.003).toFixed(2);
    document.getElementById('trip-distance-live').textContent = km + ' km';
    document.getElementById('trip-cost').textContent = '€' + cost;
  }, 1000);

  showToast('✅ Veículo desbloqueado! Boa viagem!');
}

function endTrip() {
  if (!activeVehicleId) return;
  clearInterval(tripTimerRef);

  const v = getVehicles().find(x => x.id === activeVehicleId);
  if (v) updateVehicle(activeVehicleId, { status: 'available', battery: Math.max(5, v.battery - Math.floor(tripSeconds / 60)) });

  const distKm   = (tripSeconds * 0.006).toFixed(2);
  const costVal  = (tripSeconds * 0.003).toFixed(2);
  const earnedPts = Math.max(10, Math.floor(tripSeconds / 10));

  // Save trip
  const now = new Date();
  const trip = {
    id:          'T' + Date.now(),
    city:        'Aveiro',
    date:        now.toISOString().split('T')[0],
    time:        now.toTimeString().slice(0,5),
    distance:    distKm + ' km',
    vehicleType: v ? v.type : 'Veículo',
    duration:    fmtTime(tripSeconds),
    cost:        '€' + costVal,
  };
  addTrip(trip);
  updatePoints(earnedPts);

  // Summary
  document.getElementById('sum-duration').textContent = fmtTime(tripSeconds);
  document.getElementById('sum-distance').textContent = distKm + ' km';
  document.getElementById('sum-cost').textContent     = '€' + costVal;
  document.getElementById('sum-points').textContent   = earnedPts;

  document.getElementById('trip-overlay').classList.add('hidden');
  document.getElementById('summary-overlay').classList.remove('hidden');

  activeVehicleId = null;
  tripSeconds     = 0;
  renderMap();
}

// ══════════════════════════════════════
// 10. HISTORY RENDERING
// ══════════════════════════════════════
function renderHistory() {
  const trips = getTrips();
  const list  = document.getElementById('history-list');
  const empty = document.getElementById('history-empty');
  const badge = document.getElementById('trip-count-badge');

  badge.textContent = trips.length;

  if (trips.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  list.innerHTML = trips.map(t => `
    <div class="history-card">
      <div class="history-icon">${typeToEmoji(t.vehicleType)}</div>
      <div class="history-info">
        <h4>${t.vehicleType}</h4>
        <p class="history-meta">${t.city} · ${t.date} ${t.time}</p>
        <p class="history-meta">Duração: ${t.duration}</p>
      </div>
      <div class="history-right">
        <p class="history-dist">${t.distance}</p>
        <p class="history-time">${t.cost}</p>
      </div>
    </div>`).join('');
}

// ══════════════════════════════════════
// 11. GAMIFICATION RENDERING
// ══════════════════════════════════════
function refreshPointsDisplay() {
  const pts = getUser().points;
  document.getElementById('header-points').textContent  = pts;
  document.getElementById('profile-points').textContent = pts;
}

function renderGamification() {
  refreshPointsDisplay();

  // Leaderboard (update Mariana's pts)
  const user = getUser();
  const lb = LEADERBOARD.map(r => r.name === 'Mariana Silva' ? { ...r, pts: user.points } : r);
  lb.sort((a,b) => b.pts - a.pts);
  const rankClass = ['top1','top2','top3'];
  document.getElementById('leaderboard-list').innerHTML = lb.map((r,i) => `
    <div class="leader-row">
      <div class="leader-rank ${rankClass[i] || ''}">${i+1}</div>
      <span class="leader-name">${r.name}</span>
      <span class="leader-pts">★ ${r.pts.toLocaleString()}</span>
    </div>`).join('');

  // Missions
  document.getElementById('missions-list').innerHTML = DEFAULT_MISSIONS.map(m => `
    <div class="mission-row" data-mission="${m.id}">
      <span style="font-size:20px">${m.icon}</span>
      <span class="mission-desc">${m.desc}</span>
      <span class="mission-pts">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
        +${m.reward}
      </span>
    </div>`).join('');

  // Marketplace
  document.getElementById('marketplace-grid').innerHTML = MARKETPLACE.map(m => `
    <div class="market-item" data-cost="${m.cost}" data-name="${m.name}">
      <div class="market-emoji">${m.emoji}</div>
      <div class="market-name">${m.name}</div>
      <div class="market-cost">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
        ${m.cost} pts
      </div>
    </div>`).join('');

  // Marketplace click
  document.getElementById('marketplace-grid').querySelectorAll('.market-item').forEach(el => {
    el.addEventListener('click', () => {
      const cost = parseInt(el.dataset.cost);
      const name = el.dataset.name;
      const user = getUser();
      if (user.points < cost) { showToast('❌ Pontos insuficientes!'); return; }
      updatePoints(-cost);
      showToast(`✅ "${name}" ativado com sucesso!`);
      renderGamification();
    });
  });

  // Mission click in profile
  document.getElementById('missions-list').querySelectorAll('.mission-row').forEach(el => {
    el.addEventListener('click', () => {
      const m = DEFAULT_MISSIONS.find(x => x.id === el.dataset.mission);
      if (!m) return;
      updatePoints(m.reward);
      showToast(`🎯 Missão concluída! +${m.reward} pontos ganhos!`);
      renderGamification();
    });
  });
}

// ══════════════════════════════════════
// 12. IN-TRIP MISSIONS PANEL
// ══════════════════════════════════════
function openMissionsPanel() {
  const list = document.getElementById('missions-in-trip-list');
  list.innerHTML = DEFAULT_MISSIONS.map(m => `
    <div class="mission-row" data-mission="${m.id}">
      <span style="font-size:20px">${m.icon}</span>
      <span class="mission-desc">${m.desc}</span>
      <span class="mission-pts">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
        +${m.reward}
      </span>
    </div>`).join('');

  list.querySelectorAll('.mission-row').forEach(el => {
    el.addEventListener('click', () => {
      const m = DEFAULT_MISSIONS.find(x => x.id === el.dataset.mission);
      if (!m) return;
      updatePoints(m.reward);
      showToast(`🎯 +${m.reward} pontos! Missão aceite!`);
      closeMissionsPanel();
    });
  });

  document.getElementById('missions-panel').classList.remove('hidden');
  showBackdrop(closeMissionsPanel);
}

function closeMissionsPanel() {
  document.getElementById('missions-panel').classList.add('hidden');
  hideBackdrop();
}

// ══════════════════════════════════════
// 13. REPORT PROBLEM
// ══════════════════════════════════════
let selectedReportCat = null;

function openReportPanel(vehicleId) {
  selectedVehicleId = vehicleId;
  document.getElementById('report-vehicle-id').textContent = '#' + vehicleId;
  document.getElementById('report-description').value = '';
  document.getElementById('report-photo-status').textContent = '';
  selectedReportCat = null;
  document.querySelectorAll('.report-cat').forEach(b => b.classList.remove('selected'));

  closeVehiclePanel();
  document.getElementById('report-panel').classList.remove('hidden');
  showBackdrop(closeReportPanel);
}

function closeReportPanel() {
  document.getElementById('report-panel').classList.add('hidden');
  hideBackdrop();
}

function submitReport() {
  if (!selectedReportCat) { showToast('⚠️ Selecione uma categoria.'); return; }
  const desc = document.getElementById('report-description').value.trim();
  if (!desc) { showToast('⚠️ Adicione uma descrição do problema.'); return; }

  updateVehicle(selectedVehicleId, { status: 'maintenance' });
  showToast('✅ Relatório enviado! Veículo marcado para manutenção.', 3500);
  closeReportPanel();
  renderMap();
}

// ══════════════════════════════════════
// 14. ADMIN / DASHBOARD
// ══════════════════════════════════════
function updateAdminStats() {
  const vehicles = getVehicles();
  const avail = vehicles.filter(v => v.status === 'available').length;
  const inUse = vehicles.filter(v => v.status === 'in_use').length;
  const maint = vehicles.filter(v => v.status === 'maintenance').length;

  const saU = document.getElementById('stat-active-users');
  const sF  = document.getElementById('stat-fleet');
  const sI  = document.getElementById('stat-in-use');
  const sM  = document.getElementById('stat-maintenance');
  if (saU) saU.textContent = 47 + inUse;
  if (sF)  sF.textContent  = avail;
  if (sI)  sI.textContent  = inUse;
  if (sM)  sM.textContent  = maint;
}

function renderAdmin() {
  updateAdminStats();
  const vehicles = getVehicles();
  const statusLabel = { available: 'Disponível', in_use: 'Em Uso', maintenance: 'Manutenção' };
  document.getElementById('fleet-table').innerHTML = vehicles.map(v => `
    <div class="fleet-row">
      <span class="fleet-type">${typeToEmoji(v.type)}</span>
      <span class="fleet-id">${v.id}</span>
      <span class="fleet-bat" style="color: ${v.battery < 20 ? 'var(--red)' : v.battery < 50 ? 'var(--amber)' : 'var(--green)'}">${v.battery}%</span>
      <span class="fleet-status ${v.status}">${statusLabel[v.status]}</span>
    </div>`).join('');
}

// ══════════════════════════════════════
// 15. FILTERS
// ══════════════════════════════════════
function setupFilters() {
  // Type chips
  document.getElementById('type-filters').querySelectorAll('.chip').forEach(c => {
    c.addEventListener('click', () => {
      document.querySelectorAll('#type-filters .chip').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      currentTypeFilter = c.dataset.type;
    });
  });

  // Battery chips
  document.getElementById('battery-filters').querySelectorAll('.chip').forEach(c => {
    c.addEventListener('click', () => {
      document.querySelectorAll('#battery-filters .chip').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      currentBatteryFilter = parseInt(c.dataset.battery);
    });
  });

  document.getElementById('filter-toggle-btn').addEventListener('click', () => {
    document.getElementById('filter-panel').classList.toggle('hidden');
  });
  document.getElementById('filter-close-btn').addEventListener('click', () => {
    document.getElementById('filter-panel').classList.add('hidden');
  });
  document.getElementById('filter-apply').addEventListener('click', () => {
    document.getElementById('filter-panel').classList.add('hidden');
    renderMap();
  });
  document.getElementById('filter-reset').addEventListener('click', () => {
    currentTypeFilter    = 'all';
    currentBatteryFilter = 0;
    document.querySelectorAll('#type-filters .chip').forEach((c,i) => c.classList.toggle('active', i===0));
    document.querySelectorAll('#battery-filters .chip').forEach((c,i) => c.classList.toggle('active', i===0));
    document.getElementById('filter-panel').classList.add('hidden');
    renderMap();
  });

  // Error toggles
  document.getElementById('sim-connectivity').addEventListener('change', e => {
    simConnectivity = e.target.checked;
    if (simConnectivity) { simGPS = false; document.getElementById('sim-gps').checked = false; }
    renderMap();
  });
  document.getElementById('sim-gps').addEventListener('change', e => {
    simGPS = e.target.checked;
    if (simGPS) { simConnectivity = false; document.getElementById('sim-connectivity').checked = false; }
    renderMap();
  });
}

// ══════════════════════════════════════
// 16. BOOT & EVENT LISTENERS
// ══════════════════════════════════════
function boot() {
  initState();

  // ── Nav
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // ── Filters
  setupFilters();

  // ── Vehicle Panel
  document.getElementById('vp-close').addEventListener('click', closeVehiclePanel);
  document.getElementById('vp-start-btn').addEventListener('click', () => {
    if (!selectedVehicleId) return;
    openQRScanner();
  });
  document.getElementById('vp-report-btn').addEventListener('click', () => {
    if (!selectedVehicleId) return;
    openReportPanel(selectedVehicleId);
  });

  // ── QR Overlay
  document.getElementById('qr-close').addEventListener('click', closeQRScanner);
  document.getElementById('qr-frame').addEventListener('click', () => handleQRScan());
  document.getElementById('qr-manual-submit').addEventListener('click', () => {
    const code = document.getElementById('qr-manual-code').value.trim().replace('#','');
    if (!code) { showToast('⚠️ Insira um código válido.'); return; }
    handleQRScan(code.toUpperCase());
  });

  // ── Trip controls
  document.getElementById('trip-stop-btn').addEventListener('click', endTrip);
  document.getElementById('sim-walk-btn').addEventListener('click', () => {
    showToast('📍 Afastamento de 25m detectado. A terminar viagem...');
    setTimeout(endTrip, 1200);
  });
  document.getElementById('trip-missions-btn').addEventListener('click', openMissionsPanel);

  // ── Summary
  document.getElementById('summary-close-btn').addEventListener('click', () => {
    document.getElementById('summary-overlay').classList.add('hidden');
    switchView('history');
  });

  // ── Report
  document.querySelectorAll('.report-cat').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.report-cat').forEach(x => x.classList.remove('selected'));
      b.classList.add('selected');
      selectedReportCat = b.dataset.cat;
    });
  });
  document.getElementById('report-photo-btn').addEventListener('click', () => {
    document.getElementById('report-photo-status').textContent = '📷 Foto adicionada';
  });
  document.getElementById('report-submit-btn').addEventListener('click', submitReport);

  // ── Admin export
  document.getElementById('export-btn').addEventListener('click', () => {
    showToast('📊 Relatório exportado com sucesso!');
  });

  // ── Notification btn
  document.getElementById('notif-btn').addEventListener('click', () => {
    showToast('🔔 Sem novas notificações.');
  });

  // ── Initial render
  refreshPointsDisplay();
  renderMap();

  // Hide splash and show app
  setTimeout(() => {
    document.getElementById('app').classList.remove('hidden');
  }, 2100);
}

// Start!
document.addEventListener('DOMContentLoaded', boot);
