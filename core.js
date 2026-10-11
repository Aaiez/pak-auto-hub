(function (root) {
  'use strict';

  const minPrice = c => Math.min(...c.variants.map(v => v.price));
  const maxPrice = c => Math.max(...c.variants.map(v => v.price_max ?? v.price));
  const num = (x, f = 0) => Number.isFinite(Number(x)) && Number(x) >= 0 ? Number(x) : f;
  const midpoint = v => (v.price + (v.price_max ?? v.price)) / 2;
  function upfront(c, price, fees, reserve) {
    return num(price) + num(fees) + (c.condition === 'used' ? num(reserve) : 0);
  }
  function budgetStatus(c, budget, fees, reserve) {
    const low = upfront(c, minPrice(c), fees, reserve),
      high = upfront(c, maxPrice(c), fees, reserve);
    return {
      low,
      high,
      fit: high <= budget ? 'within' : low <= budget ? 'partial' : 'over'
    };
  }
  function fuelCost(km, price, economy) {
    return Number(economy) > 0 && Number.isFinite(Number(economy)) ? num(km) * num(price) / Number(economy) : null;
  }
  function matches(c, f) {
    return (!f.q || (c.brand + ' ' + c.name + ' ' + c.year).toLowerCase().includes(f.q.toLowerCase())) && (!f.brand || c.brand === f.brand) && (!f.body || c.body === f.body) && (!f.condition || c.condition === f.condition) && (!f.year || c.year === Number(f.year)) && (!f.budget || minPrice(c) <= f.budget) && (!f.savedOnly || f.saved.includes(c.slug));
  }
  function shortlist(cars, p) {
    return cars.map(c => ({
      c,
      ...budgetStatus(c, p.budget, p.fees, p.reserve)
    })).filter(x => x.fit !== 'over').sort((a, b) => {
      const score = x => {
        let s = x.fit === 'within' ? 4 : 0;
        if (p.priority === 'new' && x.c.condition === 'new') s += 10;
        if (p.priority === 'family' && x.c.body === 'Sedan') s += 10;
        if (p.priority === 'city' && x.c.body === 'Hatchback') s += 10;
        return s;
      };
      return score(b) - score(a) || a.low - b.low;
    }).slice(0, 3);
  }
  const api = {
    minPrice,
    maxPrice,
    num,
    midpoint,
    upfront,
    budgetStatus,
    fuelCost,
    matches,
    shortlist
  };
  if (typeof module !== 'undefined') module.exports = api;else root.CarMath = api;
})(typeof window !== 'undefined' ? window : globalThis);
