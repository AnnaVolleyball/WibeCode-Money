'use strict';

const APP_VERSION = 16;

/* ================= Data ================= */

const STORAGE_KEY = 'monetka-v1';
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const WEEKDAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const COLORS = ['#ff8a65', '#ffb74d', '#ffd54f', '#aed581', '#4db6ac', '#4fc3f7', '#7986cb', '#ba68c8', '#f06292', '#e57373', '#a1887f', '#90a4ae'];
const ICONS = ['🍔', '🛒', '☕', '🚕', '🚌', '⛽', '🏠', '💡', '📱', '🌐', '👕', '👟', '💊', '🏥', '🎮', '🎬', '✈️', '🏖️', '🎁', '📚', '💅', '💇', '🐾', '👶', '🏋️', '🍷', '🚬', '🧾', '🔧', '🚗', '💻', '🎵',
  '💼', '💰', '💸', '📈', '🏦', '💳', '💵', '🪙', '🐷', '👛', '📦', '⭐', '❤️', '🎉', '🧸', '🌿'];


/* ---------- Иконки банков и валют (в одном стиле: круг с градиентом и белой надписью) ---------- */
const BRAND_ICONS = {
  momo: { name: 'MoMo', c: ['#e2389a', '#a50064'], lines: ['mo', 'mo'] },
  bidv: { name: 'BIDV', c: ['#1fb5a8', '#00675f'], text: 'BIDV', accent: '#ffc928' },
  vcb:  { name: 'Vietcombank', c: ['#8cc63f', '#00813d'], text: 'VCB' },
  vnd:  { name: 'Донг', c: ['#ffa36b', '#e8553d'], text: '₫' },
  rub:  { name: 'Рубль', c: ['#7d9bff', '#3c55d6'], text: '₽' },
  uzs:  { name: 'Сум', c: ['#4dd0c4', '#14867b'], text: 'сўм' },
  usd:  { name: 'Доллар', c: ['#4cc77a', '#1b7f45'], text: '$' },
  eur:  { name: 'Евро', c: ['#a78bfa', '#6d48d8'], text: '€' },
};

function brandSVG(key) {
  const b = BRAND_ICONS[key];
  const g = `bg-${key}`;
  let inner;
  if (b.lines) {
    inner = `<text x="24" y="22" text-anchor="middle" font-size="15" font-weight="800" fill="#fff" letter-spacing="-.5">${b.lines[0]}</text>
      <text x="24" y="36" text-anchor="middle" font-size="15" font-weight="800" fill="#fff" letter-spacing="-.5">${b.lines[1]}</text>`;
  } else {
    const t = b.text, len = [...t].length;
    const fs = len === 1 ? 26 : len === 3 ? 15 : 13;
    const fit = len >= 3 ? ` textLength="${len === 3 ? 30 : 34}" lengthAdjust="spacingAndGlyphs"` : '';
    inner = `<text x="24" y="${len === 1 ? 33 : 29}" text-anchor="middle" font-size="${fs}" font-weight="800" fill="#fff"${fit}>${t}</text>`;
  }
  const accent = b.accent ? `<path d="M13 35 Q24 41 35 35" stroke="${b.accent}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` : '';
  return `<svg class="bi" viewBox="0 0 48 48" aria-label="${b.name}"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${b.c[0]}"/><stop offset="1" stop-color="${b.c[1]}"/></linearGradient></defs>
    <circle cx="24" cy="24" r="24" fill="url(#${g})"/><circle cx="24" cy="24" r="23" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1.5"/>${accent}${inner}</svg>`;
}
const isBrand = icon => typeof icon === 'string' && icon.startsWith('bi:') && BRAND_ICONS[icon.slice(3)];
// Иконка счёта: эмодзи или картинка. inline — маленькая, рядом с текстом
function accIcon(icon, inline) {
  if (isBrand(icon)) return inline ? `<span class="bi-inline">${brandSVG(icon.slice(3))}</span>` : brandSVG(icon.slice(3));
  return esc(icon);
}
const accIconText = icon => isBrand(icon) ? '' : icon + ' ';
const accIcoStyle = a => isBrand(a.icon) ? 'background:none' : `background:${a.color}33`;

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function pad(n) { return String(n).padStart(2, '0'); }
function today() { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function ym(dateStr) { return dateStr.slice(0, 7); }
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function defaultState() {
  const cat = (type, icon, name, color) => ({ id: uid(), type, icon, name, color });
  return {
    version: 1,
    settings: { baseCurrency: 'USD', theme: 'auto', accent: 'blue', sortCatsByUse: true },
    // perUSD: сколько единиц валюты стоит 1 доллар (примерно, можно поменять в настройках)
    currencies: [
      { code: 'VND', name: 'Вьетнамский донг', symbol: '₫', decimals: 0, perUSD: 26300 },
      { code: 'UZS', name: 'Узбекский сум', symbol: 'сум', decimals: 0, perUSD: 12000 },
      { code: 'RUB', name: 'Российский рубль', symbol: '₽', decimals: 2, perUSD: 82 },
      { code: 'USD', name: 'Доллар США', symbol: '$', decimals: 2, perUSD: 1 },
    ],
    accounts: [
      { id: uid(), name: 'Наличные донги', currency: 'VND', initial: 0, icon: 'bi:vnd', color: '#ffb74d' },
      { id: uid(), name: 'Карта сумы', currency: 'UZS', initial: 0, icon: 'bi:uzs', color: '#4db6ac' },
      { id: uid(), name: 'Карта рубли', currency: 'RUB', initial: 0, icon: 'bi:rub', color: '#7986cb' },
      { id: uid(), name: 'Доллары', currency: 'USD', initial: 0, icon: 'bi:usd', color: '#aed581' },
    ],
    categories: [
      cat('expense', '🍔', 'Еда', '#ff8a65'), cat('expense', '🛒', 'Продукты', '#aed581'),
      cat('expense', '☕', 'Кафе', '#a1887f'), cat('expense', '🚕', 'Транспорт', '#ffd54f'),
      cat('expense', '🏠', 'Жильё', '#7986cb'), cat('expense', '💡', 'Коммуналка', '#ffb74d'),
      cat('expense', '📱', 'Связь', '#4fc3f7'), cat('expense', '👕', 'Одежда', '#ba68c8'),
      cat('expense', '💊', 'Здоровье', '#e57373'), cat('expense', '🎮', 'Развлечения', '#f06292'),
      cat('expense', '✈️', 'Путешествия', '#4db6ac'), cat('expense', '🎁', 'Подарки', '#ff8a65'),
      cat('expense', '📚', 'Обучение', '#7986cb'), cat('expense', '💅', 'Красота', '#f06292'),
      cat('expense', '🐾', 'Питомцы', '#a1887f'), cat('expense', '📦', 'Другое', '#90a4ae'),
      cat('income', '💼', 'Зарплата', '#2fb37a'), cat('income', '💻', 'Фриланс', '#4fc3f7'),
      cat('income', '🎁', 'Подарки', '#f06292'), cat('income', '📈', 'Инвестиции', '#7986cb'),
      cat('income', '💸', 'Кэшбэк', '#ffb74d'), cat('income', '📦', 'Другое', '#90a4ae'),
    ],
    transactions: [],
    recurring: [],
    vault: null,
  };
}

/* ---------- Подготовка к синхронизации ----------
   У каждого объекта есть updatedAt (когда изменён), удалённые попадают в state.deletions.
   Метки ставятся автоматически в save(): сравниваем с прошлым снимком. Так любой код,
   который меняет state и вызывает save(), сразу «готов к синхронизации». */

const SYNC_COLLS = { currencies: 'code', accounts: 'id', categories: 'id', transactions: 'id', recurring: 'id' };
const ORDERED = ['accounts', 'categories', 'currencies']; // порядок важен — храним его в поле sort
let snapshot = null;

let state = load();

function load() {
  let s = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) s = migrate(JSON.parse(raw));
  } catch (e) { console.error(e); }
  s ||= migrate(defaultState());
  // первый запуск новой версии: проставляем метки всем старым данным
  snapshot = takeSnapshot(s);
  stampChanges(s);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
  return s;
}
function migrate(s) {
  const d = defaultState();
  s.settings = Object.assign({}, d.settings, s.settings || {});
  for (const k of ['currencies', 'accounts', 'categories', 'transactions', 'recurring', 'deletions']) if (!Array.isArray(s[k])) s[k] = d[k] || [];
  s.version = 2;
  return s;
}

function deviceId() {
  try {
    let id = localStorage.getItem('monetka-device');
    if (!id) { id = 'dev-' + uid(); localStorage.setItem('monetka-device', id); }
    return id;
  } catch (e) { return 'dev-unknown'; }
}

function itemHash(item) { const { updatedAt, updatedBy, ...rest } = item; return JSON.stringify(rest); }

function takeSnapshot(s) {
  const snap = { settings: itemHash(s.settings), vault: JSON.stringify(s.vault || null) };
  for (const [coll, key] of Object.entries(SYNC_COLLS)) {
    if (ORDERED.includes(coll)) s[coll].forEach((x, i) => { x.sort = i; });
    snap[coll] = new Map(s[coll].map(x => [x[key], itemHash(x)]));
  }
  return snap;
}

function stampChanges(s) {
  const t = Date.now(), dev = deviceId();
  const prev = snapshot || { settings: null };
  const next = takeSnapshot(s);
  if (prev.vault !== undefined && prev.vault !== next.vault) s.vaultUpdatedAt = t;
  if (prev.settings !== next.settings || !s.settings.updatedAt) { s.settings.updatedAt = t; next.settings = itemHash(s.settings); }
  s.deletions ||= [];
  for (const [coll, key] of Object.entries(SYNC_COLLS)) {
    const before = prev[coll] || new Map();
    for (const x of s[coll]) {
      if (before.get(x[key]) !== next[coll].get(x[key]) || !x.updatedAt) { x.updatedAt = t; x.updatedBy = dev; }
    }
    // исчезнувшие объекты → «надгробия», чтобы удаление дошло до других устройств
    for (const id of before.keys()) {
      if (!next[coll].has(id)) {
        s.deletions = s.deletions.filter(d => !(d.coll === coll && d.id === id));
        s.deletions.push({ coll, id, deletedAt: t, deletedBy: dev });
      }
    }
    // объект вернулся (например, загрузили копию) — убираем надгробие
    s.deletions = s.deletions.filter(d => d.coll !== coll || !next[coll].has(d.id));
  }
  snapshot = next;
}

function save() {
  stampChanges(state);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) { toast('Не удалось сохранить: ' + e.message); }
  scheduleSync();
}

// Что изменилось после момента since (для отправки на сервер)
function changesSince(since = 0) {
  const out = { since, at: Date.now(), device: deviceId(), collections: {}, deletions: state.deletions.filter(d => d.deletedAt > since) };
  for (const coll of Object.keys(SYNC_COLLS)) out.collections[coll] = state[coll].filter(x => (x.updatedAt || 0) > since);
  if ((state.settings.updatedAt || 0) > since) out.settings = state.settings;
  if ((state.vaultUpdatedAt || 0) > since) { out.vault = state.vault || null; out.vaultUpdatedAt = state.vaultUpdatedAt; }
  return out;
}

// Принять изменения с сервера: побеждает более позднее изменение
function applyRemote(ch) {
  let changed = 0;
  for (const [coll, key] of Object.entries(SYNC_COLLS)) {
    for (const r of ch.collections?.[coll] || []) {
      const i = state[coll].findIndex(x => x[key] === r[key]);
      const tomb = state.deletions.find(d => d.coll === coll && d.id === r[key]);
      if (tomb && tomb.deletedAt >= r.updatedAt) continue;
      if (i < 0) { state[coll].push(r); changed++; }
      else if ((r.updatedAt || 0) > (state[coll][i].updatedAt || 0)) { state[coll][i] = r; changed++; }
    }
    if (ORDERED.includes(coll)) state[coll].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  }
  for (const d of ch.deletions || []) {
    const key = SYNC_COLLS[d.coll];
    if (!key) continue;
    const i = state[d.coll].findIndex(x => x[key] === d.id);
    if (i >= 0 && (state[d.coll][i].updatedAt || 0) <= d.deletedAt) { state[d.coll].splice(i, 1); changed++; }
    if (!state.deletions.some(x => x.coll === d.coll && x.id === d.id)) state.deletions.push(d);
  }
  if (ch.vaultUpdatedAt && ch.vaultUpdatedAt > (state.vaultUpdatedAt || 0)) { state.vault = ch.vault; state.vaultUpdatedAt = ch.vaultUpdatedAt; changed++; }
  if (ch.settings && (ch.settings.updatedAt || 0) > (state.settings.updatedAt || 0)) { state.settings = ch.settings; changed++; }
  // сохраняем без новых меток: у пришедших объектов свои
  snapshot = takeSnapshot(state);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  return changed;
}

/* ================= Helpers ================= */

const cur = code => state.currencies.find(c => c.code === code) || { code, symbol: code, decimals: 2, perUSD: 1 };
const acc = id => state.accounts.find(a => a.id === id);
const catById = id => state.categories.find(c => c.id === id);

function round(v, decimals) { const m = 10 ** decimals; return Math.round(v * m) / m; }
function fmtNum(v, decimals = 2) {
  const min = Number.isInteger(round(v, decimals)) ? 0 : decimals;
  return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: min, maximumFractionDigits: decimals }).format(v);
}
function fmt(v, code, sign = false) {
  const c = cur(code);
  const s = sign ? (v > 0 ? '+' : v < 0 ? '−' : '') : (v < 0 ? '−' : '');
  const sym = c.symbol || c.code;
  const num = fmtNum(Math.abs(v), c.decimals);
  return sym.length <= 1 && sym !== '₫' && sym !== '₽' ? `${s}${sym}${num}` : `${s}${num} ${sym}`;
}
function convert(amount, from, to) {
  if (from === to) return amount;
  return amount / (cur(from).perUSD || 1) * (cur(to).perUSD || 1);
}
const base = () => state.settings.baseCurrency;

function balanceOf(a, upto) {
  let b = Number(a.initial) || 0;
  for (const t of state.transactions) {
    if (upto && t.date > upto) continue;
    if (t.type === 'expense' && t.accountId === a.id) b -= t.amount;
    else if (t.type === 'income' && t.accountId === a.id) b += t.amount;
    else if (t.type === 'adjust' && t.accountId === a.id) b += t.amount;
    else if (t.type === 'transfer') {
      if (t.accountId === a.id) b -= t.amount;
      if (t.toAccountId === a.id) b += (t.toAmount ?? t.amount);
    }
  }
  return b;
}

// Сумма операции в нужной валюте (для выбранного счёта — в его валюте, для всех — в базовой)
function txValue(t, accountFilter) {
  const a = acc(t.accountId);
  if (!a) return 0;
  return accountFilter ? t.amount : convert(t.amount, a.currency, base());
}
function viewCurrency(accountFilter) { return accountFilter ? (acc(accountFilter)?.currency || base()) : base(); }

function txMatches(t, accountFilter) {
  if (!accountFilter) return true;
  return t.accountId === accountFilter || t.toAccountId === accountFilter;
}

