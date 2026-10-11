/* Installation, offline status and phone navigation; no app-store account needed. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const standaloneQuery = window.matchMedia('(display-mode: standalone)');
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(navigator.userAgent);
  const launchedStandalone = () => standaloneQuery.matches || navigator.standalone === true;
  let installedHere = false;
  let installPrompt = null;
  let installInProgress = false;
  let offlineReady = false;
  let registration = null;
  let refreshingForUpdate = false;
  let savedView = false;
  let lastNav = location.hash === '#budgetPlanner' ? 'budget' : 'cars';

  function updateInstallationUI() {
    const installed = launchedStandalone() || installedHere;
    document.querySelectorAll('[data-install]').forEach(button => {
      button.hidden = installed;
      button.disabled = installInProgress;
    });
    $('appBanner').hidden = installed;
    document.body.classList.toggle('installed-app', launchedStandalone());
  }

  function updateConnectionUI() {
    const offline = navigator.onLine === false;
    $('connectionStatus').textContent = offline ? 'Offline' : 'Online';
    $('connectionStatus').classList.toggle('offline', offline);
    $('offlineHeading').textContent = offlineReady ? 'Offline catalogue ready' : 'Offline catalogue';
    $('offlineDescription').textContent = offlineReady
      ? 'Cars, saved favourites, comparison and budget tools work after opening this app once online. Some external listing photos and source links still need internet. Prices remain the dated catalogue snapshot.'
      : 'Open this app with internet to save its catalogue and tools on this device. Keep the page open until offline setup completes.';
  }

  function platformInstructions(platform) {
    document.querySelectorAll('[data-install-platform]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.installPlatform === platform));
    });
    const instructions = {
      android: '<li>Open this website in <strong>Chrome</strong> on your Android phone.</li><li>Tap <strong>Install app</strong> on this page. If no prompt appears, open Chrome’s <strong>⋮ menu</strong> and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li><li>Confirm the installation, then open <strong>PakAutoHub</strong> from your phone’s app icon.</li>',
      ios: '<li>Open this website in <strong>Safari</strong> on your iPhone.</li><li>Tap <strong>Share</strong> (the square with an upward arrow), then <strong>Add to Home Screen</strong>. On some Safari layouts, Share is inside the page menu.</li><li>Turn on <strong>Open as Web App</strong> if shown, then tap <strong>Add</strong>. Launch PakAutoHub from its new icon.</li>',
      desktop: '<li>Open this website in <strong>Chrome or Edge</strong>.</li><li>Use the <strong>install icon</strong> in the address bar, or the browser menu’s app installation option.</li><li>For your phone, choose the <strong>Android</strong> or <strong>iPhone</strong> steps above.</li>'
    };
    $('installSteps').innerHTML = instructions[platform] || instructions.desktop;
    $('installTip').textContent = platform === 'ios'
      ? 'iPhone installation is completed from Safari’s Share menu. The page cannot open Apple’s installation menu for you. After adding the icon, open the app once online to prepare its offline copy.'
      : 'Use the live HTTPS website in a normal browser tab. A link opened inside WhatsApp or Instagram may need “Open in browser” first. If Chrome does not offer installation yet, reload once and use its menu.';
  }

  function showInstallationGuide() {
    platformInstructions(isIOS ? 'ios' : isAndroid ? 'android' : 'desktop');
    if (!$('installDialog').open) $('installDialog').showModal();
  }

  async function requestInstallation() {
    if (installInProgress || launchedStandalone() || installedHere) return;
    if (!installPrompt) { showInstallationGuide(); return; }
    const prompt = installPrompt;
    installPrompt = null;
    installInProgress = true;
    updateInstallationUI();
    try {
      await prompt.prompt();
      await prompt.userChoice;
      // Acceptance starts installation; appinstalled or standalone launch confirms it.
    } catch {
      showInstallationGuide();
    } finally {
      installInProgress = false;
      updateInstallationUI();
    }
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    updateInstallationUI();
  });
  window.addEventListener('appinstalled', () => {
    installedHere = true;
    installPrompt = null;
    if ($('installDialog').open) $('installDialog').close();
    updateInstallationUI();
  });
  standaloneQuery.addEventListener?.('change', updateInstallationUI);
  document.querySelectorAll('[data-install]').forEach(button => button.addEventListener('click', requestInstallation));
  document.querySelectorAll('[data-install-help]').forEach(button => button.addEventListener('click', showInstallationGuide));
  document.querySelectorAll('[data-install-platform]').forEach(button => button.addEventListener('click', () => platformInstructions(button.dataset.installPlatform)));
  $('closeInstall').addEventListener('click', () => $('installDialog').close());
  $('installDialog').addEventListener('click', event => {
    if (event.target !== $('installDialog')) return;
    const bounds = $('installDialog').getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) $('installDialog').close();
  });

  function selectNavigation() {
    const selected = lastNav === 'budget' ? 'budget' : savedView ? 'saved' : 'cars';
    document.querySelectorAll('[data-app-nav]').forEach(button => {
      const active = button.dataset.appNav === selected;
      button.classList.toggle('selected', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  }
  $('mobileCars').addEventListener('click', () => {
    savedView = false;
    lastNav = 'cars';
    document.dispatchEvent(new CustomEvent('pakautohub:show-all'));
    selectNavigation();
  });
  $('mobileBudget').addEventListener('click', () => { lastNav = 'budget'; selectNavigation(); });
  $('mobileSaved').addEventListener('click', () => { lastNav = 'cars'; $('savedNav').click(); });
  $('mobileCompare').addEventListener('click', () => $('navCompare').click());
  window.addEventListener('hashchange', () => {
    if (location.hash === '#budgetPlanner') lastNav = 'budget';
    if (location.hash === '#catalogue') lastNav = 'cars';
    selectNavigation();
  });
  document.addEventListener('pakautohub:state', event => {
    const state = event.detail;
    $('mobileSavedCount').textContent = state.savedCount;
    $('mobileSavedCount').hidden = state.savedCount === 0;
    $('mobileCompareCount').textContent = state.compareCount;
    $('mobileCompareCount').hidden = state.compareCount === 0;
    const wasSavedView = savedView;
    savedView = state.savedOnly;
    if (savedView && !wasSavedView) lastNav = 'cars';
    selectNavigation();
  });

  // Keep user-entered planning allowances on this device between app launches.
  const planningFields = ['totalBudget', 'priority', 'fees', 'reserve'];
  try {
    const plan = JSON.parse(localStorage.getItem('pakautohub-plan-v1') || 'null');
    if (plan && typeof plan === 'object' && !Array.isArray(plan)) {
      planningFields.forEach(id => {
        const element = $(id);
        const value = plan[id];
        if (typeof value !== 'string') return;
        if (id === 'priority') {
          if (Array.from(element.options).some(option => option.value === value)) element.value = value;
        } else {
          const previous = element.value;
          element.value = value;
          if (!element.value || !element.checkValidity()) element.value = previous;
        }
      });
    }
  } catch { /* Browser storage may be disabled. Session use still works. */ }
  planningFields.forEach(id => $(id).addEventListener('change', () => {
    if (!planningFields.every(field => $(field).checkValidity())) return;
    try {
      localStorage.setItem('pakautohub-plan-v1', JSON.stringify(Object.fromEntries(planningFields.map(field => [field, $(field).value]))));
    } catch { /* Do not block the calculator when storage is unavailable. */ }
  }));

  function requestOfflineStatus(worker) {
    if (!worker || typeof MessageChannel === 'undefined') return;
    const channel = new MessageChannel();
    const timeout = setTimeout(() => channel.port1.close(), 5000);
    channel.port1.onmessage = event => {
      clearTimeout(timeout);
      channel.port1.close();
      offlineReady = event.data?.ready === true;
      updateConnectionUI();
    };
    worker.postMessage({ type: 'GET_OFFLINE_STATUS' }, [channel.port2]);
  }

  function showUpdate() { $('updateBanner').hidden = false; }
  $('applyUpdate').addEventListener('click', () => {
    if (!registration?.waiting) { location.reload(); return; }
    refreshingForUpdate = true;
    $('applyUpdate').disabled = true;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  });

  async function setupOffline() {
    if (!('serviceWorker' in navigator) || !window.isSecureContext) {
      $('offlineDescription').textContent = 'Offline setup needs a supported browser and the live HTTPS website (or localhost for development).';
      return;
    }
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data?.type === 'OFFLINE_READY') { offlineReady = true; updateConnectionUI(); }
    });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshingForUpdate) { location.reload(); return; }
      requestOfflineStatus(navigator.serviceWorker.controller);
    });
    try {
      registration = await navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' });
      if (registration.waiting) showUpdate();
      registration.addEventListener('updatefound', () => {
        const incoming = registration.installing;
        incoming?.addEventListener('statechange', () => {
          if (incoming.state === 'installed' && navigator.serviceWorker.controller) showUpdate();
        });
      });
      navigator.serviceWorker.ready.then(ready => requestOfflineStatus(ready.active));
    } catch {
      $('offlineDescription').textContent = 'Offline setup did not complete. You can still use the catalogue online; reopen this page with internet to try again.';
    }
  }
  window.addEventListener('offline', updateConnectionUI);
  window.addEventListener('online', () => {
    updateConnectionUI();
    registration?.update().catch(() => {});
  });
  updateInstallationUI();
  updateConnectionUI();
  selectNavigation();
  setupOffline();
})();
