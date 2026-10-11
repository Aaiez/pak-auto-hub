const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const PROJECT = path.join(__dirname, '..');
const ROOT = fs.existsSync(path.join(PROJECT, 'dist', 'index.html')) ? path.join(PROJECT, 'dist') : PROJECT;

class Target {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, callback) {
    const list = this.listeners.get(type) || [];
    list.push(callback); this.listeners.set(type, list);
  }
  async emit(type, event = {}) {
    event.type = type; event.target ||= this;
    await Promise.all((this.listeners.get(type) || []).map(callback => callback(event)));
  }
}

class Element extends Target {
  constructor(id = '') {
    super(); this.id = id; this.hidden = false; this.disabled = false;
    this.open = false; this.textContent = ''; this.innerHTML = '';
    this.dataset = {}; this.attributes = {}; this.value = '';
    this.options = []; this.minimum = -Infinity; this.maximum = Infinity;
    const classes = new Set();
    this.classList = {
      toggle(name, on) { if (on) classes.add(name); else classes.delete(name); },
      contains(name) { return classes.has(name); }
    };
  }
  setAttribute(name, value) { this.attributes[name] = value; }
  removeAttribute(name) { delete this.attributes[name]; }
  showModal() { this.open = true; }
  close() { this.open = false; }
  getBoundingClientRect() { return { left: 0, top: 0, right: 400, bottom: 400 }; }
  click() { return this.emit('click'); }
  checkValidity() {
    if (this.options.length) return this.options.some(option => option.value === this.value);
    const number = Number(this.value);
    return this.value !== '' && Number.isFinite(number) && number >= this.minimum && number <= this.maximum;
  }
}

function uiFixture({ ios = false, standalone = false, plan = null, worker = false } = {}) {
  const ids = [...fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  const elements = Object.fromEntries(ids.map(id => [id, new Element(id)]));
  const installs = [new Element(), new Element()];
  const help = [new Element(), new Element()];
  const platforms = ['android', 'ios'].map(platform => {
    const element = new Element(); element.dataset.installPlatform = platform; return element;
  });
  const nav = ['Cars', 'Budget', 'Saved', 'Compare'].map(name => {
    const element = elements['mobile' + name]; element.dataset.appNav = name.toLowerCase(); return element;
  });
  const groups = { '[data-install]': installs, '[data-install-help]': help, '[data-install-platform]': platforms, '[data-app-nav]': nav };
  const document = new Target();
  document.getElementById = id => {
    assert.ok(elements[id], `Missing real HTML element: ${id}`); return elements[id];
  };
  document.querySelectorAll = selector => groups[selector] || [];
  document.body = new Element();
  document.dispatchEvent = event => document.emit(event.type, event);
  elements.totalBudget.value = '30'; elements.totalBudget.minimum = 1; elements.totalBudget.maximum = 1000;
  elements.fees.value = '0.5'; elements.fees.minimum = 0; elements.fees.maximum = 100;
  elements.reserve.value = '2'; elements.reserve.minimum = 0; elements.reserve.maximum = 100;
  elements.priority.options = ['family', 'city', 'new', 'budget'].map(value => ({ value }));
  elements.priority.value = 'family';
  const storage = new Map(plan ? [['pakautohub-plan-v1', JSON.stringify(plan)]] : []);
  const media = new Target(); media.matches = standalone;
  const window = new Target(); window.matchMedia = () => media; window.isSecureContext = true;
  let reloads = 0;
  const location = { hash: '', reload: () => reloads++ };
  const navigator = { userAgent: ios ? 'iPhone Safari' : 'Android Chrome', platform: '', maxTouchPoints: 0, onLine: true };
  const messages = [];
  const serviceWorker = new Target();
  const registration = new Target();
  if (worker) {
    registration.waiting = { postMessage: message => messages.push(message) };
    registration.update = async () => {};
    serviceWorker.ready = Promise.resolve({ active: null });
    serviceWorker.register = async () => registration;
    serviceWorker.controller = {};
    navigator.serviceWorker = serviceWorker;
  }
  const context = vm.createContext({
    document, window, navigator, location, console, setTimeout, clearTimeout,
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
    CustomEvent: class { constructor(type, init = {}) { this.type = type; this.detail = init.detail; } }
  });
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'pwa.js'), 'utf8'), context);
  return { elements, installs, platforms, window, document, navigator, location, storage, messages, serviceWorker, reloads: () => reloads };
}