function monthLabel(y, m) { return `${MONTHS[m]} ${y}`; }
function shiftMonth(y, m, delta) { const d = new Date(y, m + delta, 1); return [d.getFullYear(), d.getMonth()]; }
function dayLabel(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const t = today();
  const yest = (() => { const x = new Date(); x.setDate(x.getDate() - 1); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`; })();
  const pre = dateStr === t ? 'Сегодня, ' : dateStr === yest ? 'Вчера, ' : '';
  return `${pre}${d} ${MONTHS_GEN[m - 1]}${y !== new Date().getFullYear() ? ' ' + y : ''}, ${WEEKDAYS[dt.getDay()]}`;
}

function toast(msg) {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = 'toast'; el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

/* ================= UI state ================= */

const now = new Date();
const ui = {
  tab: 'records',
  year: now.getFullYear(), month: now.getMonth(),
  account: null, // фильтр по счёту (null = все)
  chartType: 'expense', chartPeriod: 'month',
  calY: now.getFullYear(), calM: now.getMonth(), calSel: null,
  sheet: null, // { kind, ...data }
};

/* ================= Render ================= */

const app = document.getElementById('app');

function render() {
  applyTheme();
  const sheetScroll = document.querySelector('.sheet')?.scrollTop || 0;
  const screens = { records: renderRecords, charts: renderCharts, accounts: renderAccounts, settings: renderSettings, recurring: renderRecurring, vault: renderVault };
  app.innerHTML = `<main class="screen">${screens[ui.tab]()}</main>${renderTabbar()}${ui.sheet ? renderSheet() : ''}`;
  const sh = document.querySelector('.sheet');
  if (sh && sheetScroll) sh.scrollTop = sheetScroll;
  ui.sheetAnimated = !!ui.sheet;
}

function applyTheme() {
  const t = state.settings.theme;
  if (state.settings.accent === 'orange') document.documentElement.setAttribute('data-accent', 'orange');
  else document.documentElement.removeAttribute('data-accent');
  // цвет строки состояния iPhone под фон приложения
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', bg));
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
}

function renderTabbar() {
  const overdue = state.recurring.length ? overdueList().length + occInRange(today(), today()).filter(o => o.status === 'today').length : 0;
  const tab = (id, icon, label, badge) => `<button class="tab ${ui.tab === id || (id === 'accounts' && (ui.tab === 'settings' || ui.tab === 'vault')) ? 'on' : ''}" data-act="tab" data-v="${id}"><span class="ti">${icon}${badge ? `<b class="badge">${badge}</b>` : ''}</span>${label}</button>`;
  return `<nav class="tabbar">
    ${tab('records', '📒', 'Записи')}${tab('charts', '📊', 'Графики')}
    <button class="fab" data-act="new-tx" aria-label="Добавить">+</button>
    ${tab('recurring', '📅', 'Платежи', overdue)}${tab('accounts', '👛', 'Счета')}
  </nav>`;
}

function monthSwitch() {
  return `<div class="month-switch">
    <button data-act="month" data-v="-1">‹</button><span>${monthLabel(ui.year, ui.month)}</span><button data-act="month" data-v="1">›</button>
  </div>`;
}

function accountChips() {
  return `<div class="chips">
    <button class="chip ${!ui.account ? 'on' : ''}" data-act="filter-acc" data-v="">Все счета</button>
    ${state.accounts.map(a => `<button class="chip ${ui.account === a.id ? 'on' : ''}" data-act="filter-acc" data-v="${a.id}">${accIcon(a.icon, true)} ${esc(a.name)}</button>`).join('')}
  </div>`;
}

function monthTx(y, m, accountFilter) {
  const key = `${y}-${pad(m + 1)}`;
  return state.transactions.filter(t => ym(t.date) === key && txMatches(t, accountFilter));
}

function sums(list, accountFilter) {
  let inc = 0, exp = 0;
  for (const t of list) {
    if (t.type === 'income') inc += txValue(t, accountFilter);
    else if (t.type === 'expense') exp += txValue(t, accountFilter);
  }
  return { inc, exp };
}

/* ---------- Records ---------- */

function renderRecords() {
  const list = monthTx(ui.year, ui.month, ui.account);
  const vc = viewCurrency(ui.account);
  const { inc, exp } = sums(list, ui.account);
  const byDay = {};
  for (const t of list) (byDay[t.date] ||= []).push(t);
  const days = Object.keys(byDay).sort().reverse();

  return `
    <div class="topbar">${monthSwitch()}</div>
    ${accountChips()}
    <div class="card summary">
      <div class="stat big"><div class="label">Итого за месяц${ui.account ? '' : ' (в ' + base() + ')'}</div><div class="val ${inc - exp >= 0 ? 'income' : 'expense'}">${fmt(inc - exp, vc, true)}</div></div>
      <div class="stat"><div class="label">Расходы</div><div class="val expense">${fmt(exp, vc)}</div></div>
      <div class="stat"><div class="label">Доходы</div><div class="val income">${fmt(inc, vc)}</div></div>
    </div>
    ${days.length ? days.map(d => {
      const items = byDay[d].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      const s = sums(items, ui.account);
      const net = s.inc - s.exp;
      return `<div class="day">
        <div class="day-head"><span>${dayLabel(d)}</span><span>${net ? fmt(net, vc, true) : ''}</span></div>
        <div class="list">${items.map(txRow).join('')}</div>
      </div>`;
    }).join('') : `<div class="empty"><div class="e">🪙</div>Записей за этот месяц нет.<br>Нажмите «+», чтобы добавить.</div>`}
  `;
}

function txRow(t) {
  const a = acc(t.accountId);
  const currency = a?.currency || base();
  if (t.type === 'adjust') {
    return `<button class="row" data-act="edit-tx" data-v="${t.id}">
      <div class="ico" style="background:var(--card-2)">⚖️</div>
      <div class="mid"><div class="title">Корректировка баланса</div><div class="sub">${esc(a?.name || '?')}${t.note ? ' · ' + esc(t.note) : ''}</div></div>
      <div class="amt muted">${fmt(t.amount, currency, true)}</div>
    </button>`;
  }
  if (t.type === 'transfer') {
    const to = acc(t.toAccountId);
    const toCur = to?.currency || currency;
    const sameCur = currency === toCur;
    return `<button class="row" data-act="edit-tx" data-v="${t.id}">
      <div class="ico" style="background:color-mix(in srgb, var(--transfer) 20%, transparent)">🔁</div>
      <div class="mid"><div class="title">Перевод</div><div class="sub">${esc(a?.name || '?')} → ${esc(to?.name || '?')}${t.note ? ' · ' + esc(t.note) : ''}</div></div>
      <div class="amt transfer">${fmt(t.amount, currency)}${sameCur ? '' : `<div class="sub">→ ${fmt(t.toAmount ?? t.amount, toCur)}</div>`}</div>
    </button>`;
  }
  const c = catById(t.categoryId) || { icon: '❔', name: 'Без категории', color: '#90a4ae' };
  return `<button class="row" data-act="edit-tx" data-v="${t.id}">
    <div class="ico" style="background:${c.color}33">${c.icon}</div>
    <div class="mid"><div class="title">${esc(t.note || c.name)}</div><div class="sub">${t.recurringId ? '🔁 ' : ''}${t.note ? esc(c.name) + ' · ' : ''}${esc(a?.name || '?')}</div></div>
    <div class="amt ${t.type}">${fmt(t.type === 'expense' ? -t.amount : t.amount, currency, true)}</div>
  </button>`;
}

/* ---------- Charts ---------- */

function renderCharts() {
  const vc = viewCurrency(ui.account);
  const isYear = ui.chartPeriod === 'year';
  const periodTx = state.transactions.filter(t => txMatches(t, ui.account) &&
    (isYear ? t.date.startsWith(String(ui.year)) : ym(t.date) === `${ui.year}-${pad(ui.month + 1)}`));
  const typeTx = periodTx.filter(t => t.type === ui.chartType && (!ui.account || t.accountId === ui.account));

  // По категориям
  const byCat = {};
  let total = 0;
  for (const t of typeTx) { const v = txValue(t, ui.account); byCat[t.categoryId] = (byCat[t.categoryId] || 0) + v; total += v; }
  const cats = Object.entries(byCat).map(([id, v]) => ({ c: catById(id) || { icon: '❔', name: 'Без категории', color: '#90a4ae' }, v })).sort((a, b) => b.v - a.v);

  // По дням / месяцам
  let buckets;
  if (isYear) {
    buckets = MONTHS_SHORT.map((l, i) => ({ label: l, v: 0, key: `${ui.year}-${pad(i + 1)}` }));
    for (const t of typeTx) buckets[Number(t.date.slice(5, 7)) - 1].v += txValue(t, ui.account);
  } else {
    const dim = new Date(ui.year, ui.month + 1, 0).getDate();
    buckets = Array.from({ length: dim }, (_, i) => ({ label: String(i + 1), v: 0 }));
    for (const t of typeTx) buckets[Number(t.date.slice(8, 10)) - 1].v += txValue(t, ui.account);
  }

  // Доходы vs расходы за 6 месяцев
  const months6 = [];
  for (let i = 5; i >= 0; i--) {
    const [y, m] = shiftMonth(ui.year, ui.month, -i);
    const s = sums(monthTx(y, m, ui.account).filter(t => !ui.account || t.accountId === ui.account), ui.account);
    months6.push({ label: MONTHS_SHORT[m], inc: s.inc, exp: s.exp });
  }

  // Баланс на конец месяца за 12 месяцев
  const bal12 = [];
  for (let i = 11; i >= 0; i--) {
    const [y, m] = shiftMonth(ui.year, ui.month, -i);
    const end = `${y}-${pad(m + 1)}-${pad(new Date(y, m + 1, 0).getDate())}`;
    const v = ui.account ? balanceOf(acc(ui.account), end)
      : state.accounts.reduce((s, a) => s + convert(balanceOf(a, end), a.currency, base()), 0);
    bal12.push({ label: MONTHS_SHORT[m], v });
  }

  const typeName = ui.chartType === 'expense' ? 'Расходы' : 'Доходы';
  const color = ui.chartType === 'expense' ? 'var(--expense)' : 'var(--income)';

  return `
    <div class="topbar">${isYear ? `<div class="month-switch"><button data-act="year" data-v="-1">‹</button><span>${ui.year}</span><button data-act="year" data-v="1">›</button></div>` : monthSwitch()}</div>
    <div class="seg">
      <button class="${!isYear ? 'on' : ''}" data-act="chart-period" data-v="month">Месяц</button>
      <button class="${isYear ? 'on' : ''}" data-act="chart-period" data-v="year">Год</button>
    </div>
    ${accountChips()}
    <div class="seg">
      <button class="${ui.chartType === 'expense' ? 'on' : ''}" data-act="chart-type" data-v="expense">Расходы</button>
      <button class="${ui.chartType === 'income' ? 'on' : ''}" data-act="chart-type" data-v="income">Доходы</button>
    </div>

    <div class="card">
      <h3>${typeName} по категориям</h3>
      ${cats.length ? `
        <div class="donut-wrap">${donut(cats.map(x => ({ v: x.v, color: x.c.color })))}
          <div class="donut-center"><div class="muted small">${typeName}</div><div class="val">${fmt(total, vc)}</div></div></div>
        <div class="legend">${cats.map(x => `<div class="row">
          <div class="ico" style="background:${x.c.color}33">${x.c.icon}</div>
          <div class="mid"><div class="title">${esc(x.c.name)} <span class="muted small">${(x.v / total * 100).toFixed(1)}%</span></div>
            <div class="bar-track"><div class="bar-fill" style="width:${x.v / cats[0].v * 100}%;background:${x.c.color}"></div></div></div>
          <div class="amt">${fmt(x.v, vc)}</div></div>`).join('')}</div>`
      : `<div class="empty">Нет данных за период</div>`}
    </div>

    <div class="card">
      <h3>${typeName} по ${isYear ? 'месяцам' : 'дням'}</h3>
      ${barChart(buckets, color, vc)}
    </div>

    <div class="card">
      <h3>Доходы и расходы, 6 месяцев</h3>
      ${groupedBars(months6, vc)}
      <div class="chart-legend"><span><i class="dot" style="background:var(--income)"></i>Доходы</span><span><i class="dot" style="background:var(--expense)"></i>Расходы</span></div>
    </div>

    <div class="card">
      <h3>Баланс${ui.account ? ' счёта' : ' (все счета, ' + base() + ')'}, 12 месяцев</h3>
      ${lineChart(bal12, vc)}
    </div>
    ${!ui.account ? `<div class="note-box">Когда выбраны все счета, суммы пересчитываются в ${base()} по курсам из настроек.</div>` : ''}
  `;
}

function donut(parts) {
  const r = 70, sw = 26, C = 2 * Math.PI * r;
  const total = parts.reduce((s, p) => s + p.v, 0) || 1;
  let off = 0;
  const segs = parts.map(p => {
    const len = p.v / total * C;
    const gap = parts.length > 1 ? Math.min(2, len / 3) : 0;
    const s = `<circle r="${r}" cx="90" cy="90" fill="none" stroke="${p.color}" stroke-width="${sw}"
      stroke-dasharray="${Math.max(len - gap, 0.01)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 90 90)"/>`;
    off += len;
    return s;
  });
  return `<svg width="180" height="180" viewBox="0 0 180 180">${segs.join('')}</svg>`;
}

function shortNum(v) {
  const a = Math.abs(v);
  const s = v < 0 ? '−' : '';
  if (a >= 1e9) return s + (a / 1e9).toFixed(a >= 1e10 ? 0 : 1).replace('.0', '') + 'млрд';
  if (a >= 1e6) return s + (a / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace('.0', '') + 'м';
  if (a >= 1e3) return s + (a / 1e3).toFixed(a >= 1e4 ? 0 : 1).replace('.0', '') + 'к';
  return s + Math.round(a);
}

function barChart(buckets, color, vc) {
  const W = 320, H = 150, pl = 34, pb = 18, pt = 8;
  const max = Math.max(...buckets.map(b => b.v), 0);
  if (!max) return `<div class="empty">Нет данных за период</div>`;
  const n = buckets.length, bw = (W - pl) / n;
  const y = v => pt + (H - pt - pb) * (1 - v / max);
  const every = n > 15 ? 5 : 1;
  const bars = buckets.map((b, i) => {
    const x = pl + i * bw + bw * 0.15;
    const h = (H - pt - pb) * (b.v / max);
    const lbl = (n > 15 ? ((i + 1) % every === 0 || i === 0) : true) ? `<text x="${x + bw * 0.35}" y="${H - 4}" text-anchor="middle">${b.label}</text>` : '';
    return `<rect x="${x}" y="${y(b.v)}" width="${bw * 0.7}" height="${Math.max(h, b.v ? 1 : 0)}" rx="${Math.min(3, bw * 0.3)}" fill="${color}"><title>${b.label}: ${fmt(b.v, vc)}</title></rect>${lbl}`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%">${grid(W, H, pl, pt, pb, 0, max)}${bars}</svg>
    <div class="muted small" style="text-align:center">Макс.: ${fmt(max, vc)} · Среднее: ${fmt(buckets.reduce((s, b) => s + b.v, 0) / n, vc)}</div>`;
}

function grid(W, H, pl, pt, pb, min, max) {
  let out = '';
  for (let i = 0; i <= 3; i++) {
    const v = min + (max - min) * i / 3;
    const yy = pt + (H - pt - pb) * (1 - i / 3);
    out += `<line x1="${pl}" x2="${W}" y1="${yy}" y2="${yy}" stroke="var(--line)" stroke-width="1"/><text x="${pl - 4}" y="${yy + 3}" text-anchor="end">${shortNum(v)}</text>`;
  }
  return out;
}

function groupedBars(data, vc) {
  const W = 320, H = 150, pl = 34, pb = 18, pt = 8;
  const max = Math.max(...data.flatMap(d => [d.inc, d.exp]), 0);
  if (!max) return `<div class="empty">Нет данных</div>`;
  const gw = (W - pl) / data.length, bw = gw * 0.32;
  const hh = v => (H - pt - pb) * (v / max);
  const bars = data.map((d, i) => {
    const x = pl + i * gw + gw * 0.15;
    return `<rect x="${x}" y="${H - pb - hh(d.inc)}" width="${bw}" height="${hh(d.inc)}" rx="3" fill="var(--income)"><title>Доходы: ${fmt(d.inc, vc)}</title></rect>
      <rect x="${x + bw + 2}" y="${H - pb - hh(d.exp)}" width="${bw}" height="${hh(d.exp)}" rx="3" fill="var(--expense)"><title>Расходы: ${fmt(d.exp, vc)}</title></rect>
      <text x="${x + bw + 1}" y="${H - 4}" text-anchor="middle">${d.label}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%">${grid(W, H, pl, pt, pb, 0, max)}${bars}</svg>`;
}

function lineChart(data, vc, opts = {}) {
  const W = 320, H = 150, pl = 34, pb = 18, pt = 10;
  let min = Math.min(...data.map(d => d.v), opts.tight ? Infinity : 0), max = Math.max(...data.map(d => d.v), opts.tight ? -Infinity : 0);
  if (opts.tight) { const pad = (max - min) * 0.15 || Math.abs(max) * 0.05 || 1; min -= pad; max += pad; }
  if (min === max) max = min + 1;
  const n = data.length, step = (W - pl - 10) / (n - 1);
  const x = i => pl + 5 + i * step;
  const y = v => pt + (H - pt - pb) * (1 - (v - min) / (max - min));
  const pts = data.map((d, i) => `${x(i)},${y(d.v)}`).join(' ');
  const area = `${x(0)},${y(Math.max(min, 0))} ${pts} ${x(n - 1)},${y(Math.max(min, 0))}`;
  const labels = data.map((d, i) => i % 2 === n % 2 ? '' : `<text x="${x(i)}" y="${H - 4}" text-anchor="middle">${d.label}</text>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%">${grid(W, H, pl, pt, pb, min, max)}
    <polygon points="${area}" fill="var(--accent)" opacity=".15"/>
    <polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${data.map((d, i) => `<circle cx="${x(i)}" cy="${y(d.v)}" r="3" fill="var(--accent)"><title>${d.label}: ${fmt(d.v, vc)}</title></circle>`).join('')}
    ${labels}</svg>
    <div class="muted small" style="text-align:center">Сейчас: ${fmt(data[n - 1].v, vc)}</div>`;
}

/* ---------- Accounts ---------- */

function renderAccounts() {
  const total = state.accounts.reduce((s, a) => s + convert(balanceOf(a), a.currency, base()), 0);
  const byCur = {};
  for (const a of state.accounts) byCur[a.currency] = (byCur[a.currency] || 0) + balanceOf(a);
  return `
    <div class="topbar"><h1>Счета</h1><div><button class="link" data-act="new-transfer">🔁 Перевод</button><button class="link gear" data-act="open-vault" aria-label="Копилка">🐷</button><button class="link gear" data-act="tab" data-v="settings" aria-label="Настройки">⚙️</button></div></div>
    <div class="card">
      <div class="stat big"><div class="label">Всего (≈ в ${base()})</div><div class="val">${fmt(total, base())}</div></div>
      <div class="chips" style="margin-top:10px;padding-bottom:2px">${Object.entries(byCur).map(([c, v]) => `<span class="chip">${fmt(v, c)}</span>`).join('')}</div>
    </div>
    ${state.accounts.map(a => {
      const b = balanceOf(a);
      return `<button class="acc-card" data-act="edit-acc" data-v="${a.id}">
        <div class="ico" style="${accIcoStyle(a)}">${accIcon(a.icon)}</div>
        <div class="mid" style="flex:1;min-width:0"><div class="title" style="font-weight:600">${esc(a.name)}</div><div class="muted small">${a.currency}</div></div>
        <div class="bal"><div class="${b < 0 ? 'expense' : ''}">${fmt(b, a.currency)}</div>${a.currency !== base() ? `<div class="muted small">≈ ${fmt(convert(b, a.currency, base()), base())}</div>` : ''}</div>
      </button>`;
    }).join('')}
    <button class="btn ghost" data-act="new-acc">＋ Добавить счёт</button>
  `;
}

/* ---------- Settings ---------- */

function renderSettings() {
  return `
    <div class="topbar"><button class="link" data-act="tab" data-v="accounts">‹ Счета</button><h1>Настройки</h1><span style="width:60px"></span></div>

    <div class="section-title">Основное</div>
    <div class="field"><label>Основная валюта</label>
      <select data-change="base-cur">${state.currencies.map(c => `<option value="${c.code}" ${c.code === base() ? 'selected' : ''}>${c.code} · ${esc(c.name)}</option>`).join('')}</select></div>
    <div class="field"><label>Порядок категорий</label>
      <select data-change="cat-sort"><option value="1" ${state.settings.sortCatsByUse ? 'selected' : ''}>Частые — впереди</option><option value="0" ${state.settings.sortCatsByUse ? '' : 'selected'}>Как в списке</option></select></div>
    <div class="field"><label>Цвет</label>
      <select data-change="accent">${[['blue', 'Голубой'], ['orange', 'Оранжевый']].map(([v, l]) => `<option value="${v}" ${(state.settings.accent || 'blue') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <div class="field"><label>Тема</label>
      <select data-change="theme">${[['auto', 'Как в системе'], ['light', 'Светлая'], ['dark', 'Тёмная']].map(([v, l]) => `<option value="${v}" ${state.settings.theme === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>

    <div class="section-title">Валюты и курсы</div>
    <div class="list">${state.currencies.map(c => `<button class="row" data-act="edit-cur" data-v="${c.code}">
      <div class="ico" style="background:var(--card-2);font-size:15px;font-weight:700">${esc(c.symbol)}</div>
      <div class="mid"><div class="title">${c.code} · ${esc(c.name)}</div><div class="sub">1 USD = ${fmtNum(c.perUSD, 4)} ${c.code}</div></div><span class="chev">›</span></button>`).join('')}</div>
    <div class="btn-row"><button class="btn ghost" data-act="new-cur">＋ Валюта</button><button class="btn ghost" data-act="update-rates">🌐 Обновить курсы</button></div>
    ${state.settings.ratesUpdated ? `<div class="muted small" style="margin:6px">Курсы обновлены: ${esc(state.settings.ratesUpdated)}</div>` : ''}

    <div class="section-title">Категории</div>
    <div class="btn-row"><button class="btn ghost" data-act="cats" data-v="expense">Расходы</button><button class="btn ghost" data-act="cats" data-v="income">Доходы</button></div>

    <div class="section-title">Синхронизация</div>
    <div class="list"><button class="row" data-act="sync-open">
      <div class="ico" style="background:var(--card-2)">☁️</div>
      <div class="mid"><div class="title">Синхронизация и копия на сервере</div><div class="sub">${esc(syncStatusText())}</div></div><span class="chev">›</span></button></div>

    <div class="section-title">Данные</div>
    <div class="note-box">${syncCfg() ? 'Данные хранятся на телефоне, а зашифрованная копия — на вашем сервере.' : 'Все данные хранятся только на этом телефоне.'} Время от времени делайте резервную копию: файл можно сохранить в «Файлы» или Google Drive, а потом загрузить обратно.</div>
    <button class="btn" data-act="export">📤 Сохранить резервную копию</button>
    <button class="btn ghost" data-act="import">📥 Загрузить из файла</button>
    <button class="btn ghost" data-act="csv">📄 Экспорт в CSV (Excel)</button>
    <button class="btn danger" data-act="wipe">Удалить все данные</button>
    <div class="muted small" style="text-align:center;margin-top:16px">Монетка · версия ${APP_VERSION} · записей: ${state.transactions.length}</div>
  `;
}

/* ================= Sheets ================= */

function openSheet(s) { ui.sheet = s; render(); }
function closeSheet() { ui.sheet = null; render(); }

function renderSheet() {
  const s = ui.sheet;
  const body = { tx: sheetTx, acc: sheetAcc, cur: sheetCur, cats: sheetCats, cat: sheetCat, rec: sheetRec, adjust: sheetAdjust, vsnap: sheetVSnap, vacc: sheetVAcc, vset: sheetVSet, vgoal: sheetVGoal, sync: sheetSync }[s.kind]();
  const anim = ui.sheetAnimated ? '' : ' anim';
  return `<div class="overlay${anim}" data-act="overlay"><div class="sheet${anim}"><div class="grab"></div>${body}</div></div>`;
}

/* ---------- Transaction ---------- */

// Последняя дата записи: подставляем её в новую запись, если с прошлой записи прошло меньше часа
const DATE_MEMORY_MS = 60 * 60 * 1000;
function shortDate(ds) {
  if (ds === today()) return 'Сегодня';
  if (ds === addDays(today(), -1)) return 'Вчера';
  const d = parseD(ds);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}${d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : ''}, ${WEEKDAYS[d.getDay()]}`;
}
function rememberDate(date) { try { localStorage.setItem('monetka-lastdate', JSON.stringify({ date, at: Date.now() })); } catch (e) {} }
function rememberedDate() {
  try {
    const m = JSON.parse(localStorage.getItem('monetka-lastdate') || 'null');
    if (m && m.date && Date.now() - m.at < DATE_MEMORY_MS) return m.date;
  } catch (e) {}
  return today();
}

// Категории для выбора. Правило: категория, которую выбрали 3 раза, встаёт на первое место.
// Для каждой категории берём момент её 3-го с конца выбора — у кого он свежее, тот и впереди.
// Категории, выбранные меньше 3 раз, остаются в ручном порядке.
const CAT_PROMOTE_AFTER = 3;
function categoriesByUse(type) {
  const list = state.categories.filter(c => c.type === type);
  if (!state.settings.sortCatsByUse) return list;
  const uses = {};
  for (const t of state.transactions) {
    if (t.type !== type || !t.categoryId) continue;
    (uses[t.categoryId] ||= []).push(t.createdAt || parseD(t.date).getTime());
  }
  const key = c => {
    const u = uses[c.id];
    if (!u || u.length < CAT_PROMOTE_AFTER) return -1;
    u.sort((a, b) => b - a);
    return u[CAT_PROMOTE_AFTER - 1];
  };
  return list.map((c, i) => ({ c, i, k: key(c) })).sort((a, b) => b.k - a.k || a.i - b.i).map(x => x.c);
}

function newTxSheet(type = 'expense') {
  const lastAcc = state.transactions.length ? state.transactions.reduce((a, b) => ((a.createdAt || 0) > (b.createdAt || 0) ? a : b)).accountId : null;
  const accountId = ui.account || (acc(lastAcc) ? lastAcc : state.accounts[0]?.id);
  const other = state.accounts.find(a => a.id !== accountId);
  openSheet({ kind: 'tx', id: null, type, expr: '', toExpr: '', field: 'amount', accountId, toAccountId: other?.id || accountId,
    categoryId: null, date: rememberedDate(), note: '' });
}

function editTxSheet(id) {
  const t = state.transactions.find(x => x.id === id);
  if (!t) return;
  if (t.type === 'adjust') return adjustSheet(t.accountId, t);
  openSheet({ kind: 'tx', id, type: t.type, expr: String(t.amount), toExpr: t.toAmount != null ? String(t.toAmount) : '', field: 'amount',
    accountId: t.accountId, toAccountId: t.toAccountId, categoryId: t.categoryId, date: t.date, note: t.note || '' });
}

function evalExpr(expr) {
  const s = String(expr).replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/,/g, '.').replace(/[+\-*/.]+$/, '');
  if (!s) return 0;
  const tokens = s.match(/\d*\.?\d+|[+\-*/]/g);
  if (!tokens) return 0;
  // сначала × и ÷, потом + и −
  const out = [];
  let i = 0;
  const num = () => parseFloat(tokens[i++]);
  let cur = num();
  while (i < tokens.length) {
    const op = tokens[i++]; const n = num();
    if (op === '*') cur *= n; else if (op === '/') cur = n ? cur / n : cur;
    else { out.push(cur, op); cur = n; }
  }
  out.push(cur);
  let r = out[0];
  for (let j = 1; j < out.length; j += 2) r = out[j] === '+' ? r + out[j + 1] : r - out[j + 1];
  return isFinite(r) ? r : 0;
}

function sheetTx() {
  const s = ui.sheet;
  const a = acc(s.accountId);
  const to = acc(s.toAccountId);
  const ccy = a?.currency || base();
  const isTransfer = s.type === 'transfer';
  const crossCur = isTransfer && to && a && to.currency !== a.currency;
  const cats = categoriesByUse(s.type);
  const accOptions = sel => state.accounts.map(x => `<option value="${x.id}" ${x.id === sel ? 'selected' : ''}>${accIconText(x.icon)}${esc(x.name)} (${x.currency})</option>`).join('');
  const autoTo = crossCur && !s.toExpr ? fmtNum(round(convert(evalExpr(s.expr), a.currency, to.currency), cur(to.currency).decimals), cur(to.currency).decimals) : null;

  return `
    <div class="sheet-head"><button class="link" data-act="close">Отмена</button><h2>${s.id ? 'Изменить' : 'Новая запись'}</h2><button class="link" data-act="save-tx">Готово</button></div>
    <div class="seg">
      ${[['expense', 'Расход'], ['income', 'Доход'], ['transfer', 'Перевод']].map(([v, l]) => `<button class="${s.type === v ? 'on' : ''}" data-act="tx-type" data-v="${v}">${l}</button>`).join('')}
    </div>
    ${crossCur ? '<div class="amount-label">Списать</div>' : ''}
    <div class="amount-box ${crossCur && s.field === 'amount' ? 'sel' : ''}" data-act="tx-field" data-v="amount">
      <div class="expr ${s.type}">${esc(prettyExpr(s.expr) || '0')}</div><div class="cur">${esc(cur(ccy).symbol)}</div></div>
    ${crossCur ? `<div class="amount-label">Зачислить (${to.currency})</div>
      <div class="amount-box ${s.field === 'to' ? 'sel' : ''}" data-act="tx-field" data-v="to">
      <div class="expr ${s.toExpr ? '' : 'muted'}" style="font-size:26px">${esc(prettyExpr(s.toExpr) || autoTo || '0')}</div><div class="cur">${esc(cur(to.currency).symbol)}</div></div>` : ''}

    ${isTransfer ? `
      <div class="field"><label>Откуда</label><select data-change="tx-acc">${accOptions(s.accountId)}</select></div>
      <div class="field"><label>Куда</label><select data-change="tx-to">${accOptions(s.toAccountId)}</select></div>
    ` : `
      <div class="cat-grid">${cats.map(c => `<button class="cat ${s.categoryId === c.id ? 'on' : ''}" data-act="tx-cat" data-v="${c.id}">
        <div class="ico" style="background:${c.color}33">${c.icon}</div><span>${esc(c.name)}</span></button>`).join('')}</div>
    `}
    <div class="btn-row">
      ${isTransfer ? '' : `<div class="field compact"><select data-change="tx-acc">${accOptions(s.accountId)}</select></div>`}
      <div class="field compact date-field" ${isTransfer ? 'style="grid-column:1/-1"' : ''}><span class="date-label ${s.date !== today() ? 'past' : ''}">📅 ${shortDate(s.date)}</span><input class="date-overlay" type="date" value="${s.date}" data-change="tx-date" aria-label="Дата">${s.date !== today() ? '<button class="link today-btn" data-act="tx-today">Сегодня</button>' : ''}</div>
    </div>
    <div class="field"><label>Заметка</label><input type="text" value="${esc(s.note)}" placeholder="необязательно" data-input="tx-note"></div>

    <div class="keypad">
      ${['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '.', '0', '⌫', '+'].map(k => `<button class="${'÷×−+'.includes(k) ? 'op' : ''}" data-act="key" data-v="${k}">${k}</button>`).join('')}
    </div>
    <button class="btn" data-act="save-tx">Сохранить</button>
    ${s.id ? `<button class="btn danger" data-act="del-tx">Удалить запись</button>` : ''}
  `;
}

// 150000 → 150 000 (только для отображения)
function prettyExpr(e) { return String(e || '').replace(/\d+/g, (m, off, str) => str[off - 1] === '.' ? m : m.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')); }

function pressKey(k) {
  const s = ui.sheet;
  const key = s.field === 'to' ? 'toExpr' : 'expr';
  let e = s[key];
  if (k === '⌫') e = e.slice(0, -1);
  else if ('÷×−+'.includes(k)) { if (!e) return; e = /[÷×−+]$/.test(e) ? e.slice(0, -1) + k : e + k; }
  else if (k === '.') {
    const accId = s.field === 'to' ? s.toAccountId : s.accountId;
    if (cur(acc(accId)?.currency).decimals === 0) return toast('В этой валюте нет копеек');
    const last = e.split(/[÷×−+]/).pop(); if (last.includes('.')) return; e += last ? '.' : '0.'; }
  else { if (e.length > 18) return; const last = e.split(/[÷×−+]/).pop(); e = last === '0' ? e.slice(0, -1) + k : e + k; }
  s[key] = e;
  render();
}

function saveTx() {
  const s = ui.sheet;
  const a = acc(s.accountId);
  if (!a) return toast('Сначала создайте счёт');
  const amount = round(evalExpr(s.expr), cur(a.currency).decimals);
  if (!(amount > 0)) return toast('Введите сумму');
  const t = { id: s.id || uid(), type: s.type, amount, accountId: a.id, date: s.date || today(), note: s.note.trim(),
    createdAt: s.id ? (state.transactions.find(x => x.id === s.id)?.createdAt || Date.now()) : Date.now() };
  if (s.type === 'transfer') {
    const to = acc(s.toAccountId);
    if (!to || to.id === a.id) return toast('Выберите другой счёт для перевода');
    t.toAccountId = to.id;
    t.toAmount = to.currency === a.currency ? amount
      : round(s.toExpr ? evalExpr(s.toExpr) : convert(amount, a.currency, to.currency), cur(to.currency).decimals);
  } else {
    if (!s.categoryId) return toast('Выберите категорию');
    t.categoryId = s.categoryId;
  }
  const i = state.transactions.findIndex(x => x.id === t.id);
  if (i >= 0) state.transactions[i] = t; else state.transactions.push(t);
  save();
  if (!s.id) rememberDate(t.date);
  ui.sheet = null;
  // показываем месяц, в который добавили запись
  const [y, m] = t.date.split('-').map(Number);
  ui.year = y; ui.month = m - 1;
  render();
  toast('Сохранено');
}

/* ---------- Account ---------- */

function sheetAcc() {
  const s = ui.sheet;
  return `
    <div class="sheet-head"><button class="link" data-act="close">Отмена</button><h2>${s.id ? 'Счёт' : 'Новый счёт'}</h2><button class="link" data-act="save-acc">Готово</button></div>
    <div style="display:flex;justify-content:center;margin-bottom:10px"><div class="ico" style="width:64px;height:64px;font-size:32px;${accIcoStyle(s)}">${accIcon(s.icon)}</div></div>
    <div class="field"><label>Название</label><input type="text" value="${esc(s.name)}" placeholder="Например, Карта Тинькофф" data-input="acc-name"></div>
    <div class="field"><label>Валюта</label><select data-change="acc-cur">${state.currencies.map(c => `<option value="${c.code}" ${c.code === s.currency ? 'selected' : ''}>${c.code} · ${esc(c.name)}</option>`).join('')}</select></div>
    <div class="field"><label>Начальный баланс</label><input type="text" inputmode="decimal" value="${esc(s.initial)}" data-input="acc-initial"></div>
    ${s.id ? `<div class="field"><label>Баланс сейчас</label><b style="flex:1;text-align:right">${fmt(balanceOf({ ...acc(s.id), initial: parseFloat(String(s.initial).replace(',', '.')) || 0 }), s.currency)}</b>
      <button class="link" data-act="adjust" data-v="${s.id}">Изменить</button></div>
      <div class="muted small" style="margin:0 6px 10px">«Изменить» — указать, сколько на счёте на самом деле. Начальный баланс меняет всю историю счёта.</div>` : ''}
    <div class="section-title">Иконка</div>
    <div class="icon-pick brands">${Object.keys(BRAND_ICONS).map(k => `<button class="${s.icon === 'bi:' + k ? 'on' : ''}" data-act="acc-icon" data-v="bi:${k}" title="${BRAND_ICONS[k].name}">${brandSVG(k)}</button>`).join('')}</div>
    <div class="icon-pick">${ICONS.map(i => `<button class="${s.icon === i ? 'on' : ''}" data-act="acc-icon" data-v="${i}">${i}</button>`).join('')}</div>
    <div class="section-title">Цвет</div>
    <div class="color-pick">${COLORS.map(c => `<button class="${s.color === c ? 'on' : ''}" style="background:${c}" data-act="acc-color" data-v="${c}"></button>`).join('')}</div>
    <button class="btn" data-act="save-acc">Сохранить</button>
    ${s.id ? `<button class="btn danger" data-act="del-acc">Удалить счёт</button>` : ''}
  `;
}

function saveAcc() {
  const s = ui.sheet;
  if (!s.name.trim()) return toast('Введите название');
  const a = { id: s.id || uid(), name: s.name.trim(), currency: s.currency, initial: parseFloat(String(s.initial).replace(',', '.').replace(/\s/g, '')) || 0, icon: s.icon, color: s.color };
  const i = state.accounts.findIndex(x => x.id === a.id);
  if (i >= 0) state.accounts[i] = a; else state.accounts.push(a);
  save(); closeSheet(); toast('Сохранено');
}

/* ---------- Currency ---------- */

function sheetCur() {
  const s = ui.sheet;
  return `
    <div class="sheet-head"><button class="link" data-act="close">Отмена</button><h2>${s.isNew ? 'Новая валюта' : s.code}</h2><button class="link" data-act="save-cur">Готово</button></div>
    <div class="field"><label>Код</label><input type="text" value="${esc(s.code)}" placeholder="EUR" maxlength="5" ${s.isNew ? '' : 'disabled'} data-input="cur-code" style="text-transform:uppercase"></div>
    <div class="field"><label>Название</label><input type="text" value="${esc(s.name)}" placeholder="Евро" data-input="cur-name"></div>
    <div class="field"><label>Символ</label><input type="text" value="${esc(s.symbol)}" placeholder="€" maxlength="4" data-input="cur-symbol"></div>
    <div class="field"><label>Знаков после запятой</label><select data-change="cur-dec">${[0, 1, 2].map(n => `<option ${n === Number(s.decimals) ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
    <div class="field"><label>1 USD =</label><input type="text" inputmode="decimal" value="${esc(s.perUSD)}" ${s.code === 'USD' ? 'disabled' : ''} data-input="cur-rate"></div>
    <div class="note-box">Курс нужен только для общей суммы по всем счетам и для графиков «все счета». Сами записи хранятся в валюте счёта.</div>
    <button class="btn" data-act="save-cur">Сохранить</button>
    ${!s.isNew && s.code !== 'USD' ? `<button class="btn danger" data-act="del-cur">Удалить валюту</button>` : ''}
  `;
}

function saveCur() {
  const s = ui.sheet;
  const code = s.code.trim().toUpperCase();
  if (!/^[A-Z0-9]{2,5}$/.test(code)) return toast('Код — 2–5 латинских букв, например EUR');
  if (s.isNew && state.currencies.some(c => c.code === code)) return toast('Такая валюта уже есть');
  const perUSD = code === 'USD' ? 1 : parseFloat(String(s.perUSD).replace(',', '.').replace(/\s/g, ''));
  if (!(perUSD > 0)) return toast('Укажите курс');
  const c = { code, name: s.name.trim() || code, symbol: s.symbol.trim() || code, decimals: Number(s.decimals), perUSD };
  const i = state.currencies.findIndex(x => x.code === code);
  if (i >= 0) state.currencies[i] = c; else state.currencies.push(c);
  save(); closeSheet(); toast('Сохранено');
}

async function updateRates() {
  toast('Загружаю курсы…');
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD');
    const j = await r.json();
    if (j.result !== 'success') throw new Error('bad response');
    let n = 0;
    for (const c of state.currencies) if (j.rates[c.code]) { c.perUSD = j.rates[c.code]; n++; }
    state.settings.ratesUpdated = new Date().toLocaleString('ru-RU');
    save(); render(); toast(`Обновлено курсов: ${n}`);
  } catch (e) { toast('Не удалось загрузить курсы. Нет интернета?'); }
}

/* ---------- Categories ---------- */

function sheetCats() {
  const s = ui.sheet;
  const cats = state.categories.filter(c => c.type === s.type);
  return `
    <div class="sheet-head"><span></span><h2>Категории: ${s.type === 'expense' ? 'расходы' : 'доходы'}</h2><button class="link" data-act="close">Готово</button></div>
    <div class="list">${cats.map((c, i) => `<div class="row">
      <div class="ico" style="background:${c.color}33">${c.icon}</div>
      <button class="mid" style="text-align:left" data-act="edit-cat" data-v="${c.id}"><div class="title">${esc(c.name)}</div></button>
      <button class="link" data-act="cat-up" data-v="${c.id}" ${i === 0 ? 'disabled style="opacity:.3"' : ''}>↑</button>
      <button class="chev" data-act="edit-cat" data-v="${c.id}">›</button></div>`).join('')}</div>
    <button class="btn ghost" data-act="new-cat">＋ Новая категория</button>
  `;
}

function sheetCat() {
  const s = ui.sheet;
  return `
    <div class="sheet-head"><button class="link" data-act="back-cats">Назад</button><h2>${s.id ? 'Категория' : 'Новая категория'}</h2><button class="link" data-act="save-cat">Готово</button></div>
    <div style="display:flex;justify-content:center;margin-bottom:10px"><div class="ico" style="width:64px;height:64px;font-size:32px;background:${s.color}33">${s.icon}</div></div>
    <div class="field"><label>Название</label><input type="text" value="${esc(s.name)}" data-input="cat-name"></div>
    <div class="section-title">Иконка</div>
    <div class="icon-pick">${ICONS.map(i => `<button class="${s.icon === i ? 'on' : ''}" data-act="cat-icon" data-v="${i}">${i}</button>`).join('')}</div>
    <div class="section-title">Цвет</div>
    <div class="color-pick">${COLORS.map(c => `<button class="${s.color === c ? 'on' : ''}" style="background:${c}" data-act="cat-color" data-v="${c}"></button>`).join('')}</div>
    <button class="btn" data-act="save-cat">Сохранить</button>
    ${s.id ? `<button class="btn danger" data-act="del-cat">Удалить категорию</button>` : ''}
  `;
}

/* ---------- Backup ---------- */

function fileStamp() { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

async function shareOrDownload(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const file = new File([blob], filename, { type: mime });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return; }
    catch (e) { if (e.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function exportJSON() {
  shareOrDownload(JSON.stringify({ app: 'monetka', exportedAt: new Date().toISOString(), ...state }, null, 2), `monetka-backup-${fileStamp()}.json`, 'application/json');
}

function exportCSV() {
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [['Дата', 'Тип', 'Сумма', 'Валюта', 'Счёт', 'Категория', 'Заметка', 'Счёт получатель', 'Сумма зачисления', 'Валюта зачисления']];
  const types = { expense: 'Расход', income: 'Доход', transfer: 'Перевод', adjust: 'Корректировка' };
  for (const t of [...state.transactions].sort((a, b) => a.date.localeCompare(b.date))) {
    const a = acc(t.accountId), to = acc(t.toAccountId);
    rows.push([t.date, types[t.type], String(t.amount).replace('.', ','), a?.currency, a?.name, catById(t.categoryId)?.name || '', t.note,
      to?.name || '', t.toAmount != null ? String(t.toAmount).replace('.', ',') : '', to?.currency || '']);
  }
  shareOrDownload('﻿' + rows.map(r => r.map(q).join(';')).join('\n'), `monetka-${fileStamp()}.csv`, 'text/csv');
}

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data.transactions) || !Array.isArray(data.accounts)) throw new Error('format');
      if (!confirm(`Загрузить копию? В ней записей: ${data.transactions.length}, счетов: ${data.accounts.length}.\nТекущие данные на телефоне будут заменены.`)) return;
      delete data.app; delete data.exportedAt;
      state = migrate(data);
      save(); render(); toast('Данные загружены');
    } catch (e) { toast('Это не файл резервной копии Монетки'); }
  };
  reader.readAsText(file);
}

/* ================= Регулярные платежи ================= */

const FREQ = { day: 'день', week: 'неделю', month: 'месяц', year: 'год' };
const WEEK_HEAD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function plural(n, forms) { const a = n % 10, b = n % 100; return forms[a === 1 && b !== 11 ? 0 : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? 1 : 2]; }
function dstr(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function parseD(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function addDays(s, n) { const d = parseD(s); d.setDate(d.getDate() + n); return dstr(d); }

// Варианты повтора как в Календаре Apple
const REPEAT_PRESETS = [
  { id: 'd1', label: 'Каждый день', freq: 'day', interval: 1 },
  { id: 'w1', label: 'Каждую неделю', freq: 'week', interval: 1 },
  { id: 'w2', label: 'Каждые 2 недели', freq: 'week', interval: 2 },
  { id: 'm1', label: 'Каждый месяц', freq: 'month', interval: 1 },
  { id: 'y1', label: 'Каждый год', freq: 'year', interval: 1 },
];
const FREQ_UNIT = { day: ['день', 'дня', 'дней'], week: ['неделю', 'недели', 'недель'], month: ['месяц', 'месяца', 'месяцев'], year: ['год', 'года', 'лет'] };
function repeatPresetOf(s) {
  if (s.custom) return 'custom';
  const p = REPEAT_PRESETS.find(p => p.freq === s.freq && p.interval === Number(s.interval));
  return p ? p.id : 'custom';
}
function repeatSummary(s) {
  const n = Number(s.interval) || 1;
  if (n === 1) return { day: 'каждый день', week: 'каждую неделю', month: 'каждый месяц', year: 'каждый год' }[s.freq];
  const every = s.freq === 'week' ? (n % 10 === 1 && n % 100 !== 11 ? 'каждую' : 'каждые') : (n % 10 === 1 && n % 100 !== 11 ? 'каждый' : 'каждые');
  return `${every} ${n} ${plural(n, FREQ_UNIT[s.freq])}`;
}

function freqText(r) { const t = repeatSummary(r); return t[0].toUpperCase() + t.slice(1); }

// Все даты платежа в промежутке [from, to]
function occurrences(r, from, to) {
  const out = [];
  const start = parseD(r.startDate);
  const n = Math.max(1, Number(r.interval) || 1);
  const last = r.endDate && r.endDate < to ? r.endDate : to;
  for (let k = 0; k < 5000; k++) {
    let d;
    if (r.freq === 'day') { d = new Date(start); d.setDate(d.getDate() + k * n); }
    else if (r.freq === 'week') { d = new Date(start); d.setDate(d.getDate() + k * 7 * n); }
    else {
      const months = (r.freq === 'year' ? 12 : 1) * n * k;
      const y = start.getFullYear(), m = start.getMonth() + months;
      const dim = new Date(y, m + 1, 0).getDate();
      d = new Date(y, m, Math.min(start.getDate(), dim));
    }
    const s = dstr(d);
    if (s > last) break;
    if (s >= from) out.push(s);
  }
  return out;
}

function occStatus(r, date) {
  if (state.transactions.some(t => t.recurringId === r.id && t.recurDate === date)) return 'paid';
  if ((r.skipped || []).includes(date)) return 'skipped';
  if (date < (r.createdDay || r.startDate)) return 'old'; // до создания платежа — не считаем долгом
  return date < today() ? 'overdue' : date === today() ? 'today' : 'upcoming';
}

function occInRange(from, to) {
  const list = [];
  for (const r of state.recurring) for (const d of occurrences(r, from, to)) list.push({ r, date: d, status: occStatus(r, d) });
  return list.sort((a, b) => a.date.localeCompare(b.date));
}

function overdueList() {
  const from = addDays(today(), -366);
  return occInRange(from, addDays(today(), -1)).filter(o => o.status === 'overdue');
}

function recCat(r) { return catById(r.categoryId) || { icon: '🔁', name: 'Без категории', color: '#90a4ae' }; }

function payOcc(r, date, silent) {
  const a = acc(r.accountId);
  if (!a) { if (!silent) toast('Счёт этого платежа удалён'); return false; }
  state.transactions.push({ id: uid(), type: r.type, amount: r.amount, accountId: a.id, categoryId: r.categoryId, date, note: r.name,
    createdAt: Date.now(), recurringId: r.id, recurDate: date });
  return true;
}

// Автодобавление: создаём записи для платежей с галочкой «добавлять сами», срок которых наступил
function processAuto() {
  let n = 0;
  for (const r of state.recurring) {
    if (!r.auto) continue;
    for (const d of occurrences(r, r.createdDay || r.startDate, today())) {
      const st = occStatus(r, d);
      if ((st === 'overdue' || st === 'today') && payOcc(r, d, true)) n++;
    }
  }
  if (n) { save(); setTimeout(() => toast(`Добавлено регулярных платежей: ${n}`), 300); }
}

function occRow(o, showDate) {
  const { r, date, status } = o;
  const c = recCat(r);
  const a = acc(r.accountId);
  const ccy = a?.currency || base();
  const label = { paid: '✓ оплачено', skipped: 'пропущено', overdue: 'просрочено', today: 'сегодня', upcoming: '', old: '' }[status];
  const dl = showDate ? `${parseD(date).getDate()} ${MONTHS_GEN[parseD(date).getMonth()]}, ${WEEKDAYS[parseD(date).getDay()]}` : '';
  const actionable = status === 'overdue' || status === 'today' || status === 'upcoming';
  return `<div class="row occ ${status}">
    <div class="ico" style="background:${c.color}33">${c.icon}</div>
    <button class="mid" style="text-align:left" data-act="edit-rec" data-v="${r.id}">
      <div class="title">${esc(r.name || c.name)}</div>
      <div class="sub">${[dl, label ? `<b class="st-${status}">${label}</b>` : '', esc(a?.name || '?')].filter(Boolean).join(' · ')}</div>
    </button>
    <div class="amt ${r.type}">${fmt(r.type === 'expense' ? -r.amount : r.amount, ccy, true)}
      ${actionable ? `<div class="occ-btns"><button data-act="skip-occ" data-v="${r.id}|${date}" title="Пропустить">✕</button><button class="pay" data-act="pay-occ" data-v="${r.id}|${date}">✓</button></div>`
        : status === 'skipped' ? `<div class="occ-btns"><button data-act="unskip-occ" data-v="${r.id}|${date}">вернуть</button></div>` : ''}
    </div>
  </div>`;
}

function renderRecurring() {
  const y = ui.calY, m = ui.calM;
  const first = `${y}-${pad(m + 1)}-01`;
  const dim = new Date(y, m + 1, 0).getDate();
  const lastD = `${y}-${pad(m + 1)}-${pad(dim)}`;
  const monthOcc = occInRange(first, lastD);
  const byDay = {};
  for (const o of monthOcc) (byDay[o.date] ||= []).push(o);

  // Сводка за месяц (в основной валюте)
  let planExp = 0, leftExp = 0, planInc = 0;
  for (const o of monthOcc) {
    if (o.status === 'skipped' || o.status === 'old') continue;
    const v = convert(o.r.amount, acc(o.r.accountId)?.currency || base(), base());
    if (o.r.type === 'expense') { planExp += v; if (o.status !== 'paid') leftExp += v; } else planInc += v;
  }

  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push('<div></div>');
  for (let d = 1; d <= dim; d++) {
    const ds = `${y}-${pad(m + 1)}-${pad(d)}`;
    const items = byDay[ds] || [];
    const hasOver = items.some(o => o.status === 'overdue');
    const dots = items.slice(0, 4).map(o => `<i style="background:${recCat(o.r).color}" class="${o.status === 'paid' || o.status === 'skipped' || o.status === 'old' ? 'done' : ''}"></i>`).join('');
    cells.push(`<button class="cal-day ${ds === today() ? 'today' : ''} ${ui.calSel === ds ? 'sel' : ''} ${hasOver ? 'over' : ''}" data-act="cal-day" data-v="${ds}">
      <span>${d}</span><div class="cal-dots">${dots}</div></button>`);
  }

  const sel = ui.calSel && ui.calSel.startsWith(`${y}-${pad(m + 1)}`) ? ui.calSel : null;
  const overdue = overdueList();
  const dueToday = occInRange(today(), today()).filter(o => o.status === 'today');

  return `
    <div class="topbar"><h1>Платежи</h1><button class="link" data-act="new-rec">＋ Новый</button></div>
    ${state.recurring.length ? `
    <div class="card">
      <div class="cal-head">
        <button data-act="cal-month" data-v="-1">‹</button><b>${monthLabel(y, m)}</b><button data-act="cal-month" data-v="1">›</button>
      </div>
      <div class="cal-grid">${WEEK_HEAD.map(w => `<div class="cal-wd">${w}</div>`).join('')}${cells.join('')}</div>
      <div class="summary" style="margin-top:12px">
        <div class="stat"><div class="label">Регулярные расходы</div><div class="val expense">${fmt(planExp, base())}</div><div class="muted small">осталось оплатить ${fmt(leftExp, base())}</div></div>
        <div class="stat"><div class="label">Регулярные доходы</div><div class="val income">${fmt(planInc, base())}</div></div>
      </div>
    </div>
    ${sel ? `<div class="section-title">${dayLabel(sel)}</div>
      ${byDay[sel]?.length ? `<div class="list">${byDay[sel].map(o => occRow(o, false)).join('')}</div>` : `<div class="note-box">В этот день платежей нет</div>`}` : ''}
    ${overdue.length || dueToday.length ? `<div class="section-title" style="color:var(--expense)">К оплате</div><div class="list">${[...overdue, ...dueToday].map(o => occRow(o, true)).join('')}</div>` : ''}
    <div class="section-title">Все регулярные платежи</div>
    <div class="list">${state.recurring.map(r => {
      const c = recCat(r); const a = acc(r.accountId);
      const next = occurrences(r, today(), addDays(today(), 800)).find(d => !['paid', 'skipped'].includes(occStatus(r, d)));
      return `<button class="row" data-act="edit-rec" data-v="${r.id}">
        <div class="ico" style="background:${c.color}33">${c.icon}</div>
        <div class="mid"><div class="title">${esc(r.name || c.name)}${r.auto ? ' <span class="small muted">· авто</span>' : ''}</div>
          <div class="sub">${freqText(r)} · ${next ? 'след. ' + parseD(next).getDate() + ' ' + MONTHS_GEN[parseD(next).getMonth()] : 'завершён'}</div></div>
        <div class="amt ${r.type}">${fmt(r.type === 'expense' ? -r.amount : r.amount, a?.currency || base(), true)}</div>
      </button>`;
    }).join('')}</div>
    <div class="note-box" style="margin-top:12px">✓ — отметить оплату (создаётся запись), ✕ — пропустить этот раз. Если включить «Добавлять сами», записи будут появляться автоматически, когда вы открываете приложение.</div>
    ` : `<div class="empty"><div class="e">📅</div>Здесь будут подписки, аренда, зарплата и другие регулярные платежи.<br><br>
      <button class="btn" data-act="new-rec">＋ Добавить первый платёж</button></div>`}
  `;
}

function sheetRec() {
  const s = ui.sheet;
  const cats = categoriesByUse(s.type);
  const a = acc(s.accountId);
  return `
    <div class="sheet-head"><button class="link" data-act="close">Отмена</button><h2>${s.id ? 'Платёж' : 'Новый платёж'}</h2><button class="link" data-act="save-rec">Готово</button></div>
    <div class="seg">${[['expense', 'Расход'], ['income', 'Доход']].map(([v, l]) => `<button class="${s.type === v ? 'on' : ''}" data-act="rec-type" data-v="${v}">${l}</button>`).join('')}</div>
    <div class="field"><label>Название</label><input type="text" value="${esc(s.name)}" placeholder="Например, Аренда" data-input="rec-name"></div>
    <div class="field"><label>Сумма</label><input type="text" inputmode="decimal" value="${esc(s.amount)}" placeholder="0" data-input="rec-amount"><span class="muted">${esc(cur(a?.currency).symbol)}</span></div>
    <div class="field"><label>Счёт</label><select data-change="rec-acc">${state.accounts.map(x => `<option value="${x.id}" ${x.id === s.accountId ? 'selected' : ''}>${accIconText(x.icon)}${esc(x.name)} (${x.currency})</option>`).join('')}</select></div>
    <div class="cat-grid">${cats.map(c => `<button class="cat ${s.categoryId === c.id ? 'on' : ''}" data-act="rec-cat" data-v="${c.id}">
      <div class="ico" style="background:${c.color}33">${c.icon}</div><span>${esc(c.name)}</span></button>`).join('')}</div>
    <div class="section-title">Расписание</div>
    <div class="field"><label>Повтор</label><select data-change="rec-preset">${REPEAT_PRESETS.map(p => `<option value="${p.id}" ${repeatPresetOf(s) === p.id ? 'selected' : ''}>${p.label}</option>`).join('')}<option value="custom" ${repeatPresetOf(s) === 'custom' ? 'selected' : ''}>Настроить…</option></select></div>
    ${repeatPresetOf(s) === 'custom' ? `
      <div class="field"><label>Частота</label><select data-change="rec-freq">${[['day', 'День'], ['week', 'Неделя'], ['month', 'Месяц'], ['year', 'Год']].map(([f, l]) => `<option value="${f}" ${s.freq === f ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <div class="field"><label>Каждые</label><div class="stepper"><button data-act="rec-step" data-v="-1">−</button><b>${s.interval}</b><button data-act="rec-step" data-v="1">+</button></div><span class="muted" style="min-width:64px">${plural(Number(s.interval), FREQ_UNIT[s.freq])}</span></div>
      <div class="muted small" style="margin:0 6px 8px">Платёж будет повторяться ${repeatSummary(s)}.</div>` : ''}
    <div class="field"><label>Первый платёж</label><input type="date" value="${s.startDate}" data-change="rec-start"></div>
    <div class="field"><label>Окончание повтора</label><select data-change="rec-endmode"><option value="never" ${s.endMode !== 'date' ? 'selected' : ''}>Никогда</option><option value="date" ${s.endMode === 'date' ? 'selected' : ''}>В дату</option></select></div>
    ${s.endMode === 'date' ? `<div class="field"><label>Дата окончания</label><input type="date" value="${s.endDate || ''}" data-change="rec-end"></div>` : ''}
    <label class="field toggle"><span>Добавлять записи сами</span><input type="checkbox" ${s.auto ? 'checked' : ''} data-change="rec-auto"></label>
    <div class="muted small" style="margin:0 6px 8px">${s.auto ? 'Когда наступит дата, запись добавится автоматически.' : 'Платёж будет в календаре, а запись вы создадите кнопкой ✓.'}</div>
    <button class="btn" data-act="save-rec">Сохранить</button>
    ${s.id ? `<button class="btn danger" data-act="del-rec">Удалить платёж</button>` : ''}
  `;
}

function saveRec() {
  const s = ui.sheet;
  const a = acc(s.accountId);
  if (!a) return toast('Сначала создайте счёт');
  const amount = round(evalExpr(String(s.amount).replace(/\s/g, '')), cur(a.currency).decimals);
  if (!(amount > 0)) return toast('Введите сумму');
  if (!s.categoryId) return toast('Выберите категорию');
  if (s.endMode === 'date' && !s.endDate) return toast('Укажите дату окончания');
  if (s.endMode !== 'date') s.endDate = '';
  if (s.endDate && s.endDate < s.startDate) return toast('Дата окончания раньше начала');
  const old = state.recurring.find(r => r.id === s.id);
  const r = { id: s.id || uid(), type: s.type, name: s.name.trim(), amount, accountId: a.id, categoryId: s.categoryId, freq: s.freq,
    interval: Number(s.interval) || 1, startDate: s.startDate, endDate: s.endDate || null, auto: !!s.auto,
    createdDay: old?.createdDay || (s.startDate < today() ? today() : s.startDate), skipped: old?.skipped || [] };
  // если первый платёж в прошлом — спросим, считать ли прошлые даты
  if (!old && s.startDate < today()) {
    const past = occurrences({ ...r, createdDay: r.startDate }, r.startDate, addDays(today(), -1)).length;
    if (past && confirm(`С ${parseD(s.startDate).getDate()} ${MONTHS_GEN[parseD(s.startDate).getMonth()]} уже прошло платежей: ${past}. Показать их как неоплаченные${r.auto ? ' и добавить записи' : ''}?`)) r.createdDay = r.startDate;
  }
  const i = state.recurring.findIndex(x => x.id === r.id);
  if (i >= 0) state.recurring[i] = r; else state.recurring.push(r);
  processAuto();
  save(); closeSheet(); toast('Сохранено');
}

const recActions = {
  'new-rec': () => {
    if (!state.accounts.length) return toast('Сначала добавьте счёт');
    openSheet({ kind: 'rec', id: null, type: 'expense', name: '', amount: '', accountId: ui.account || state.accounts[0].id, categoryId: null,
      freq: 'month', interval: 1, startDate: ui.calSel && ui.calSel >= today() ? ui.calSel : today(), endDate: '', endMode: 'never', auto: false });
  },
  'edit-rec': v => { const r = state.recurring.find(x => x.id === v); if (r) openSheet({ kind: 'rec', ...r, amount: String(r.amount), endDate: r.endDate || '', endMode: r.endDate ? 'date' : 'never' }); },
  'rec-type': v => { if (ui.sheet.type !== v) { ui.sheet.type = v; ui.sheet.categoryId = null; } render(); },
  'rec-cat': v => { ui.sheet.categoryId = v; render(); },
  'rec-step': v => { const s = ui.sheet; s.interval = Math.min(99, Math.max(1, (Number(s.interval) || 1) + Number(v))); s.custom = true; render(); },
  'save-rec': () => saveRec(),
  'del-rec': () => {
    if (!confirm('Удалить регулярный платёж? Уже созданные записи останутся.')) return;
    state.recurring = state.recurring.filter(r => r.id !== ui.sheet.id);
    save(); closeSheet(); toast('Удалено');
  },
  'pay-occ': v => {
    const [id, date] = v.split('|'); const r = state.recurring.find(x => x.id === id);
    if (r && payOcc(r, date)) { save(); render(); toast('Оплачено — запись добавлена'); }
  },
  'skip-occ': v => {
    const [id, date] = v.split('|'); const r = state.recurring.find(x => x.id === id);
    if (!r) return; (r.skipped ||= []).push(date); save(); render(); toast('Пропущено');
  },
  'unskip-occ': v => {
    const [id, date] = v.split('|'); const r = state.recurring.find(x => x.id === id);
    if (!r) return; r.skipped = (r.skipped || []).filter(d => d !== date); save(); render();
  },
  'cal-month': v => { [ui.calY, ui.calM] = shiftMonth(ui.calY, ui.calM, Number(v)); ui.calSel = null; render(); },
  'cal-day': v => { ui.calSel = ui.calSel === v ? null : v; render(); },
};

const recChanges = {
  'rec-acc': v => { ui.sheet.accountId = v; render(); },
  'rec-preset': v => { const s = ui.sheet; if (v === 'custom') s.custom = true; else { const p = REPEAT_PRESETS.find(p => p.id === v); s.freq = p.freq; s.interval = p.interval; s.custom = false; } render(); },
  'rec-freq': v => { ui.sheet.freq = v; ui.sheet.custom = true; render(); },
  'rec-endmode': v => { ui.sheet.endMode = v; if (v === 'never') ui.sheet.endDate = ''; render(); },
  'rec-start': v => { ui.sheet.startDate = v || today(); },
  'rec-end': v => { ui.sheet.endDate = v; },
  'rec-auto': (v, el) => { ui.sheet.auto = el.checked; render(); },
};
const recInputs = {
  'rec-name': v => { ui.sheet.name = v; },
  'rec-amount': v => { ui.sheet.amount = v; },
};


/* ---------- Корректировка баланса ---------- */

function parseNum(v) {
  const n = parseFloat(String(v).replace(/[\s ]/g, '').replace(/[−–]/g, '-').replace(',', '.'));
  return isFinite(n) ? n : NaN;
}

// Открыть форму: какой баланс должен быть на конец выбранного дня
function adjustSheet(accountId, t) {
  const a = acc(accountId);
  if (!a) return;
  const date = t ? t.date : today();
  const now = balanceOf(a, date);
  openSheet({ kind: 'adjust', id: t?.id || null, accountId, date, oldDelta: t ? t.amount : 0,
    target: String(round(now, cur(a.currency).decimals)), note: t?.note || '' });
}

function sheetAdjust() {
  const s = ui.sheet;
  const a = acc(s.accountId);
  const c = a.currency;
  const before = balanceOf(a, s.date) - s.oldDelta; // баланс на эту дату без этой корректировки
  const target = parseNum(s.target);
  const delta = isNaN(target) ? 0 : round(target - before, cur(c).decimals);
  const later = state.transactions.some(t => t.date > s.date && (t.accountId === a.id || t.toAccountId === a.id));
  return `
    <div class="sheet-head"><button class="link" data-act="close">Отмена</button><h2>Баланс счёта</h2><button class="link" data-act="save-adjust">Готово</button></div>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <div class="ico" style="${accIcoStyle(a)}">${accIcon(a.icon)}</div><div><b>${esc(a.name)}</b><div class="muted small">${c}</div></div></div>
    <div class="field"><label>На дату</label><input type="date" value="${s.date}" data-change="adj-date"></div>
    <div class="field"><label>По записям</label><b style="flex:1;text-align:right">${fmt(before, c)}</b></div>
    <div class="amount-label">Сколько на самом деле</div>
    <div class="amount-box"><input class="amount-input" type="text" inputmode="decimal" value="${esc(s.target)}" data-input="adj-target"><div class="cur">${esc(cur(c).symbol)}</div></div>
    <div class="btn-row" style="margin-bottom:10px"><button class="btn ghost" data-act="adj-zero">Обнулить</button><button class="btn ghost" data-act="adj-neg">± знак</button></div>
    <div class="note-box" id="adjDelta">${delta ? `Будет добавлена корректировка <b>${fmt(delta, c, true)}</b>. Она не считается доходом или расходом.` : 'Баланс совпадает — менять нечего.'}
      ${later ? '<br>После этой даты есть записи — баланс на сегодня будет с их учётом.' : ''}</div>
    <div class="field"><label>Заметка</label><input type="text" value="${esc(s.note)}" placeholder="необязательно" data-input="adj-note"></div>
    <button class="btn" data-act="save-adjust">Сохранить</button>
    ${s.id ? `<button class="btn danger" data-act="del-tx">Удалить корректировку</button>` : ''}
  `;
}

function saveAdjust() {
  const s = ui.sheet;
  const a = acc(s.accountId);
  const target = parseNum(s.target);
  if (isNaN(target)) return toast('Введите сумму');
  const delta = round(target - (balanceOf(a, s.date) - s.oldDelta), cur(a.currency).decimals);
  const i = state.transactions.findIndex(t => t.id === s.id);
  if (!delta) {
    if (i >= 0) state.transactions.splice(i, 1);
  } else {
    const t = { id: s.id || uid(), type: 'adjust', amount: delta, accountId: a.id, date: s.date || today(), note: s.note.trim(),
      createdAt: i >= 0 ? state.transactions[i].createdAt : Date.now() };
    if (i >= 0) state.transactions[i] = t; else state.transactions.push(t);
  }
  save(); closeSheet(); toast(delta ? 'Баланс исправлен' : 'Баланс уже такой');
}

const adjActions = {
  adjust: v => adjustSheet(v),
  'adj-zero': () => { ui.sheet.target = '0'; render(); },
  'adj-neg': () => { const n = parseNum(ui.sheet.target); ui.sheet.target = String(isNaN(n) ? 0 : -n); render(); },
  'save-adjust': () => saveAdjust(),
};
const adjChanges = { 'adj-date': v => { const s = ui.sheet; s.date = v || today(); render(); } };
const adjInputs = {
  'adj-target': v => {
    ui.sheet.target = v;
    // обновляем подсказку без перерисовки, чтобы не сбивать ввод
    const s = ui.sheet, a = acc(s.accountId), n = parseNum(v);
    const d = isNaN(n) ? 0 : round(n - (balanceOf(a, s.date) - s.oldDelta), cur(a.currency).decimals);
    const el = document.getElementById('adjDelta');
    if (el) el.innerHTML = d ? `Будет добавлена корректировка <b>${fmt(d, a.currency, true)}</b>. Она не считается доходом или расходом.` : 'Баланс совпадает — менять нечего.';
  },
  'adj-note': v => { ui.sheet.note = v; },
};

/* ================= Копилка (зашифрованные сбережения) =================
   В state.vault лежит только зашифрованный блок (AES-GCM, ключ из пароля через PBKDF2).
   Расшифрованные данные живут лишь в памяти (vault.data), пока копилка открыта.
   При сворачивании приложения копилка закрывается. Забытый пароль восстановить нельзя. */

const VAULT_ITER = 310000;
const vault = { key: null, data: null, busy: false, pw1: '', pw2: '' };

function b64(buf) { const a = new Uint8Array(buf); let s = ''; for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000)); return btoa(s); }
function unb64(str) { const s = atob(str); const a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }

async function vaultDeriveKey(pw, salt, iter) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

async function vaultEncryptAndStore() {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, vault.key, new TextEncoder().encode(JSON.stringify(vault.data)));
  state.vault = { v: 1, kdf: 'PBKDF2-SHA256', iter: state.vault.iter, salt: state.vault.salt, iv: b64(iv), data: b64(ct) };
  vault.blob = state.vault.data;
  save();
}

async function vaultCreate(pw) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  vault.key = await vaultDeriveKey(pw, salt, VAULT_ITER);
  vault.data = { accounts: [], snaps: [], view: base() };
  state.vault = { v: 1, iter: VAULT_ITER, salt: b64(salt) };
  await vaultEncryptAndStore();
}

async function vaultUnlock(pw) {
  const v = state.vault;
  const key = await vaultDeriveKey(pw, unb64(v.salt), v.iter || VAULT_ITER);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(v.iv) }, key, unb64(v.data)); // неверный пароль → ошибка
  vault.key = key;
  vault.blob = v.data;
  vault.data = Object.assign({ accounts: [], snaps: [], goals: [], view: base() }, JSON.parse(new TextDecoder().decode(plain)));
}

async function vaultChangePassword(pw) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  vault.key = await vaultDeriveKey(pw, salt, VAULT_ITER);
  state.vault = { ...state.vault, iter: VAULT_ITER, salt: b64(salt) };
  await vaultEncryptAndStore();
}

function vaultLock() { vault.key = null; vault.data = null; vault.pw1 = vault.pw2 = ''; if (ui.sheet && ui.sheet.kind?.startsWith('v')) ui.sheet = null; }
async function vaultCommit(msg) { await vaultEncryptAndStore(); ui.sheet = null; render(); if (msg) toast(msg); }

/* ---------- Расчёты ---------- */

const vSnaps = () => [...vault.data.snaps].sort((a, b) => a.date.localeCompare(b.date));
const vAcc = id => vault.data.accounts.find(a => a.id === id);
const vRate = (snap, code) => (snap && snap.rates && snap.rates[code]) || cur(code).perUSD || 1;
const vConv = (amount, from, to, snap) => amount / vRate(snap, from) * vRate(snap, to);
function vTotal(snap, view) {
  let s = 0;
  for (const [id, v] of Object.entries(snap.values || {})) { const a = vAcc(id); if (a) s += vConv(v, a.currency, view, snap); }
  return s;
}
function vByCurrency(snap, view) {
  const out = {};
  for (const [id, v] of Object.entries(snap.values || {})) { const a = vAcc(id); if (a && v) out[a.currency] = (out[a.currency] || 0) + vConv(v, a.currency, view, snap); }
  return out;
}
// Разбор изменения между двумя сверками: что от изменения сумм, что от курсов
function vExplain(prev, next, view) {
  let amount = 0, fx = 0; const fxBy = {};
  const ids = new Set([...Object.keys(prev.values || {}), ...Object.keys(next.values || {})]);
  for (const id of ids) {
    const a = vAcc(id); if (!a) continue;
    const P = prev.values?.[id] || 0, N = next.values?.[id] || 0;
    const r0 = vRate(prev, view) / vRate(prev, a.currency), r1 = vRate(next, view) / vRate(next, a.currency);
    amount += (N - P) * r1;
    const f = P * (r1 - r0); fx += f; fxBy[a.currency] = (fxBy[a.currency] || 0) + f;
  }
  return { amount, fx, fxBy, total: amount + fx };
}
const CUR_COLORS = { VND: '#f47b4f', RUB: '#5c78ec', UZS: '#2bb3a6', USD: '#34a865', EUR: '#8b6cf0' };
const curColor = (code, i) => CUR_COLORS[code] || COLORS[i % COLORS.length];
const pct = (a, b) => b ? (a / Math.abs(b) * 100) : 0;
const shortDateLabel = ds => { const d = parseD(ds); return `${MONTHS_SHORT[d.getMonth()]}${String(d.getFullYear()).slice(2)}`; };

/* ---------- Экран ---------- */

function renderVault() {
  // копилку заменили (загрузили копию, синхронизация) или удалили — закрываем
  if (vault.data && state.vault?.data !== vault.blob) vaultLock();
  if (!state.vault) return vaultSetupScreen();
  if (!vault.data) return vaultLockScreen();
  const vd = vault.data, view = vd.view && state.currencies.some(c => c.code === vd.view) ? vd.view : base();
  const snaps = vSnaps();
  const last = snaps.at(-1), prev = snaps.at(-2);
  const thisMonth = today().slice(0, 7);
  const needCheck = vd.accounts.length && (!last || last.date.slice(0, 7) !== thisMonth);

  let body = '';
  if (!vd.accounts.length) {
    body = `<div class="empty"><div class="e">🐷</div>Добавьте счета, где лежат сбережения: вклады, наличные, валюта.<br>Потом раз в месяц вносите суммы — и будут графики.<br><br>
      <button class="btn" data-act="v-new-acc">＋ Добавить счёт</button></div>`;
  } else {
    const total = last ? vTotal(last, view) : 0;
    const ex = last && prev ? vExplain(prev, last, view) : null;
    const byCur = last ? vByCurrency(last, view) : {};
    const curList = Object.entries(byCur).sort((a, b) => b[1] - a[1]);
    body = `
      <div class="chips">${state.currencies.map(c => `<button class="chip ${c.code === view ? 'on' : ''}" data-act="v-view" data-v="${c.code}">в ${c.code}</button>`).join('')}</div>
      ${needCheck ? `<div class="note-box remind">📝 Пора внести суммы за ${MONTHS[new Date().getMonth()].toLowerCase()}.<button class="btn" data-act="v-new-snap">Внести суммы</button></div>` : ''}
      <div class="card">
        <div class="stat big"><div class="label">Сбережения${last ? ' на ' + dayLabel(last.date).replace(/^(Сегодня|Вчера), /, '') : ''}</div><div class="val">${fmt(total, view)}</div></div>
        ${ex ? `<div class="${ex.total >= 0 ? 'income' : 'expense'}" style="font-weight:700;margin-top:4px">${fmt(ex.total, view, true)} (${pct(ex.total, vTotal(prev, view)).toFixed(1)}%) <span class="muted small" style="font-weight:400">с ${parseD(prev.date).getDate()} ${MONTHS_GEN[parseD(prev.date).getMonth()]}</span></div>` : ''}
        ${!last ? '<div class="muted small" style="margin-top:6px">Сумм ещё нет — нажмите «Внести суммы».</div>' : ''}
        <button class="btn ${needCheck ? 'ghost' : ''}" data-act="v-new-snap" style="margin-top:12px">📝 Внести суммы</button>
      </div>

      ${goalsCard()}
      ${ex ? `<div class="card"><h3>Почему изменилось</h3>
        <div class="row" style="padding:6px 0"><div class="mid">Пополнения, проценты, снятия<div class="sub">изменение сумм на счетах</div></div><div class="amt ${ex.amount >= 0 ? 'income' : 'expense'}">${fmt(ex.amount, view, true)}</div></div>
        <div class="row" style="padding:6px 0"><div class="mid">Курсы валют<div class="sub">как изменилась цена ваших валют в ${view}</div></div><div class="amt ${ex.fx >= 0 ? 'income' : 'expense'}">${fmt(ex.fx, view, true)}</div></div>
        ${Object.entries(ex.fxBy).filter(([c, v]) => Math.abs(v) >= 0.005 && c !== view).map(([c, v]) => `<div class="row" style="padding:2px 0 2px 16px"><div class="mid sub" style="white-space:normal">${c}: ${fmtNum(vRate(prev, c) / vRate(prev, view), 2)} → ${fmtNum(vRate(last, c) / vRate(last, view), 2)} за 1 ${view}</div><div class="amt small ${v >= 0 ? 'income' : 'expense'}">${fmt(v, view, true)}</div></div>`).join('')}
      </div>` : ''}

      ${snaps.length >= 2 ? `<div class="card"><h3>Сбережения в ${view}</h3>${lineChart(snaps.map(s => ({ label: shortDateLabel(s.date), v: vTotal(s, view) })), view, { tight: true })}</div>` : ''}

      ${curList.length ? `<div class="card"><h3>По валютам</h3>
        <div class="donut-wrap">${donut(curList.map(([c, v], i) => ({ v, color: curColor(c, i) })))}<div class="donut-center"><div class="muted small">в ${view}</div><div class="val">${fmt(total, view)}</div></div></div>
        <div class="legend">${curList.map(([c, v], i) => `<div class="row"><div class="ico" style="background:none">${accIcon(BRAND_ICONS[c.toLowerCase()] ? 'bi:' + c.toLowerCase() : '💱')}</div>
          <div class="mid"><div class="title">${c} <span class="muted small">${(v / total * 100).toFixed(1)}%</span></div><div class="bar-track"><div class="bar-fill" style="width:${v / curList[0][1] * 100}%;background:${curColor(c, i)}"></div></div></div>
          <div class="amt">${fmt(v, view)}</div></div>`).join('')}</div>
        ${snaps.length >= 2 ? `<h3 style="margin-top:16px">Доли валют во времени</h3>${vStackChart(snaps, view)}` : ''}
      </div>` : ''}

      ${snaps.length >= 2 ? `<div class="card"><h3>Изменение между сверками</h3>${vChangeChart(snaps, view)}
        <div class="chart-legend"><span><i class="dot" style="background:var(--accent)"></i>Суммы</span><span><i class="dot" style="background:var(--transfer)"></i>Курсы</span></div></div>` : ''}

      <div class="section-title">Счета</div>
      <div class="list">${vd.accounts.filter(a => !a.archived).map(a => vAccRow(a, last, prev, view)).join('')}</div>
      <button class="btn ghost" data-act="v-new-acc">＋ Добавить счёт</button>
      ${vd.accounts.some(a => a.archived) ? `<div class="section-title">В архиве</div><div class="list">${vd.accounts.filter(a => a.archived).map(a => vAccRow(a, last, prev, view)).join('')}</div>` : ''}

      ${snaps.length ? `<div class="section-title">История сверок</div>
      <div class="list">${[...snaps].reverse().map(s => `<button class="row" data-act="v-edit-snap" data-v="${s.id}"><div class="ico" style="background:var(--card-2)">📝</div>
        <div class="mid"><div class="title">${dayLabel(s.date).replace(/^(Сегодня|Вчера), /, '')}</div><div class="sub">счетов: ${Object.values(s.values || {}).filter(v => v).length}</div></div>
        <div class="amt">${fmt(vTotal(s, view), view)}</div></button>`).join('')}</div>` : ''}
      <div class="note-box" style="margin-top:12px">🔐 Данные копилки зашифрованы вашим паролем и не входят в общий баланс. Копилка закрывается, когда вы сворачиваете приложение.</div>
    `;
  }
  return `
    <div class="topbar"><button class="link" data-act="tab" data-v="accounts">‹ Счета</button><h1>🐷 Копилка</h1>
      <div><button class="link" data-act="v-settings" aria-label="Настройки копилки">⚙️</button><button class="link" data-act="v-lock" aria-label="Закрыть">🔒</button></div></div>
    ${body}`;
}

function vAccRow(a, last, prev, view) {
  const v = last?.values?.[a.id];
  const p = prev?.values?.[a.id];
  const d = v != null && p != null ? v - p : null;
  return `<button class="row" data-act="v-edit-acc" data-v="${a.id}">
    <div class="ico" style="${accIcoStyle(a)}">${accIcon(a.icon)}</div>
    <div class="mid"><div class="title">${esc(a.name)}</div><div class="sub">${a.currency}${a.note ? ' · ' + esc(a.note) : ''}${d ? ` · <span class="${d > 0 ? 'income' : 'expense'}">${fmt(d, a.currency, true)}</span>` : ''}</div></div>
    <div class="amt">${v != null ? fmt(v, a.currency) : '<span class="muted">—</span>'}${v && a.currency !== view ? `<div class="sub">≈ ${fmt(vConv(v, a.currency, view, last), view)}</div>` : ''}</div>
  </button>`;
}

function vaultSetupScreen() {
  return `
    <div class="topbar"><button class="link" data-act="tab" data-v="accounts">‹ Счета</button><h1>🐷 Копилка</h1><span style="width:60px"></span></div>
    <div class="card">
      <h3>Придумайте пароль</h3>
      <p class="muted small" style="margin-top:0">Копилка будет зашифрована этим паролем. <b style="color:var(--expense)">Если забыть пароль, данные копилки восстановить нельзя</b> — ни мне, ни кому-то ещё.</p>
      <form data-submit="v-create" autocomplete="on">
        <input type="text" name="username" value="Монетка — копилка" autocomplete="username" hidden>
        <div class="field"><input type="password" placeholder="Пароль (минимум 4 символа)" autocomplete="new-password" data-input="v-pw1" style="text-align:left"></div>
        <div class="field"><input type="password" placeholder="Повторите пароль" autocomplete="new-password" data-input="v-pw2" style="text-align:left"></div>
        <button class="btn" type="submit" ${vault.busy ? 'disabled' : ''}>${vault.busy ? 'Создаю…' : 'Создать копилку'}</button>
      </form>
    </div>
    <div class="note-box">Совет: iPhone предложит сохранить пароль в «Пароли» — тогда копилку можно будет открывать через Face ID.</div>`;
}

function vaultLockScreen() {
  return `
    <div class="topbar"><button class="link" data-act="tab" data-v="accounts">‹ Счета</button><h1>🐷 Копилка</h1><span style="width:60px"></span></div>
    <div class="empty" style="padding-top:24px"><div class="e">🔒</div>Копилка закрыта</div>
    <form class="card" data-submit="v-unlock" autocomplete="on">
      <input type="text" name="username" value="Монетка — копилка" autocomplete="username" hidden>
      <div class="field"><input type="password" placeholder="Пароль" autocomplete="current-password" data-input="v-pw1" style="text-align:left" autofocus></div>
      <button class="btn" type="submit" ${vault.busy ? 'disabled' : ''}>${vault.busy ? 'Открываю…' : 'Открыть'}</button>
    </form>`;
}

/* ---------- Графики копилки ---------- */

function vStackChart(snaps, view) {
  const W = 320, H = 130, pl = 30, pb = 18, pt = 6;
  const codes = [...new Set(snaps.flatMap(s => Object.keys(vByCurrency(s, view))))];
  const n = snaps.length, bw = (W - pl) / n;
  let bars = '';
  snaps.forEach((s, i) => {
    const by = vByCurrency(s, view); const tot = Object.values(by).reduce((a, b) => a + b, 0) || 1;
    let y = H - pb;
    codes.forEach((c, ci) => {
      const h = (H - pt - pb) * ((by[c] || 0) / tot);
      if (h > 0) { y -= h; bars += `<rect x="${pl + i * bw + bw * 0.15}" y="${y}" width="${bw * 0.7}" height="${h}" fill="${curColor(c, ci)}"><title>${c}: ${(by[c] / tot * 100).toFixed(1)}%</title></rect>`; }
    });
    if (n <= 12 || i % Math.ceil(n / 12) === 0) bars += `<text x="${pl + i * bw + bw / 2}" y="${H - 4}" text-anchor="middle">${shortDateLabel(s.date)}</text>`;
  });
  const grid = [0, 50, 100].map(p => { const yy = pt + (H - pt - pb) * (1 - p / 100); return `<line x1="${pl}" x2="${W}" y1="${yy}" y2="${yy}" stroke="var(--line)"/><text x="${pl - 4}" y="${yy + 3}" text-anchor="end">${p}%</text>`; }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%">${grid}${bars}</svg>
    <div class="chart-legend">${codes.map((c, i) => `<span><i class="dot" style="background:${curColor(c, i)}"></i>${c}</span>`).join('')}</div>`;
}

function vChangeChart(snaps, view) {
  const rows = [];
  for (let i = 1; i < snaps.length; i++) { const e = vExplain(snaps[i - 1], snaps[i], view); rows.push({ label: shortDateLabel(snaps[i].date), a: e.amount, f: e.fx }); }
  const W = 320, H = 150, pl = 34, pb = 18, pt = 8;
  const max = Math.max(...rows.flatMap(r => [r.a, r.f, 0])), min = Math.min(...rows.flatMap(r => [r.a, r.f, 0]));
  if (max === min) return '<div class="empty">Изменений нет</div>';
  const y = v => pt + (H - pt - pb) * (max - v) / (max - min);
  const gw = (W - pl) / rows.length, bw = Math.min(gw * 0.32, 18);
  const bar = (x, v, color, t) => `<rect x="${x}" y="${Math.min(y(v), y(0))}" width="${bw}" height="${Math.max(Math.abs(y(v) - y(0)), 0.5)}" rx="2" fill="${color}"><title>${t}: ${fmt(v, view, true)}</title></rect>`;
  const bars = rows.map((r, i) => { const x = pl + i * gw + (gw - 2 * bw - 2) / 2;
    return bar(x, r.a, 'var(--accent)', 'Суммы') + bar(x + bw + 2, r.f, 'var(--transfer)', 'Курсы') +
      (rows.length <= 12 || i % Math.ceil(rows.length / 12) === 0 ? `<text x="${x + bw}" y="${H - 4}" text-anchor="middle">${r.label}</text>` : ''); }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%">${grid(W, H, pl, pt, pb, min, max)}<line x1="${pl}" x2="${W}" y1="${y(0)}" y2="${y(0)}" stroke="var(--muted)" stroke-width="1"/>${bars}</svg>`;
}

/* ---------- Формы копилки ---------- */

function vRatesFor(codes, src) { const r = {}; for (const c of codes) r[c] = String(round(src ? vRate(src, c) : cur(c).perUSD, 6)); return r; }
function vUsedCodes(view) { return [...new Set(['USD', view, ...vault.data.accounts.map(a => a.currency)])]; }

function vSnapSheetOpen(id) {
  const vd = vault.data, view = vd.view || base();
  const s = vd.snaps.find(x => x.id === id);
  const last = vSnaps().at(-1);
  const values = {};
  for (const a of vd.accounts) { const v = s ? s.values?.[a.id] : last?.values?.[a.id]; values[a.id] = v != null ? String(v) : ''; }
  openSheet({ kind: 'vsnap', id: s?.id || null, date: s?.date || today(), values, rates: vRatesFor(vUsedCodes(view), s), ratesNote: s ? '' : 'Текущие курсы из настроек' });
}

function sheetVSnap() {
  const s = ui.sheet, vd = vault.data;
  const accs = vd.accounts.filter(a => !a.archived || (s.values[a.id] && s.values[a.id] !== '0'));
  return `
    <div class="sheet-head"><button class="link" data-act="close">Отмена</button><h2>${s.id ? 'Сверка' : 'Внести суммы'}</h2><button class="link" data-act="v-save-snap">Готово</button></div>
    <div class="field"><label>На дату</label><input type="date" value="${s.date}" data-change="vs-date"></div>
    <div class="section-title">Сколько на счетах</div>
    ${accs.map(a => `<div class="field"><div class="ico" style="width:30px;height:30px;font-size:16px;${accIcoStyle(a)}">${accIcon(a.icon)}</div><label style="min-width:0;flex:1;color:var(--text)">${esc(a.name)}</label>
      <input type="text" inputmode="decimal" value="${esc(s.values[a.id])}" placeholder="0" data-input="vs-val" data-id="${a.id}" style="max-width:45%"><span class="muted">${esc(cur(a.currency).symbol)}</span></div>`).join('')}
    <div class="muted small" style="margin:0 6px 8px">Подставлены суммы прошлой сверки — поменяйте те, что изменились.</div>
    <div class="section-title">Курсы на эту дату</div>
    ${Object.keys(s.rates).filter(c => c !== 'USD').map(c => `<div class="field"><label>1 USD =</label><input type="text" inputmode="decimal" value="${esc(s.rates[c])}" data-input="vs-rate" data-id="${c}"><span class="muted">${c}</span></div>`).join('')}
    <button class="btn ghost" data-act="v-fetch-rates">🌐 Загрузить курсы на ${s.date === today() ? 'сегодня' : 'эту дату'}</button>
    ${s.ratesNote ? `<div class="muted small" style="margin:6px">${esc(s.ratesNote)}</div>` : ''}
    <button class="btn" data-act="v-save-snap">Сохранить</button>
    ${s.id ? `<button class="btn danger" data-act="v-del-snap">Удалить сверку</button>` : ''}`;
}

async function vFetchRates() {
  const s = ui.sheet;
  toast('Загружаю курсы…');
  const urls = [`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${s.date === today() ? 'latest' : s.date}/v1/currencies/usd.min.json`,
    `https://${s.date === today() ? 'latest' : s.date}.currency-api.pages.dev/v1/currencies/usd.min.json`];
  for (const u of urls) {
    try {
      const j = await (await fetch(u)).json();
      if (!j.usd) continue;
      let n = 0;
      for (const c of Object.keys(s.rates)) if (c !== 'USD' && j.usd[c.toLowerCase()]) { s.rates[c] = String(round(j.usd[c.toLowerCase()], 6)); n++; }
      s.ratesNote = `Курсы загружены на ${j.date || s.date}`;
      render(); toast(`Курсов обновлено: ${n}`); return;
    } catch (e) { /* пробуем следующий адрес */ }
  }
  toast('Не удалось загрузить курсы. Можно ввести вручную.');
}

async function vSaveSnap() {
  const s = ui.sheet, vd = vault.data;
  const values = {};
  for (const [id, v] of Object.entries(s.values)) { if (String(v).trim() === '') continue; const n = parseNum(v); if (isNaN(n)) return toast('Проверьте суммы'); values[id] = round(n, cur(vAcc(id)?.currency).decimals); }
  if (!Object.keys(values).length) return toast('Введите хотя бы одну сумму');
  const rates = { USD: 1 };
  for (const [c, v] of Object.entries(s.rates)) { if (c === 'USD') continue; const n = parseNum(v); if (!(n > 0)) return toast(`Проверьте курс ${c}`); rates[c] = n; }
  const other = vd.snaps.find(x => x.date === s.date && x.id !== s.id);
  if (other && !confirm('На эту дату уже есть сверка. Заменить её?')) return;
  vd.snaps = vd.snaps.filter(x => x.id !== s.id && x.date !== s.date);
  vd.snaps.push({ id: s.id || uid(), date: s.date, values, rates });
  await vaultCommit('Сохранено');
}

function vAccSheetOpen(id) {
  const a = id ? vAcc(id) : null;
  openSheet({ kind: 'vacc', id: a?.id || null, name: a?.name || '', currency: a?.currency || base(), icon: a?.icon || 'bi:' + base().toLowerCase(), color: a?.color || '#ffb74d', note: a?.note || '', archived: !!a?.archived });
}

function sheetVAcc() {
  const s = ui.sheet;
  const used = s.id && vault.data.snaps.some(x => x.values?.[s.id] != null);
  const hist = s.id ? vSnaps().filter(x => x.values?.[s.id] != null) : [];
  return `
    <div class="sheet-head"><button class="link" data-act="close">Отмена</button><h2>${s.id ? 'Счёт копилки' : 'Новый счёт'}</h2><button class="link" data-act="v-save-acc">Готово</button></div>
    <div style="display:flex;justify-content:center;margin-bottom:10px"><div class="ico" style="width:64px;height:64px;font-size:32px;${accIcoStyle(s)}">${accIcon(s.icon)}</div></div>
    <div class="field"><label>Название</label><input type="text" value="${esc(s.name)}" placeholder="Например, Вклад BIDV" data-input="va-name"></div>
    <div class="field"><label>Валюта</label><select data-change="va-cur" ${used ? 'disabled' : ''}>${state.currencies.map(c => `<option value="${c.code}" ${c.code === s.currency ? 'selected' : ''}>${c.code} · ${esc(c.name)}</option>`).join('')}</select></div>
    ${used ? '<div class="muted small" style="margin:0 6px 8px">Валюту нельзя поменять: по счёту уже есть суммы.</div>' : ''}
    <div class="field"><label>Заметка</label><input type="text" value="${esc(s.note)}" placeholder="например, 7% годовых до мая" data-input="va-note"></div>
    <div class="section-title">Иконка</div>
    <div class="icon-pick brands">${Object.keys(BRAND_ICONS).map(k => `<button class="${s.icon === 'bi:' + k ? 'on' : ''}" data-act="va-icon" data-v="bi:${k}">${brandSVG(k)}</button>`).join('')}</div>
    <div class="icon-pick">${['🏦', '💰', '💵', '🪙', '🐷', '📈', '🏠', '🚗', '💎', '🥇', '₿', '🔒'].map(i => `<button class="${s.icon === i ? 'on' : ''}" data-act="va-icon" data-v="${i}">${i}</button>`).join('')}</div>
    ${hist.length >= 2 ? `<div class="section-title">История</div><div class="card">${lineChart(hist.map(x => ({ label: shortDateLabel(x.date), v: x.values[s.id] })), s.currency, { tight: true })}</div>` : ''}
    ${hist.length ? `<div class="list">${[...hist].reverse().map((x, i, arr) => { const p = arr[i + 1]?.values[s.id]; const d = p != null ? x.values[s.id] - p : null;
      return `<div class="row"><div class="mid"><div class="title">${dayLabel(x.date).replace(/^(Сегодня|Вчера), /, '')}</div></div><div class="amt">${fmt(x.values[s.id], s.currency)}${d ? `<div class="sub ${d > 0 ? 'income' : 'expense'}">${fmt(d, s.currency, true)}</div>` : ''}</div></div>`; }).join('')}</div>` : ''}
    <button class="btn" data-act="v-save-acc">Сохранить</button>
    ${s.id ? `<button class="btn ghost" data-act="va-archive">${s.archived ? 'Вернуть из архива' : 'В архив (счёт закрыт)'}</button><button class="btn danger" data-act="v-del-acc">Удалить счёт и его историю</button>` : ''}`;
}

async function vSaveAcc() {
  const s = ui.sheet, vd = vault.data;
  if (!s.name.trim()) return toast('Введите название');
  const a = { id: s.id || uid(), name: s.name.trim(), currency: s.currency, icon: s.icon, color: s.color, note: s.note.trim(), archived: !!s.archived };
  const i = vd.accounts.findIndex(x => x.id === a.id);
  if (i >= 0) vd.accounts[i] = a; else vd.accounts.push(a);
  await vaultCommit('Сохранено');
}

function sheetVSet() {
  return `
    <div class="sheet-head"><span></span><h2>Копилка</h2><button class="link" data-act="close">Готово</button></div>
    <div class="section-title">Сменить пароль</div>
    <form data-submit="v-change-pw">
      <input type="text" name="username" value="Монетка — копилка" autocomplete="username" hidden>
      <div class="field"><input type="password" placeholder="Новый пароль" autocomplete="new-password" data-input="v-pw1" style="text-align:left"></div>
      <div class="field"><input type="password" placeholder="Повторите пароль" autocomplete="new-password" data-input="v-pw2" style="text-align:left"></div>
      <button class="btn" type="submit">Сменить пароль</button>
    </form>
    <div class="note-box" style="margin-top:12px">Резервная копия из настроек включает копилку в зашифрованном виде. Чтобы открыть её из копии, нужен пароль, который действовал в момент сохранения копии.</div>
    <button class="btn danger" data-act="v-destroy">Удалить копилку целиком</button>`;
}

function pwCheck() {
  if (vault.pw1.length < 4) { toast('Пароль — минимум 4 символа'); return false; }
  if (vault.pw1 !== vault.pw2) { toast('Пароли не совпадают'); return false; }
  return true;
}

const vaultSubmits = {
  'v-create': async () => {
    if (!pwCheck()) return;
    if (!confirm('Запомните пароль! Если его забыть, копилку открыть будет невозможно.')) return;
    vault.busy = true; render();
    try { await vaultCreate(vault.pw1); vault.pw1 = vault.pw2 = ''; toast('Копилка создана'); }
    catch (e) { toast('Ошибка: ' + e.message); state.vault = null; vault.key = vault.data = null; save(); }
    vault.busy = false; render();
  },
  'v-unlock': async () => {
    if (!vault.pw1) return toast('Введите пароль');
    vault.busy = true; render();
    try { await vaultUnlock(vault.pw1); vault.pw1 = ''; }
    catch (e) { toast('Неверный пароль'); }
    vault.busy = false; render();
  },
  'v-change-pw': async () => {
    if (!pwCheck()) return;
    if (!confirm('Сменить пароль копилки? Старый пароль перестанет работать.')) return;
    await vaultChangePassword(vault.pw1); vault.pw1 = vault.pw2 = ''; ui.sheet = null; render(); toast('Пароль изменён');
  },
};

const vaultActions = {
  'open-vault': () => { ui.tab = 'vault'; ui.sheet = null; render(); window.scrollTo(0, 0); },
  'v-lock': () => { vaultLock(); render(); },
  'v-view': async v => { vault.data.view = v; render(); await vaultEncryptAndStore(); },
  'v-new-acc': () => vAccSheetOpen(null),
  'v-edit-acc': v => vAccSheetOpen(v),
  'va-icon': v => { ui.sheet.icon = v; render(); },
  'va-archive': () => { ui.sheet.archived = !ui.sheet.archived; vSaveAcc(); },
  'v-save-acc': () => vSaveAcc(),
  'v-del-acc': async () => {
    if (!confirm('Удалить счёт и все его суммы из истории?')) return;
    const id = ui.sheet.id, vd = vault.data;
    vd.accounts = vd.accounts.filter(a => a.id !== id);
    for (const s of vd.snaps) delete s.values?.[id];
    vd.snaps = vd.snaps.filter(s => Object.keys(s.values || {}).length);
    await vaultCommit('Удалено');
  },
  'v-new-snap': () => { if (!vault.data.accounts.length) return toast('Сначала добавьте счёт'); vSnapSheetOpen(null); },
  'v-edit-snap': v => vSnapSheetOpen(v),
  'v-fetch-rates': () => vFetchRates(),
  'v-save-snap': () => vSaveSnap(),
  'v-del-snap': async () => { if (!confirm('Удалить эту сверку?')) return; vault.data.snaps = vault.data.snaps.filter(s => s.id !== ui.sheet.id); await vaultCommit('Удалено'); },
  'v-settings': () => openSheet({ kind: 'vset' }),
  'v-destroy': () => {
    if (!confirm('Удалить копилку со всеми счетами и историей? Это нельзя отменить.')) return;
    if (!confirm('Точно удалить копилку?')) return;
    state.vault = null; vaultLock(); save(); render(); toast('Копилка удалена');
  },
};
const vaultChanges = {
  'vs-date': v => { ui.sheet.date = v || today(); render(); },
  'va-cur': v => { const s = ui.sheet; if (s.icon.startsWith('bi:') && BRAND_ICONS[s.currency.toLowerCase()] && s.icon === 'bi:' + s.currency.toLowerCase() && BRAND_ICONS[v.toLowerCase()]) s.icon = 'bi:' + v.toLowerCase(); s.currency = v; render(); },
};
const vaultInputs = {
  'v-pw1': v => { vault.pw1 = v; },
  'v-pw2': v => { vault.pw2 = v; },
  'vs-val': (v, el) => { ui.sheet.values[el.dataset.id] = v; },
  'vs-rate': (v, el) => { ui.sheet.rates[el.dataset.id] = v; ui.sheet.ratesNote = 'Курсы введены вручную'; },
  'va-name': v => { ui.sheet.name = v; },
  'va-note': v => { ui.sheet.note = v; },
};

/* ---------- Цели копилки ---------- */

const GOAL_ICONS = ['🎯', '🏠', '🚗', '✈️', '🏖️', '💍', '🎓', '💻', '📱', '👶', '🛡️', '🏝️', '🎸', '🐶', '🏋️', '💰'];
function monthsBetween(a, b) { const d1 = parseD(a), d2 = parseD(b); return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth()) + (d2.getDate() - d1.getDate()) / 30.44; }
function addMonthsStr(ds, m) { const d = parseD(ds); d.setDate(d.getDate() + Math.round(m * 30.44)); return dstr(d); }
const MONTHS_DAT = ['январю', 'февралю', 'марту', 'апрелю', 'маю', 'июню', 'июлю', 'августу', 'сентябрю', 'октябрю', 'ноябрю', 'декабрю'];
function monthYear(ds) { const d = parseD(ds); return `${MONTHS_DAT[d.getMonth()]} ${d.getFullYear()}`; }
function goalScope(g) { return g.accountIds?.length ? g.accountIds : vault.data.accounts.map(a => a.id); }
function goalValue(g, snap) {
  if (!snap) return 0;
  let s = 0;
  for (const id of goalScope(g)) { const a = vAcc(id), v = snap.values?.[id]; if (a && v) s += vConv(v, a.currency, g.currency, snap); }
  return s;
}
function goalInfo(g) {
  const snaps = vSnaps(), last = snaps.at(-1);
  const value = goalValue(g, last), left = Math.max(0, g.target - value), progress = g.target ? Math.min(1, value / g.target) : 0;
  // темп: средний прирост в месяц за последние полгода сверок
  let pace = null;
  const recent = snaps.filter(s => last && monthsBetween(s.date, last.date) <= 6.5);
  if (recent.length >= 2) { const m = monthsBetween(recent[0].date, last.date); if (m > 0.5) pace = (value - goalValue(g, recent[0])) / m; }
  const monthsLeft = g.deadline ? monthsBetween(today(), g.deadline) : null;
  const perMonth = g.deadline && left > 0 && monthsLeft > 0 ? left / Math.max(monthsLeft, 1) : null;
  const eta = left > 0 && pace > 0 ? addMonthsStr(last.date, left / pace) : null;
  return { value, left, progress, pace, monthsLeft, perMonth, eta, done: left <= 0 && g.target > 0 };
}

function goalsCard() {
  const goals = vault.data.goals || [];
  if (!goals.length) return `<button class="btn ghost" data-act="v-new-goal" style="margin-bottom:14px">🎯 Поставить цель</button>`;
  return `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><h3 style="margin:0">Цели</h3><button class="link" data-act="v-new-goal">＋ Цель</button></div>
    ${goals.map(g => {
      const i = goalInfo(g);
      const late = i.eta && g.deadline && i.eta > g.deadline;
      let hint;
      if (i.done) hint = '<span class="income">🎉 Цель достигнута!</span>';
      else {
        const parts = [];
        if (g.deadline) parts.push(i.monthsLeft > 0 ? `до ${parseD(g.deadline).getDate()} ${MONTHS_GEN[parseD(g.deadline).getMonth()]} ${parseD(g.deadline).getFullYear()} — откладывать ~${fmt(Math.ceil(i.perMonth), g.currency)}/мес` : '<span class="expense">срок прошёл</span>');
        if (i.eta) parts.push(`<span class="${late ? 'expense' : ''}">при нынешнем темпе — к ${monthYear(i.eta)}${late ? ' (позже срока)' : ''}</span>`);
        else if (i.pace !== null && i.pace <= 0) parts.push('<span class="expense">сейчас сумма не растёт</span>');
        hint = parts.join('<br>');
      }
      return `<button class="goal" data-act="v-edit-goal" data-v="${g.id}">
        <div class="goal-top"><span class="goal-ico">${g.icon || '🎯'}</span><span class="goal-name">${esc(g.name)}</span><span class="goal-pct">${Math.floor(i.progress * 100)}%</span></div>
        <div class="goal-bar"><div style="width:${i.progress * 100}%;${i.done ? 'background:var(--income)' : ''}"></div></div>
        <div class="goal-sum"><b>${fmt(i.value, g.currency)}</b> из ${fmt(g.target, g.currency)}${i.left > 0 ? ` · осталось ${fmt(i.left, g.currency)}` : ''}</div>
        ${hint ? `<div class="goal-hint">${hint}</div>` : ''}
      </button>`;
    }).join('')}</div>`;
}

function vGoalSheetOpen(id) {
  const g = (vault.data.goals || []).find(x => x.id === id);
  openSheet({ kind: 'vgoal', id: g?.id || null, name: g?.name || '', target: g ? String(g.target) : '', currency: g?.currency || vault.data.view || base(),
    deadline: g?.deadline || '', icon: g?.icon || '🎯', accountIds: [...(g?.accountIds || [])] });
}

function sheetVGoal() {
  const s = ui.sheet;
  const all = !s.accountIds.length;
  return `
    <div class="sheet-head"><button class="link" data-act="close">Отмена</button><h2>${s.id ? 'Цель' : 'Новая цель'}</h2><button class="link" data-act="v-save-goal">Готово</button></div>
    <div style="display:flex;justify-content:center;margin-bottom:10px"><div class="ico" style="width:64px;height:64px;font-size:32px;background:var(--accent-soft)">${s.icon}</div></div>
    <div class="field"><label>Название</label><input type="text" value="${esc(s.name)}" placeholder="Например, Подушка безопасности" data-input="vg-name"></div>
    <div class="field"><label>Сумма</label><input type="text" inputmode="decimal" value="${esc(s.target)}" placeholder="10000" data-input="vg-target"></div>
    <div class="field"><label>Валюта</label><select data-change="vg-cur">${state.currencies.map(c => `<option value="${c.code}" ${c.code === s.currency ? 'selected' : ''}>${c.code} · ${esc(c.name)}</option>`).join('')}</select></div>
    <div class="field"><label>Срок (необяз.)</label><input type="date" value="${s.deadline}" data-change="vg-deadline"></div>
    <div class="section-title">Какие счета считаются</div>
    <div class="chips" style="flex-wrap:wrap;margin:0;padding:0 0 10px">
      <button class="chip ${all ? 'on' : ''}" data-act="vg-acc" data-v="">Все счета копилки</button>
      ${vault.data.accounts.filter(a => !a.archived).map(a => `<button class="chip ${s.accountIds.includes(a.id) ? 'on' : ''}" data-act="vg-acc" data-v="${a.id}">${accIcon(a.icon, true)} ${esc(a.name)}</button>`).join('')}
    </div>
    <div class="section-title">Иконка</div>
    <div class="icon-pick">${GOAL_ICONS.map(i => `<button class="${s.icon === i ? 'on' : ''}" data-act="vg-icon" data-v="${i}">${i}</button>`).join('')}</div>
    <div class="muted small" style="margin:0 6px 8px">Прогресс считается по последней сверке: суммы выбранных счетов в валюте цели.</div>
    <button class="btn" data-act="v-save-goal">Сохранить</button>
    ${s.id ? `<button class="btn danger" data-act="v-del-goal">Удалить цель</button>` : ''}`;
}

async function vSaveGoal() {
  const s = ui.sheet, vd = vault.data;
  if (!s.name.trim()) return toast('Введите название');
  const target = parseNum(s.target);
  if (!(target > 0)) return toast('Введите сумму цели');
  const g = { id: s.id || uid(), name: s.name.trim(), target, currency: s.currency, deadline: s.deadline || null, icon: s.icon, accountIds: s.accountIds };
  vd.goals ||= [];
  const i = vd.goals.findIndex(x => x.id === g.id);
  if (i >= 0) vd.goals[i] = g; else vd.goals.push(g);
  await vaultCommit('Сохранено');
}

Object.assign(vaultActions, {
  'v-new-goal': () => vGoalSheetOpen(null),
  'v-edit-goal': v => vGoalSheetOpen(v),
  'vg-icon': v => { ui.sheet.icon = v; render(); },
  'vg-acc': v => { const s = ui.sheet; if (!v) s.accountIds = []; else s.accountIds = s.accountIds.includes(v) ? s.accountIds.filter(x => x !== v) : [...s.accountIds, v]; render(); },
  'v-save-goal': () => vSaveGoal(),
  'v-del-goal': async () => { if (!confirm('Удалить цель?')) return; vault.data.goals = vault.data.goals.filter(g => g.id !== ui.sheet.id); await vaultCommit('Удалено'); },
});
Object.assign(vaultChanges, { 'vg-cur': v => { ui.sheet.currency = v; }, 'vg-deadline': v => { ui.sheet.deadline = v; } });
Object.assign(vaultInputs, { 'vg-name': v => { ui.sheet.name = v; }, 'vg-target': v => { ui.sheet.target = v; } });

/* ================= Синхронизация между устройствами =================
   Сервер — только надёжная копия и обмен: приложение полностью работает без него.
   Всё шифруется на телефоне ключом синхронизации до отправки (AES-GCM-256).
   Ключ — 32 случайных символа; он есть только на устройствах Анны (и в «Паролях» iPhone).
   Из ключа (HKDF-SHA256) получаются: ключ шифрования, ключ для обезличенных идентификаторов записей,
   токен входа на сервер и номер «пространства». Сервер видит только rid, время изменения и шифр.
   Настройки синхронизации — в localStorage['monetka-sync'], отдельно от данных (у каждого устройства свои). */

const SYNC_KEY = 'monetka-sync';
const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford: без I, L, O, U
const SYNC_BATCH = 500;
const sync = { busy: false, again: false, timer: null, error: '', keys: null, keysFor: '' };

function syncCfg() { try { return JSON.parse(localStorage.getItem(SYNC_KEY) || 'null'); } catch (e) { return null; } }
function syncSaveCfg(c) { try { if (c) localStorage.setItem(SYNC_KEY, JSON.stringify(c)); else localStorage.removeItem(SYNC_KEY); } catch (e) {} }

function hex(buf) { return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join(''); }
function b32enc(bytes) {
  let bits = 0, val = 0, out = '';
  for (const b of bytes) { val = (val << 8) | b; bits += 8; while (bits >= 5) { out += B32[(val >>> (bits - 5)) & 31]; bits -= 5; } }
  if (bits) out += B32[(val << (5 - bits)) & 31];
  return out;
}
function b32dec(str) {
  let bits = 0, val = 0; const out = [];
  for (const ch of str) { const i = B32.indexOf(ch); if (i < 0) return null; val = ((val << 5) | i) & 0xffff; bits += 5; if (bits >= 8) { out.push((val >>> (bits - 8)) & 255); bits -= 8; } }
  return new Uint8Array(out);
}
// Ключ: 19 случайных байт + 1 байт проверки = 32 символа, группы по 4 через дефис
async function syncKeyCheckByte(bytes) { return new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))[0]; }
async function syncNewKey() {
  const r = crypto.getRandomValues(new Uint8Array(19));
  const all = new Uint8Array(20); all.set(r); all[19] = await syncKeyCheckByte(r);
  return b32enc(all).match(/.{4}/g).join('-');
}
// Возвращает ключ в каноническом виде или null, если в нём ошибка
async function syncNormKey(input) {
  const s = String(input || '').toUpperCase().replace(/[OО]/g, '0').replace(/[ILІ]/g, '1').replace(/[^0-9A-Z]/g, '');
  if (s.length !== 32) return null;
  const bytes = b32dec(s);
  if (!bytes || bytes.length !== 20) return null;
  if (await syncKeyCheckByte(bytes.slice(0, 19)) !== bytes[19]) return null;
  return s.match(/.{4}/g).join('-');
}
function syncNormServer(s) {
  s = String(s || '').trim().replace(/\/+$/, '');
  if (s && !/^https?:\/\//i.test(s)) s = 'https://' + s;
  return s;
}

async function syncKeys(key) {
  if (sync.keys && sync.keysFor === key) return sync.keys;
  const raw = b32dec(key.replace(/-/g, ''));
  const te = new TextEncoder();
  const hk = await crypto.subtle.importKey('raw', raw, 'HKDF', false, ['deriveKey', 'deriveBits']);
  const p = info => ({ name: 'HKDF', hash: 'SHA-256', salt: te.encode('monetka-sync-v1'), info: te.encode(info) });
  sync.keys = {
    enc: await crypto.subtle.deriveKey(p('monetka/enc'), hk, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']),
    mac: await crypto.subtle.deriveKey(p('monetka/rid'), hk, { name: 'HMAC', hash: 'SHA-256', length: 256 }, false, ['sign']),
    token: hex(await crypto.subtle.deriveBits(p('monetka/auth'), hk, 256)),
    space: hex(await crypto.subtle.deriveBits(p('monetka/space'), hk, 128)),
  };
  sync.keysFor = key;
  return sync.keys;
}

// Обезличенный идентификатор записи: сервер не видит ни тип, ни id
async function syncRid(k, coll, id) {
  return hex(await crypto.subtle.sign('HMAC', k.mac, new TextEncoder().encode(coll + '\n' + id))).slice(0, 32);
}
async function syncSeal(k, rid, ts, payload) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(rid + ':' + ts) }, k.enc, new TextEncoder().encode(JSON.stringify(payload)));
  return { rid, ts, blob: b64(iv) + '.' + b64(ct) };
}
async function syncOpen(k, it) {
  const [iv, ct] = it.blob.split('.');
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(iv), additionalData: new TextEncoder().encode(it.rid + ':' + it.ts) }, k.enc, unb64(ct));
  return JSON.parse(new TextDecoder().decode(plain));
}

// Изменения → зашифрованные записи. Удаление пишется в ту же запись, что и объект: побеждает более позднее.
async function syncBuild(k, ch) {
  const out = [];
  for (const [coll, key] of Object.entries(SYNC_COLLS))
    for (const o of ch.collections[coll]) out.push(await syncSeal(k, await syncRid(k, coll, o[key]), o.updatedAt || 0, { c: coll, o }));
  for (const d of ch.deletions) if (SYNC_COLLS[d.coll]) out.push(await syncSeal(k, await syncRid(k, d.coll, d.id), d.deletedAt, { c: d.coll, d }));
  if (ch.settings) out.push(await syncSeal(k, await syncRid(k, 'settings', ''), ch.settings.updatedAt || 0, { c: 'settings', o: ch.settings }));
  if (ch.vaultUpdatedAt) out.push(await syncSeal(k, await syncRid(k, 'vault', ''), ch.vaultUpdatedAt, { c: 'vault', o: ch.vault }));
  return out;
}
// Зашифрованные записи с сервера → формат applyRemote()
async function syncUnpack(k, items) {
  const ch = { collections: {}, deletions: [] };
  for (const it of items) {
    let p;
    try { p = await syncOpen(k, it); } catch (e) { console.warn('sync: запись не расшифровалась', it.rid); continue; }
    if (p.c === 'settings') ch.settings = p.o;
    else if (p.c === 'vault') { ch.vault = p.o; ch.vaultUpdatedAt = it.ts; }
    else if (!SYNC_COLLS[p.c]) continue;
    else if (p.d) ch.deletions.push(p.d);
    else (ch.collections[p.c] ||= []).push(p.o);
  }
  return ch;
}

async function syncPost(cfg, k, body) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 25000);
  let r;
  try {
    r = await fetch(cfg.server + '/sync', { method: 'POST', signal: ctl.signal, cache: 'no-store',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + k.token }, body: JSON.stringify({ space: k.space, ...body }) });
  } catch (e) { throw new Error('offline'); }
  finally { clearTimeout(t); }
  if (r.status === 401) throw new Error('Ключ не подходит к этому серверу');
  if (r.status === 403) throw new Error('Сервер не принимает новые ключи');
  if (r.status === 429) throw new Error('Слишком часто, попробуйте через минуту');
  if (!r.ok) throw new Error('Ошибка сервера (' + r.status + ')');
  return r.json();
}

// Скачать с сервера всё после cursor (без отправки)
async function syncPullAll(cfg, k, since) {
  const items = [];
  let cursor = since, more = true;
  while (more) {
    const r = await syncPost(cfg, k, { since: cursor, push: [] });
    if (r.reset) return { reset: true };
    items.push(...r.items); cursor = r.cursor; more = r.more;
  }
  return { items, cursor };
}

function syncErrText(e) { return e.message === 'offline' ? 'Нет связи с сервером — данные сохранены на телефоне' : e.message; }

// Полный обмен: отправить своё, получить чужое
async function syncNow(manual) {
  const cfg = syncCfg();
  if (!cfg) return;
  if (sync.busy) { sync.again = true; return; }
  clearTimeout(sync.timer);
  sync.busy = true; sync.error = '';
  if (ui.sheet?.kind === 'sync') render();
  let changed = 0;
  try {
    const k = await syncKeys(cfg.key);
    for (let attempt = 0; attempt < 2; attempt++) {
      const ch = changesSince(cfg.pushedAt || 0);
      const recs = await syncBuild(k, ch);
      let cursor = cfg.cursor || 0, i = 0, more = false, reset = false;
      const incoming = [];
      do {
        const r = await syncPost(cfg, k, { since: cursor, push: recs.slice(i, i + SYNC_BATCH) });
        if (r.reset) { reset = true; break; }
        i += SYNC_BATCH; incoming.push(...r.items); cursor = r.cursor; more = r.more;
      } while (i < recs.length || more);
      if (reset) { cfg.cursor = 0; cfg.pushedAt = 0; continue; } // сервер начал с чистого листа — отправляем всё заново
      changed = applyRemote(await syncUnpack(k, incoming));
      cfg.cursor = cursor; cfg.pushedAt = ch.at - 1; cfg.lastOk = Date.now();
      break;
    }
    syncSaveCfg(cfg);
    if (manual) toast(changed ? `Синхронизировано, получено изменений: ${changed}` : 'Синхронизировано');
  } catch (e) {
    sync.error = syncErrText(e);
    if (manual) toast(sync.error);
  }
  sync.busy = false;
  if (changed && !ui.sheet) render();
  else if (ui.sheet?.kind === 'sync' || ui.tab === 'settings') render();
  if (sync.again) { sync.again = false; scheduleSync(1000); }
}

// После каждого сохранения — обмен через несколько секунд (несколько правок подряд уйдут одним запросом)
function scheduleSync(ms = 4000) {
  if (!syncCfg()) return;
  clearTimeout(sync.timer);
  sync.timer = setTimeout(() => syncNow(false), ms);
}

// Пустое состояние для подключения к уже существующим данным (чтобы не плодить копии стандартных категорий)
function emptyState() {
  const s = migrate({ ...defaultState(), currencies: [], accounts: [], categories: [] });
  delete s.settings.updatedAt;
  return s;
}

// Подключение этого устройства. key — уже проверенный ключ.
async function syncConnect(server, key, isNew) {
  const cfg = { server, key, cursor: 0, pushedAt: 0 };
  const k = await syncKeys(key);
  if (!isNew) {
    const got = await syncPullAll(cfg, k, 0); // заодно проверяет адрес и ключ
    const hasLocal = state.transactions.length > 0 || !!state.vault;
    if (!got.reset && got.items.length) {
      const replace = !hasLocal || confirm('На сервере уже есть данные Монетки.\n\nОК — заменить данные этого телефона данными с сервера (рекомендуется).\nОтмена — объединить: на сервер уйдут и записи этого телефона.');
      if (replace) {
        state = emptyState();
        snapshot = takeSnapshot(state);
        applyRemote(await syncUnpack(k, got.items));
        cfg.pushedAt = Date.now(); cfg.cursor = got.cursor;
      }
    }
  } else {
    await syncPost(cfg, k, { since: 0, push: [] }); // проверка адреса; сервер создаёт пространство
  }
  syncSaveCfg(cfg);
  await syncNow(false);
}

function syncStatusText() {
  const cfg = syncCfg();
  if (!cfg) return 'Выключена';
  if (sync.busy) return 'Синхронизация…';
  if (sync.error) return sync.error;
  if (!cfg.lastOk) return 'Ещё не синхронизировано';
  const d = new Date(cfg.lastOk);
  return 'Последняя: ' + (dstr(d) === today() ? 'сегодня' : shortDate(dstr(d))) + ` в ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function sheetSync() {
  const s = ui.sheet, cfg = syncCfg();
  const head = `<div class="sheet-head"><span style="width:60px"></span><h2>Синхронизация</h2><button class="link" data-act="close">Готово</button></div>`;
  if (cfg) return `${head}
    <div class="note-box ${sync.error ? '' : 'remind'}">${sync.busy ? '🔄' : sync.error ? '⚠️' : '✅'} ${esc(syncStatusText())}</div>
    <div class="field"><label>Сервер</label><input value="${esc(cfg.server)}" readonly></div>
    <div class="field"><label>Ключ</label><input value="••••-••••-••••-••••" readonly></div>
    ${s.show ? `<div class="sync-key">${esc(cfg.key)}</div>` : ''}
    <div class="btn-row"><button class="btn ghost" data-act="sync-show">${s.show ? 'Скрыть ключ' : 'Показать ключ'}</button><button class="btn ghost" data-act="sync-copy">Скопировать ключ</button></div>
    <button class="btn" data-act="sync-now" ${sync.busy ? 'disabled' : ''}>🔄 Синхронизировать сейчас</button>
    <div class="note-box" style="margin-top:12px">Чтобы подключить другой телефон или компьютер: откройте там Монетку → Настройки → Синхронизация и введите этот адрес и ключ. Без ключа данные с сервера прочитать невозможно — храните его в «Паролях».</div>
    <button class="btn danger" data-act="sync-off">Отключить на этом устройстве</button>`;
  return `${head}
    <div class="note-box">Монетка работает и без интернета. Синхронизация хранит <b>зашифрованную</b> копию на вашем сервере и обменивается изменениями между устройствами. Расшифровать её можно только ключом, который есть лишь у вас.</div>
    <form data-submit="sync-connect" autocomplete="on">
      <div class="field"><label>Сервер</label><input name="username" autocomplete="username" inputmode="url" autocapitalize="off" spellcheck="false" placeholder="https://…" value="${esc(s.server)}" data-input="sync-server"></div>
      <div class="field"><label>Ключ</label><input type="password" name="password" autocomplete="${s.created ? 'new-password' : 'current-password'}" autocapitalize="characters" spellcheck="false" placeholder="XXXX-XXXX-…" value="${esc(s.key)}" data-input="sync-key" style="font-family:ui-monospace,monospace;font-size:14px"></div>
      ${s.created ? `<div class="sync-key">${esc(s.key)}</div><div class="note-box remind">🔑 Это новый ключ. <b>Сохраните его</b>: после «Подключить» iPhone предложит сохранить его в «Пароли». Без ключа зашифрованную копию не открыть.</div>` : ''}
      <button class="btn" type="submit" ${s.busy ? 'disabled' : ''}>${s.busy ? 'Подключаю…' : 'Подключить'}</button>
    </form>
    ${s.created ? '' : `<div class="note-box" style="margin-top:12px">Первое устройство? Создайте ключ. Уже есть ключ с другого устройства — введите его выше.</div>
    <button class="btn ghost" data-act="sync-create">🔑 Создать новый ключ</button>`}`;
}

const syncActions = {
  'sync-open': () => openSheet({ kind: 'sync', server: '', key: '', created: false, show: false, busy: false }),
  'sync-create': async () => { ui.sheet.key = await syncNewKey(); ui.sheet.created = true; render(); },
  'sync-show': () => { ui.sheet.show = !ui.sheet.show; render(); },
  'sync-copy': async () => { try { await navigator.clipboard.writeText(syncCfg().key); toast('Ключ скопирован'); } catch (e) { toast('Не удалось скопировать'); } },
  'sync-now': () => syncNow(true),
  'sync-off': () => {
    if (!confirm('Отключить синхронизацию на этом устройстве? Данные на телефоне и на сервере останутся.')) return;
    syncSaveCfg(null); sync.error = ''; render(); toast('Синхронизация отключена');
  },
};
const syncInputs = { 'sync-server': v => { ui.sheet.server = v; }, 'sync-key': v => { ui.sheet.key = v; } };
const syncSubmits = {
  'sync-connect': async () => {
    const s = ui.sheet;
    const server = syncNormServer(s.server);
    if (!/^https:\/\/[^/]+|^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(server)) return toast('Введите адрес сервера (https://…)');
    const key = await syncNormKey(s.key);
    if (!key) return toast('В ключе ошибка — проверьте его');
    s.busy = true; render();
    try { await syncConnect(server, key, s.created); ui.sheet = { kind: 'sync', show: false }; toast('Синхронизация включена'); }
    catch (e) { toast(syncErrText(e)); }
    if (ui.sheet) ui.sheet.busy = false;
    render();
  },
};

/* ================= Events ================= */

const actions = {
  tab: v => { ui.tab = v; ui.sheet = null; render(); window.scrollTo(0, 0); },
  month: v => { [ui.year, ui.month] = shiftMonth(ui.year, ui.month, Number(v)); render(); },
  year: v => { ui.year += Number(v); render(); },
  'filter-acc': v => { ui.account = v || null; render(); },
  'chart-type': v => { ui.chartType = v; render(); },
  'chart-period': v => { ui.chartPeriod = v; render(); },
  'new-tx': () => { if (!state.accounts.length) { toast('Сначала добавьте счёт'); ui.tab = 'accounts'; return render(); } newTxSheet(); },
  'new-transfer': () => { if (state.accounts.length < 2) return toast('Для перевода нужно минимум два счёта'); newTxSheet('transfer'); },
  'edit-tx': v => editTxSheet(v),
  close: () => closeSheet(),
  overlay: (v, e) => { if (e.target.classList.contains('overlay')) closeSheet(); },
  'tx-type': v => { const s = ui.sheet; if (s.type !== v) { s.type = v; s.categoryId = null; s.field = 'amount';
    if (v === 'transfer' && s.toAccountId === s.accountId) s.toAccountId = state.accounts.find(a => a.id !== s.accountId)?.id || s.accountId; } render(); },
  'tx-field': v => { ui.sheet.field = v; render(); },
  'tx-today': () => { ui.sheet.date = today(); render(); },
  'tx-cat': v => { ui.sheet.categoryId = v; render(); },
  key: v => pressKey(v),
  'save-tx': () => saveTx(),
  'del-tx': () => { if (!confirm('Удалить запись?')) return; state.transactions = state.transactions.filter(t => t.id !== ui.sheet.id); save(); closeSheet(); toast('Удалено'); },

  'new-acc': () => openSheet({ kind: 'acc', id: null, name: '', currency: base(), initial: '0', icon: '💳', color: COLORS[state.accounts.length % COLORS.length] }),
  'edit-acc': v => { const a = acc(v); openSheet({ kind: 'acc', ...a, initial: String(a.initial) }); },
  'acc-icon': v => { ui.sheet.icon = v; render(); },
  'acc-color': v => { ui.sheet.color = v; render(); },
  'save-acc': () => saveAcc(),
  'del-acc': () => {
    const id = ui.sheet.id;
    const n = state.transactions.filter(t => t.accountId === id || t.toAccountId === id).length;
    if (!confirm(n ? `У счёта ${n} записей. Удалить счёт вместе с ними?` : 'Удалить счёт?')) return;
    state.accounts = state.accounts.filter(a => a.id !== id);
    state.transactions = state.transactions.filter(t => t.accountId !== id && t.toAccountId !== id);
    if (ui.account === id) ui.account = null;
    save(); closeSheet(); toast('Счёт удалён');
  },

  'edit-cur': v => openSheet({ kind: 'cur', isNew: false, ...cur(v), perUSD: String(cur(v).perUSD) }),
  'new-cur': () => openSheet({ kind: 'cur', isNew: true, code: '', name: '', symbol: '', decimals: 2, perUSD: '' }),
  'save-cur': () => saveCur(),
  'del-cur': () => {
    const code = ui.sheet.code;
    if (state.accounts.some(a => a.currency === code)) return toast('Эта валюта используется в счетах');
    if (!confirm(`Удалить ${code}?`)) return;
    state.currencies = state.currencies.filter(c => c.code !== code);
    if (base() === code) state.settings.baseCurrency = 'USD';
    save(); closeSheet();
  },
  'update-rates': () => updateRates(),

  cats: v => openSheet({ kind: 'cats', type: v }),
  'back-cats': () => openSheet({ kind: 'cats', type: ui.sheet.type }),
  'new-cat': () => openSheet({ kind: 'cat', id: null, type: ui.sheet.type, name: '', icon: '📦', color: COLORS[0] }),
  'edit-cat': v => openSheet({ kind: 'cat', ...catById(v) }),
  'cat-icon': v => { ui.sheet.icon = v; render(); },
  'cat-color': v => { ui.sheet.color = v; render(); },
  'cat-up': v => {
    const list = state.categories;
    const i = list.findIndex(c => c.id === v);
    let j = i - 1; while (j >= 0 && list[j].type !== list[i].type) j--;
    if (j < 0) return;
    [list[i], list[j]] = [list[j], list[i]];
    save(); render();
  },
  'save-cat': () => {
    const s = ui.sheet;
    if (!s.name.trim()) return toast('Введите название');
    const c = { id: s.id || uid(), type: s.type, name: s.name.trim(), icon: s.icon, color: s.color };
    const i = state.categories.findIndex(x => x.id === c.id);
    if (i >= 0) state.categories[i] = c; else state.categories.push(c);
    save(); openSheet({ kind: 'cats', type: s.type });
  },
  'del-cat': () => {
    const s = ui.sheet;
    const n = state.transactions.filter(t => t.categoryId === s.id).length;
    if (!confirm(n ? `В категории ${n} записей. Они останутся, но без категории. Удалить?` : 'Удалить категорию?')) return;
    state.categories = state.categories.filter(c => c.id !== s.id);
    save(); openSheet({ kind: 'cats', type: s.type });
  },

  export: () => exportJSON(),
  csv: () => exportCSV(),
  import: () => document.getElementById('importFile').click(),
  wipe: () => {
    if (!confirm(syncCfg() ? 'Удалить ВСЕ данные? Включена синхронизация — они удалятся и на сервере, и на других устройствах. Сначала лучше сохранить резервную копию.' : 'Удалить ВСЕ данные с телефона? Сначала лучше сохранить резервную копию.')) return;
    if (!confirm('Точно удалить? Это нельзя отменить.')) return;
    state = defaultState(); save(); render(); toast('Данные удалены');
  },
};

Object.assign(actions, recActions, adjActions, vaultActions, syncActions);

const changes = {
  'base-cur': v => { state.settings.baseCurrency = v; save(); render(); },
  'cat-sort': v => { state.settings.sortCatsByUse = v === '1'; save(); render(); },
  accent: v => { state.settings.accent = v; save(); render(); },
  theme: v => { state.settings.theme = v; save(); render(); },
  'tx-acc': v => { ui.sheet.accountId = v; ui.sheet.toExpr = ''; render(); },
  'tx-to': v => { ui.sheet.toAccountId = v; ui.sheet.toExpr = ''; render(); },
  'tx-date': v => { ui.sheet.date = v || today(); render(); },
  'acc-cur': v => { ui.sheet.currency = v; render(); },
  'cur-dec': v => { ui.sheet.decimals = Number(v); },
};

Object.assign(changes, recChanges, adjChanges, vaultChanges);

const inputs = {
  'tx-note': v => { ui.sheet.note = v; },
  'acc-name': v => { ui.sheet.name = v; },
  'acc-initial': v => { ui.sheet.initial = v; },
  'cur-code': v => { ui.sheet.code = v; },
  'cur-name': v => { ui.sheet.name = v; },
  'cur-symbol': v => { ui.sheet.symbol = v; },
  'cur-rate': v => { ui.sheet.perUSD = v; },
  'cat-name': v => { ui.sheet.name = v; },
};

Object.assign(inputs, recInputs, adjInputs, vaultInputs, syncInputs);

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.act];
  if (fn) fn(el.dataset.v, e);
});
document.addEventListener('change', e => {
  const el = e.target.closest('[data-change]');
  if (el && changes[el.dataset.change]) changes[el.dataset.change](el.value, el);
});
document.addEventListener('input', e => {
  const el = e.target.closest('[data-input]');
  if (el && inputs[el.dataset.input]) inputs[el.dataset.input](el.value, el);
});
document.getElementById('importFile').addEventListener('change', e => {
  const f = e.target.files[0];
  if (f) importJSON(f);
  e.target.value = '';
});

/* ================= Start ================= */

// Один раз: ставим новые иконки на подходящие счета
if (!state.settings.iconsV1) {
  const DEFAULT_EMOJI = ['💵', '💳', '🏦', '💰', '🪙', '👛'];
  const byCur = { VND: 'bi:vnd', UZS: 'bi:uzs', RUB: 'bi:rub', USD: 'bi:usd', EUR: 'bi:eur' };
  for (const a of state.accounts) {
    const n = a.name.toLowerCase();
    if (n.includes('momo') || n.includes('момо')) a.icon = 'bi:momo';
    else if (n.includes('bidv')) a.icon = 'bi:bidv';
    else if (n.includes('vcb') || n.includes('vietcom')) a.icon = 'bi:vcb';
    else if (DEFAULT_EMOJI.includes(a.icon) && byCur[a.currency]) a.icon = byCur[a.currency];
  }
  state.settings.iconsV1 = true;
  save();
}
processAuto();
render();
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-submit]');
  if (!f) return;
  e.preventDefault();
  (vaultSubmits[f.dataset.submit] || syncSubmits[f.dataset.submit])?.();
});
// свернули приложение — закрываем копилку
document.addEventListener('visibilitychange', () => { if (document.hidden && vault.data) { vaultLock(); if (ui.tab === 'vault') render(); } });
document.addEventListener('visibilitychange', () => { if (!document.hidden && !ui.sheet) { const n = state.transactions.length; processAuto(); if (state.transactions.length !== n) render(); } });
// синхронизация: при открытии, при возвращении в приложение, при появлении сети и раз в 5 минут
document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleSync(300); });
window.addEventListener('online', () => scheduleSync(1000));
setInterval(() => { if (!document.hidden) syncNow(false); }, 5 * 60 * 1000);
scheduleSync(800);
if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => reg.update()).catch(() => {});
  // новая версия приложения установилась — перезагружаемся (если не открыта форма)
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded || ui.sheet) return;
    reloaded = true; location.reload();
  });
}
