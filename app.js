'use strict';

const $ = s => document.querySelector(s),
  M = CarMath;
let cars = [],
  body = '',
  brand = '',
  savedOnly = false,
  compare = [],
  variants = {},
  overrides = {},
  economies = {},
  maintenance = {},
  saved = [];
let monthlyKm = 1000,
  fuelPrice = 300;
try {
  saved = JSON.parse(localStorage.getItem('pakautohub-saved') || '[]');
  if (!Array.isArray(saved)) saved = [];
} catch {}
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[c]);
const money = n => new Intl.NumberFormat('en-PK', {
  maximumFractionDigits: 0
}).format(n);
const lakh = n => (n / 100000).toFixed(2);
const car = s => cars.find(c => c.slug === s);
const link = u => /^https:\/\//.test(u) ? esc(u) : '#';
const vFor = c => c.variants[variants[c.slug] || 0];
const keyFor = c => c.slug + ':' + (variants[c.slug] || 0);
const priceFor = c => overrides[keyFor(c)] ?? M.midpoint(vFor(c));
const label = c => `${c.brand} ${c.name} ${c.condition === 'used' ? c.year : '· New'}`;
const range = (lo, hi) => lakh(lo) + (hi > lo ? '–' + lakh(hi) : '') + ' lakh';
let toastTimer;
function toast(t) {
  $('#toast').textContent = t;
  $('#toast').style.opacity = 1;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').style.opacity = 0, 3000);
}
function plan() {
  return {
    budget: M.num($('#totalBudget').value, 30) * 100000,
    fees: M.num($('#fees').value, .5) * 100000,
    reserve: M.num($('#reserve').value, 2) * 100000,
    priority: $('#priority').value
  };
}
function imageHtml(c, cls = '') {
  return `<div class="${cls}"><img src="${esc(c.image)}" alt="${esc(label(c))} — representative model photo" loading="lazy"><div class="image-fallback"><strong>${esc(c.name)}</strong><small>${c.year} · Photo unavailable</small></div></div>`;
}
function photoErrors() {
  document.querySelectorAll('img').forEach(img => {
    img.onerror = () => {
      img.parentElement.classList.add('missing-image');
      img.alt = 'Photo unavailable';
    };
    if (img.complete && !img.naturalWidth) img.onerror();
  });
}
function sourceHtml(c) {
  return `<div class="sources-list">${c.sources.map(s => `<a href="${link(s.url)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a>`).join('<br>')}</div>`;
}
function renderBrands() {
  const names = ['', 'Toyota', 'Honda', 'Suzuki', 'Hyundai'];
  $('#brandTabs').innerHTML = names.map(n => `<button role="tab" aria-selected="${brand === n}" class="brand-tab" data-brand="${n}">${n || 'All companies'}<span>${cars.filter(c => !n || c.brand === n).length} cars</span></button>`).join('');
}
function render() {
  const f = {
    q: $('#search').value.trim(),
    brand,
    body,
    condition: $('#condition').value,
    year: $('#year').value,
    budget: M.num($('#budget').value) * 100000,
    savedOnly,
    saved
  };
  let list = cars.filter(c => M.matches(c, f));
  const sort = $('#sort').value;
  if (sort === 'low') list.sort((a, b) => M.minPrice(a) - M.minPrice(b));
  if (sort === 'high') list.sort((a, b) => M.minPrice(b) - M.minPrice(a));
  if (sort === 'name') list.sort((a, b) => label(a).localeCompare(label(b)));
  $('#resultCount').textContent = `${list.length} entries`;
  $('#savedNotice').hidden = !savedOnly;
  $('#savedCount').textContent = saved.length;
  $('#compareCount').textContent = compare.length;
  renderBrands();
  $('#cars').innerHTML = list.length ? list.map(c => `<article class="car ${c.condition}"><div class="car-photo"><span class="tag">${esc(c.body)}</span><button class="heart ${saved.includes(c.slug) ? 'on' : ''}" data-save="${c.slug}" aria-label="${saved.includes(c.slug) ? 'Unsave' : 'Save'} ${esc(label(c))}" aria-pressed="${saved.includes(c.slug)}">${saved.includes(c.slug) ? '♥' : '♡'}</button><img src="${esc(c.image)}" alt="${esc(label(c))}" loading="lazy"><div class="image-fallback"><strong>${esc(c.name)}</strong><small>${c.year} · Photo unavailable</small></div></div><div class="car-info"><span class="condition-pill ${c.condition}">${c.condition === 'used' ? 'Used · ' + c.year : 'New car'}</span><div class="car-brand">${esc(c.brand)}</div><div class="car-title"><h3>${esc(c.name)}<small>${c.condition === 'used' ? c.year + ' model' : c.year + ' catalogue'}</small></h3><span>${c.variants.length > 1 ? c.variants.length + ' variants' : ''}</span></div><div class="spec-mini"><span>◈ ${esc(c.variants[0].engine.split(' ·')[0])}</span><span>◇ ${esc(c.variants[0].fuel)}</span></div><div class="car-price"><small>${c.condition === 'used' ? 'OBSERVED ASKING PRICES' : 'STARTING FROM'}</small><strong>${c.condition === 'used' ? range(M.minPrice(c), M.maxPrice(c)) : '<span>PKR</span> ' + money(M.minPrice(c))}</strong><div class="range">${c.condition === 'used' ? 'PKR · not a guaranteed valuation' : range(M.minPrice(c), M.maxPrice(c))}</div></div><div class="market-note">${esc(c.market)}<br>Price checked ${esc(c.variants[0].checked)}</div><div class="card-actions"><button class="details" data-detail="${c.slug}">View details <span>↗</span></button><label class="compare-check"><input type="checkbox" data-compare="${c.slug}" ${compare.includes(c.slug) ? 'checked' : ''}>Compare</label></div></div></article>`).join('') : `<div class="empty"><h3>${savedOnly ? 'No saved cars match.' : 'No cars match these filters.'}</h3><p>Try another company, model year or budget.</p><button id="resetFilters">Reset all filters ↗</button></div>`;
  $('#compareTray').hidden = !compare.length;
  $('#trayText').textContent = `${compare.length} / 3 cars selected`;
  photoErrors();
}
function reset() {
  body = '';
  brand = '';
  savedOnly = false;
  ['search', 'condition', 'budget', 'year'].forEach(id => $('#' + id).value = '');
  $('#sort').value = 'featured';
  document.querySelectorAll('[data-body]').forEach(b => b.classList.toggle('selected', !b.dataset.body));
  render();
}
function show(html) {
  $('#modalContent').innerHTML = html;
  if (!$('#modal').open) $('#modal').showModal();
  photoErrors();
}
function detail(slug) {
  const c = car(slug);
  if (!c) return;
  const v = vFor(c);
  show(`<div class="detail-hero"><div>${imageHtml(c, 'detail-photo')}<p class="source-note">${esc(c.image_caption)} <a href="${link(c.image_source)}" target="_blank" rel="noopener">Photo source ↗</a></p></div><div><span class="condition-pill ${c.condition}">${c.condition} · ${c.year}</span><div class="eyebrow">${esc(c.brand)} / ${esc(c.body)}</div><h2>${esc(c.brand + ' ' + c.name)}</h2><p>${esc(c.description)}</p><label for="detailVariant">${c.condition === 'used' ? 'Price sample / trim scope' : 'Choose a variant'}</label><select id="detailVariant" class="variant-select" data-variant="${slug}">${c.variants.map((x, i) => `<option value="${i}" ${x === v ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select><div class="detail-price">${c.condition === 'used' ? range(v.price, v.price_max ?? v.price) : 'PKR ' + money(v.price)}</div><p class="source-note">${esc(c.price_basis)}<br>${esc(c.market)} · checked ${esc(v.checked)}<br>${c.condition === 'used' ? 'Sample listings may no longer be available. Inspect and negotiate the individual car.' : 'Base price excludes additional on-road costs. Confirm a current dealer quotation.'}</p>${sourceHtml(c)}<button class="primary" data-addcompare="${c.slug}">Add to comparison ↗</button></div></div><div class="advice-grid"><div><h3>Why consider it?</h3><p>${esc(c.advice.strength)}</p></div><div><h3>Before you decide</h3><p>${esc(c.advice.check)}</p></div></div><h3>Recorded specifications</h3><p class="source-note">Used-car equipment is not independently inspected. Unrecorded features remain unknown.</p><table class="spec-table"><tbody>${Object.entries({
    'Model year': c.year,
    'Condition': c.condition,
    'Engine': v.engine,
    'Transmission': v.transmission,
    'Fuel': v.fuel,
    ...c.specs,
    ...v.specs
  }).map(([k, val]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(val)}</td></tr>`).join('')}</tbody></table>`);
}
function budgetResults() {
  const p = plan();
  if (p.budget <= 0) {
    $('#budgetResults').innerHTML = '<p>Please enter a budget above zero.</p>';
    return;
  }
  const list = M.shortlist(cars, p),
    newCars = cars.filter(c => c.condition === 'new'),
    nearestNew = newCars.sort((a, b) => M.minPrice(a) - M.minPrice(b))[0];
  const nStatus = M.budgetStatus(nearestNew, p.budget, p.fees, p.reserve);
  const priorities = {
    family: 'Sedans are prioritised for your family-space preference; this is a body-style preference, not a measured comfort rating.',
    city: 'Hatchbacks are prioritised for your city-size preference; fuel use is not assumed.',
    new: 'New cars are prioritised when the stated budget plus allowances permits.',
    budget: 'Options are sorted by their lowest estimated upfront outlay.'
  };
  $('#budgetResults').innerHTML = `<div class="budget-summary"><strong>${lakh(p.budget)} lakh total budget</strong><br>${priorities[p.priority]}<br>${nStatus.fit === 'over' ? `Lowest new-car entry needs ${lakh(nStatus.low)} lakh including your transaction allowance (${esc(nearestNew.name)}). No new entry fits this total budget with the current allowance.` : 'New and used entries are assessed using the same transaction allowance.'}</div><div class="recommendations">${list.map(x => `<div class="recommendation"><div><h3>${esc(label(x.c))}</h3><p>Purchase ${range(M.minPrice(x.c), M.maxPrice(x.c))} · With allowances ${range(x.low, x.high)}</p><p>${x.fit === 'partial' ? 'Only lower-priced examples may fit; the upper range exceeds your budget.' : 'Full observed range fits your planning budget.'}</p></div><button data-addcompare="${x.c.slug}">Compare +</button></div>`).join('') || '<p>No entries fit. Increase the budget or revise your allowances; do not remove a reserve without considering repair risk.</p>'}</div><p class="input-help">Shortlist uses body style, condition and price only. It does not rate mechanical condition, crash safety, resale or reliability. Source locations differ; this is not a Faisalabad valuation.</p>`;
}
function decision(cs) {
  const p = plan();
  const fits = cs.filter(c => M.upfront(c, priceFor(c), p.fees, p.reserve) <= p.budget);
  const ranked = [...fits].sort((a, b) => {
    const pref = c => p.priority === 'family' ? c.body === 'Sedan' : p.priority === 'city' ? c.body === 'Hatchback' : p.priority === 'new' ? c.condition === 'new' : false;
    return Number(pref(b)) - Number(pref(a)) || M.upfront(a, priceFor(a), p.fees, p.reserve) - M.upfront(b, priceFor(b), p.fees, p.reserve);
  });
  const best = ranked[0],
    priorityText = {
      family: 'your sedan / family-space preference',
      city: 'your hatchback / city-size preference',
      new: 'your preference for a new car',
      budget: 'the lowest upfront cost'
    };
  return `<div class="decision"><h3>${best ? esc(label(best)) + ' is worth shortlisting.' : 'None fits your total budget yet.'}</h3><p>${best ? `Among the selected cars, this is the closest match using ${priorityText[p.priority]} and your entered costs. Planned upfront total: <strong>${lakh(M.upfront(best, priceFor(best), p.fees, p.reserve))} lakh</strong>. ${esc(best.advice.strength)}` : 'The entered purchase prices plus allowances exceed your budget. Try a lower quoted price, a different car, or a higher budget.'}</p><p>${best ? esc(best.advice.check) : ''} This is a transparent planning suggestion, not an inspection or a reliability score. Compare the actual car’s condition and safety equipment before buying.</p></div>`;
}
function comparison() {
  if (compare.length < 2) {
    toast('Select at least two cars to compare.');
    return;
  }
  const cs = compare.map(car),
    vs = cs.map(vFor),
    p = plan(),
    keys = [...new Set(cs.flatMap((c, i) => Object.keys({
      ...c.specs,
      ...vs[i].specs
    })))];
  const row = (name, fn) => `<tr><th scope="row">${name}</th>${cs.map((c, i) => `<td>${fn(c, i)}</td>`).join('')}</tr>`;
  show(`<h2>New or used. Make the comparison yours.</h2><p class="source-note">Your budget: <strong>${lakh(p.budget)} lakh</strong> · Priority: ${esc($('#priority').selectedOptions[0].textContent)}. Change these in the budget finder. Used prices start at the midpoint of the observed range; replace them with actual seller quotes.</p><div class="compare-setup"><label>Distance / month (km)<input id="monthlyKm" type="number" min="0" max="100000" step="100" value="${monthlyKm}"></label><label>Petrol price (PKR/litre)<input id="fuelPrice" type="number" min="0" max="2000" step="1" value="${fuelPrice}"></label></div><p class="input-help">Fuel price is a scenario input, not today’s pump price. Enter a realistic km/l figure for each actual car to calculate fuel cost.</p><div id="decision">${decision(cs)}</div><div class="compare-scroll"><table class="spec-table compare-table"><thead><tr><th scope="col">Your shortlist</th>${cs.map((c, i) => `<td>${imageHtml(c, 'compare-photo')}<h3>${esc(label(c))}</h3><span class="condition-pill ${c.condition}">${c.condition}</span><select aria-label="${esc(label(c))} variant" class="variant-select" data-compare-variant="${c.slug}">${c.variants.map((v, j) => `<option value="${j}" ${v === vs[i] ? 'selected' : ''}>${esc(v.name)}</option>`).join('')}</select></td>`).join('')}</tr></thead><tbody>${row('Source price', (c, i) => `<strong>${range(vs[i].price, vs[i].price_max ?? vs[i].price)}</strong><small>${esc(c.price_basis)}<br>${esc(c.market)}<br>Checked ${esc(vs[i].checked)}</small><a class="source-note" href="${link(vs[i].source)}" target="_blank" rel="noopener">View price evidence ↗</a>`)}${row('Your purchase price (lakh)', c => `<input aria-label="${esc(label(c))} purchase price in lakh" type="number" min="0.01" max="1000" step="0.00001" data-price="${c.slug}" value="${priceFor(c) / 100000}"><small>Editable quote / planning amount</small>`)}${row('Transaction allowance', () => `${lakh(p.fees)} lakh<small>Your input; not an official tax calculation</small>`)}${row('Initial repair reserve', c => `${c.condition === 'used' ? lakh(p.reserve) : '0.00'} lakh<small>${c.condition === 'used' ? 'Your used-car reserve assumption' : 'No repair reserve included; warranty is not a guarantee of zero costs'}</small>`)}${row('Estimated upfront total', c => `<span class="price-number" id="upfront-${c.slug}">${lakh(M.upfront(c, priceFor(c), p.fees, p.reserve))} lakh</span>`)}${row('Budget remaining', c => `<span id="remaining-${c.slug}"></span>`)}${row('Your fuel estimate (km/l)', c => `<input aria-label="${esc(label(c))} fuel economy" type="number" min="1" max="60" step="0.5" placeholder="Enter measured km/l" data-economy="${c.slug}" value="${economies[keyFor(c)] ?? ''}"><small>Your assumption; no model-wide claim</small>`)}${row('Fuel cost / month', c => `<span id="fuel-${c.slug}"></span>`)}${row('Routine upkeep / year (PKR)', c => `<input aria-label="${esc(label(c))} annual upkeep" type="number" min="0" max="10000000" step="1000" placeholder="Enter estimate" data-maintenance="${c.slug}" value="${maintenance[keyFor(c)] ?? ''}"><small>Excludes the initial repair reserve above</small>`)}${row('First-year cash plan', c => `<strong id="yearcost-${c.slug}"></strong><small>Purchase + transaction + initial reserve + 12 months fuel + entered upkeep. Excludes insurance, financing, resale and depreciation.</small>`)}${row('Why consider it?', c => esc(c.advice.strength))}${row('Inspect / confirm', c => esc(c.advice.check))}${['Engine', 'Transmission', 'Fuel', ...keys].map(k => row(esc(k), (c, i) => esc({
    Engine: vs[i].engine,
    Transmission: vs[i].transmission,
    Fuel: vs[i].fuel,
    ...c.specs,
    ...vs[i].specs
  }[k] || 'Not recorded'))).join('')}</tbody></table></div><p class="source-note">Photos are representative model images, not a guarantee of the selected trim or condition. Source links may show sold or changed advertisements.</p>`);
  updateCosts();
}
function updateCosts() {
  if (!$('#decision')) return;
  const cs = compare.map(car),
    p = plan();
  for (const c of cs) {
    const total = M.upfront(c, priceFor(c), p.fees, p.reserve),
      left = p.budget - total,
      e = economies[keyFor(c)],
      fuel = M.fuelCost(monthlyKm, fuelPrice, e),
      upkeep = maintenance[keyFor(c)];
    $('#upfront-' + c.slug).textContent = lakh(total) + ' lakh';
    $('#remaining-' + c.slug).innerHTML = `<strong class="${left >= 0 ? 'good' : 'over'}">${left >= 0 ? lakh(left) + ' lakh left' : lakh(-left) + ' lakh over'}</strong>`;
    $('#fuel-' + c.slug).textContent = fuel === null ? 'Enter km/l to calculate' : 'PKR ' + money(fuel);
    $('#yearcost-' + c.slug).textContent = fuel === null || upkeep === undefined ? 'Enter km/l and annual upkeep' : 'PKR ' + money(total + fuel * 12 + upkeep);
  }
  $('#decision').innerHTML = decision(cs);
}
function addCompare(slug) {
  if (!compare.includes(slug)) {
    if (compare.length === 3) {
      toast('You can compare up to three cars. Remove one first.');
      return;
    }
    compare.push(slug);
  }
  render();
  toast(`${car(slug).name} added. ${compare.length}/3 selected.`);
}
document.addEventListener('click', e => {
  const d = e.target.closest('[data-detail]');
  if (d) detail(d.dataset.detail);
  const a = e.target.closest('[data-addcompare]');
  if (a) addCompare(a.dataset.addcompare);
  const s = e.target.closest('[data-save]');
  if (s) {
    const slug = s.dataset.save;
    saved = saved.includes(slug) ? saved.filter(x => x !== slug) : [...saved, slug];
    try {
      localStorage.setItem('pakautohub-saved', JSON.stringify(saved));
    } catch {
      toast('Saved for this session; browser storage is unavailable.');
    }
    render();
  }
  const b = e.target.closest('[data-body]');
  if (b) {
    body = b.dataset.body;
    document.querySelectorAll('[data-body]').forEach(x => x.classList.toggle('selected', x === b));
    render();
  }
  const brandButton = e.target.closest('[data-brand]');
  if (brandButton) {
    brand = brandButton.dataset.brand;
    render();
  }
  if (e.target.id === 'resetFilters') reset();
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.compare) {
    const slug = t.dataset.compare;
    if (t.checked) {
      if (compare.length === 3) {
        t.checked = false;
        toast('You can compare up to three cars.');
        return;
      }
      compare.push(slug);
    } else compare = compare.filter(x => x !== slug);
    render();
  }
  if (t.dataset.variant) {
    variants[t.dataset.variant] = Number(t.value);
    detail(t.dataset.variant);
  }
  if (t.dataset.compareVariant) {
    variants[t.dataset.compareVariant] = Number(t.value);
    comparison();
  }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.price || t.dataset.economy || t.dataset.maintenance) {
    if (!t.checkValidity() || t.dataset.price && t.value === '') {
      t.classList.add('invalid');
      return;
    }
    t.classList.remove('invalid');
    if (t.dataset.price) overrides[keyFor(car(t.dataset.price))] = Number(t.value) * 100000;
    if (t.dataset.economy) {
      const k = keyFor(car(t.dataset.economy));
      if (t.value === '') delete economies[k];else economies[k] = Number(t.value);
    }
    if (t.dataset.maintenance) {
      const k = keyFor(car(t.dataset.maintenance));
      if (t.value === '') delete maintenance[k];else maintenance[k] = Number(t.value);
    }
    updateCosts();
  }
  if (t.id === 'monthlyKm' || t.id === 'fuelPrice') {
    if (!t.checkValidity() || t.value === '') return;
    if (t.id === 'monthlyKm') monthlyKm = Number(t.value);else fuelPrice = Number(t.value);
    updateCosts();
  }
});
$('#search').addEventListener('input', render);
$('#budget').addEventListener('input', render);
['condition', 'year', 'sort'].forEach(id => $('#' + id).addEventListener('change', render));
$('#closeModal').onclick = () => $('#modal').close();
$('#modal').addEventListener('click', e => {
  if (e.target === $('#modal')) {
    const r = $('#modal').getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) $('#modal').close();
  }
});
$('#savedNav').onclick = () => {
  savedOnly = !savedOnly;
  render();
  $('#catalogue').scrollIntoView();
};
$('#showAll').onclick = reset;
$('#navCompare').onclick = comparison;
$('#openCompare').onclick = comparison;
$('#clearCompare').onclick = () => {
  compare = [];
  render();
};
$('#findBudget').onclick = () => {
  if (['totalBudget', 'fees', 'reserve'].some(id => !$('#' + id).reportValidity())) return;
  budgetResults();
};
['totalBudget', 'fees', 'reserve', 'priority'].forEach(id => $('#' + id).addEventListener('change', () => {
  if (['totalBudget', 'fees', 'reserve'].every(x => $('#' + x).checkValidity())) budgetResults();
}));
$('#example30').onclick = () => {
  $('#totalBudget').value = 30;
  $('#fees').value = .5;
  $('#reserve').value = 2;
  $('#priority').value = 'family';
  compare = ['suzuki-alto', 'honda-city-2013', 'toyota-corolla-2010'];
  budgetResults();
  render();
  comparison();
};
$('#aboutBtn').onclick = () => show(`<div class="about"><div class="eyebrow">A UNIVERSITY PROJECT BY AAIEZ</div><h2>New cars. Older favourites. One budget.</h2><p>Browse ${cars.length} model-year entries across Toyota, Honda, Suzuki and Hyundai. Company tabs, condition and year filters help you compare the right generation.</p><h3>Where the prices come from</h3><p>Used prices were researched on 10 October 2026 from the linked asking-price examples and listing groups. Each entry states its city and sample scope. They are not completed-sale values, guaranteed valuations or live inventory. New Suzuki and Toyota prices were checked against manufacturer pages; new Honda entries retain the supplied 5 October 2026 snapshot.</p><h3>How the suggestion works</h3><p>The budget finder considers your chosen body-style / new-car preference and upfront cost. It does not invent a reliability or safety score. Lower-priced used examples may fit even when the upper range does not. Comparison prices default to a range midpoint until you enter an actual quote.</p><h3>Your planning inputs</h3><p>The 0.5-lakh transaction allowance, 2-lakh used repair reserve, 1,000 km/month and PKR 300/litre are editable scenario assumptions. They are not official tax calculations, repair quotes or a live petrol price. Fuel costs only calculate once you supply a km/l figure; yearly cash plans also require your upkeep estimate.</p><h3>Photos and privacy</h3><p>Original manufacturer images and third-party model-year photos are representative; trim and condition may differ. Some external photos may be unavailable. Saved cars stay in this browser, with no account or cross-device sync.</p><a href="catalogue.json" download="pakautohub-catalogue.json">Download catalogue and source links ↗</a></div>`);
fetch('catalogue.json').then(r => {
  if (!r.ok) throw Error('Catalogue unavailable');
  return r.json();
}).then(d => {
  cars = d.cars;
  saved = saved.filter(s => car(s));
  $('#year').innerHTML = '<option value="">All years</option>' + [...new Set(cars.map(c => c.year))].sort((a, b) => b - a).map(y => `<option>${y}</option>`).join('');
  render();
  budgetResults();
}).catch(() => {
  $('#cars').innerHTML = '<div class="empty"><h3>The catalogue could not load.</h3><p>Please refresh to try again.</p></div>';
});