test('Android install uses each browser prompt once; acceptance alone does not claim installation', async () => {
  const ui = uiFixture();
  let calls = 0, prevented = false;
  await ui.window.emit('beforeinstallprompt', {
    preventDefault() { prevented = true; },
    async prompt() { calls++; },
    userChoice: Promise.resolve({ outcome: 'accepted' })
  });
  await ui.installs[0].click();
  assert.equal(prevented, true); assert.equal(calls, 1);
  assert.equal(ui.elements.appBanner.hidden, false);
  await ui.installs[0].click();
  assert.equal(calls, 1); assert.equal(ui.elements.installDialog.open, true);
  await ui.window.emit('appinstalled');
  assert.equal(ui.elements.appBanner.hidden, true);
  assert.equal(ui.elements.installDialog.open, false);
  assert.ok(ui.installs.every(button => button.hidden));
});

test('iPhone gives Safari instructions, and an installed launch hides installation promotion', async () => {
  const ui = uiFixture({ ios: true });
  await ui.installs[0].click();
  assert.equal(ui.elements.installDialog.open, true);
  assert.match(ui.elements.installSteps.innerHTML, /Safari/);
  assert.match(ui.elements.installSteps.innerHTML, /Add to Home Screen/);
  assert.match(ui.elements.installSteps.innerHTML, /Open as Web App/);
  assert.equal(ui.platforms[1].attributes['aria-pressed'], 'true');
  const installed = uiFixture({ ios: true, standalone: true });
  assert.equal(installed.elements.appBanner.hidden, true);
  assert.ok(installed.installs.every(button => button.hidden));
});

test('saved/compare counts and phone navigation use the catalogue state', async () => {
  const ui = uiFixture();
  await ui.document.emit('pakautohub:state', { detail: { savedCount: 2, compareCount: 3, savedOnly: true } });
  assert.equal(ui.elements.mobileSavedCount.textContent, 2);
  assert.equal(ui.elements.mobileCompareCount.textContent, 3);
  assert.equal(ui.elements.mobileSavedCount.hidden, false);
  assert.ok(ui.elements.mobileSaved.classList.contains('selected'));
  await ui.elements.mobileBudget.click();
  await ui.document.emit('pakautohub:state', { detail: { savedCount: 2, compareCount: 3, savedOnly: true } });
  assert.ok(ui.elements.mobileBudget.classList.contains('selected'));
  let showAll = 0, compare = 0, saved = 0;
  ui.document.addEventListener('pakautohub:show-all', () => showAll++);
  ui.elements.navCompare.addEventListener('click', () => compare++);
  ui.elements.savedNav.addEventListener('click', () => saved++);
  await ui.elements.mobileCars.click();
  await ui.elements.mobileCompare.click();
  await ui.elements.mobileSaved.click();
  assert.equal(showAll, 1); assert.equal(compare, 1); assert.equal(saved, 1);
});

test('planning values persist on this device; invalid or unknown saved values are rejected', async () => {
  const ui = uiFixture({ plan: { totalBudget: '35', priority: 'city', fees: '-10', reserve: 'not-a-number' } });
  assert.equal(ui.elements.totalBudget.value, '35');
  assert.equal(ui.elements.priority.value, 'city');
  assert.equal(ui.elements.fees.value, '0.5');
  assert.equal(ui.elements.reserve.value, '2');
  ui.elements.fees.value = '1'; await ui.elements.fees.emit('change');
  assert.equal(JSON.parse(ui.storage.get('pakautohub-plan-v1')).fees, '1');
});

test('app update refresh waits for explicit action and controller change', async () => {
  const ui = uiFixture({ worker: true });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(ui.elements.updateBanner.hidden, false);
  assert.equal(ui.reloads(), 0);
  await ui.elements.applyUpdate.click();
  assert.equal(ui.messages[0].type, 'SKIP_WAITING');
  assert.equal(ui.reloads(), 0);
  await ui.serviceWorker.emit('controllerchange');
  assert.equal(ui.reloads(), 1);
});

function swFixture(scope = 'https://pakautohub.example/', failures = new Set()) {
  const base = new URL(scope), database = new Map(), handlers = new Map();
  let online = true, skipped = 0, claimed = 0;
  const notices = [];
  const key = request => typeof request === 'string' ? request : request.url;
  async function network(request) {
    const url = new URL(key(request));
    if (!online || failures.has(url.href)) throw Error('Network unavailable');
    const relative = url.pathname.slice(base.pathname.length) || 'index.html';
    const file = path.join(ROOT, relative);
    if (!fs.existsSync(file)) return new Response('Missing', { status: 404 });
    return new Response(fs.readFileSync(file));
  }
  const caches = {
    async open(name) {
      if (!database.has(name)) database.set(name, new Map());
      const entries = database.get(name);
      return {
        async match(request) { return entries.get(key(request))?.clone(); },
        async put(request, response) { entries.set(key(request), response.clone()); },
        async add(request) {
          const response = await network(request);
          if (!response.ok) throw Error('Not OK'); entries.set(key(request), response);
        },
        async addAll(requests) {
          const responses = await Promise.all(requests.map(network));
          if (responses.some(response => !response.ok)) throw Error('Not OK');
          requests.forEach((request, index) => entries.set(key(request), responses[index]));
        }
      };
    },
    async keys() { return [...database.keys()]; },
    async delete(name) { return database.delete(name); }
  };
  const self = {
    registration: { scope },
    clients: { async claim() { claimed++; }, async matchAll() { return [{ postMessage: data => notices.push(data) }]; } },
    async skipWaiting() { skipped++; },
    addEventListener: (type, callback) => handlers.set(type, callback)
  };
  const context = vm.createContext({ self, caches, URL, Request, Response, fetch: network, console });
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8'), context);
  const cacheName = vm.runInContext('CACHE_NAME', context);
  async function emit(type, attributes = {}) {
    const tasks = []; let response;
    const event = { ...attributes, waitUntil: promise => tasks.push(promise), respondWith: promise => { response = promise; } };
    handlers.get(type)(event);
    if (response) response = await response;
    await Promise.all(tasks);
    return response;
  }
  async function status() {
    let value;
    await emit('message', { data: { type: 'GET_OFFLINE_STATUS' }, ports: [{ postMessage: data => { value = data; } }] });
    return value;
  }
  return { base, database, emit, status, cacheName, notices, offline: () => { online = false; }, skipped: () => skipped, claimed: () => claimed };
}

for (const suffix of ['/', '/car-web/']) {
  test(`offline catalogue and assets work at ${suffix}, including query-string app launch`, async () => {
    const sw = swFixture('https://pakautohub.example' + suffix);
    assert.equal((await sw.status()).ready, false);
    await sw.emit('install');
    assert.equal((await sw.status()).ready, true);
    assert.equal(sw.skipped(), 0);
    sw.database.set(sw.cacheName + '-old', new Map());
    sw.database.set('unrelated-app-cache', new Map());
    await sw.emit('activate');
    assert.equal(sw.database.has(sw.cacheName + '-old'), false);
    assert.equal(sw.database.has('unrelated-app-cache'), true);
    assert.equal(sw.claimed(), 1);
    assert.equal(sw.notices[0].type, 'OFFLINE_READY');
    sw.offline();
    const html = await sw.emit('fetch', { request: { url: new URL('?app=1', sw.base).href, method: 'GET', mode: 'navigate' } });
    assert.match(await html.text(), /PakAutoHub/);
    const data = await sw.emit('fetch', { request: new Request(new URL('catalogue.json', sw.base)) });
    const catalogue = await data.json();
    assert.equal(catalogue.cars.length, 19);
    assert.equal(catalogue.cars.flatMap(car => car.variants).length, 31);
    const script = await sw.emit('fetch', { request: new Request(new URL('core.js', sw.base)) });
    assert.match(await script.text(), /fuel/);
    const photo = await sw.emit('fetch', { request: new Request(new URL('cars/alto.png', sw.base)) });
    assert.ok((await photo.arrayBuffer()).byteLength > 1000);
    const external = await sw.emit('fetch', { request: new Request('https://cache2.pakwheels.com/photo.webp') });
    assert.equal(external, undefined);
    const otherApp = await sw.emit('fetch', { request: new Request('https://pakautohub.example/another-app/catalogue.json') });
    assert.equal(otherApp, undefined);
    await sw.emit('message', { data: { type: 'SKIP_WAITING' } });
    assert.equal(sw.skipped(), 1);
  });
}

test('failed required data prevents offline-ready status and removes the incomplete cache', async () => {
  const sw = swFixture('https://pakautohub.example/', new Set(['https://pakautohub.example/catalogue.json']));
  sw.database.set('previous-working-version', new Map());
  await assert.rejects(sw.emit('install'), /Network unavailable/);
  assert.equal(sw.database.has(sw.cacheName), false);
  assert.equal(sw.database.has('previous-working-version'), true);
  assert.equal((await sw.status()).ready, false);
});

test('one failed photograph does not block offline tools; uncached photo fails clearly offline', async () => {
  const sw = swFixture('https://pakautohub.example/', new Set(['https://pakautohub.example/cars/alto.png']));
  await sw.emit('install');
  assert.equal((await sw.status()).ready, true);
  sw.offline();
  const response = await sw.emit('fetch', { request: new Request('https://pakautohub.example/cars/alto.png') });
  assert.equal(response.status, 503);
  assert.match(await response.text(), /unavailable offline/);
});
