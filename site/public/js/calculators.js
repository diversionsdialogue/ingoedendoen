/**
 * InGoedendoen calculators — herbouw van de WordPress-shortcode-calculators.
 * Elke <div class="igd-calculator" data-calc="..."> wordt gehydrateerd.
 */
(function () {
  'use strict';

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  const ZONES = [
    ['Zone 1', '50-60%', 'Zeer licht — herstel', 0.5, 0.6],
    ['Zone 2', '60-70%', 'Licht — vetverbranding', 0.6, 0.7],
    ['Zone 3', '70-80%', 'Matig — conditie', 0.7, 0.8],
    ['Zone 4', '80-90%', 'Zwaar — prestatie', 0.8, 0.9],
    ['Zone 5', '90-100%', 'Maximaal — sprint', 0.9, 1.0],
  ];

  function zoneTable(rows) {
    return (
      '<table><thead><tr><th>Zone</th><th>Intensiteit</th><th>Hartslag (spm)</th></tr></thead><tbody>' +
      rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]} (${r[2]})</td><td>${r[3]}</td></tr>`).join('') +
      '</tbody></table>'
    );
  }

  function maxHrByFormula(formula, age, custom) {
    if (formula === 'tanaka') return Math.round(208 - 0.7 * age);
    if (formula === 'custom') return custom;
    return 220 - age;
  }

  const builders = {
    // Karvonen-methode: zones op basis van hartslagreserve
    hartslag_reservecapaciteit_calculator(root) {
      root.append(el(`<div>
        <h3>Bereken je hartslagzones (Karvonen-methode)</h3>
        <div class="calc-field"><label>Leeftijd (jaren)</label><input type="number" min="10" max="100" data-f="age"></div>
        <div class="calc-field"><label>Rusthartslag (slagen per minuut)</label><input type="number" min="30" max="120" data-f="rest"></div>
        <div class="calc-field"><label>Formule voor maximale hartslag</label>
          <select data-f="formula">
            <option value="klassiek">Klassiek (220 − leeftijd)</option>
            <option value="tanaka">Tanaka (208 − 0,7 × leeftijd)</option>
            <option value="custom">Eigen maximale hartslag</option>
          </select></div>
        <div class="calc-field" data-f="customwrap" style="display:none;"><label>Eigen maximale hartslag (spm)</label><input type="number" min="100" max="230" data-f="custom"></div>
        <button class="calc-btn">Bereken hartslagzones</button>
        <div class="calc-error" hidden></div>
        <div class="calc-result" hidden></div>
      </div>`));
      const $ = (s) => root.querySelector(`[data-f="${s}"]`);
      $('formula').addEventListener('change', () => { $('customwrap').style.display = $('formula').value === 'custom' ? '' : 'none'; });
      root.querySelector('.calc-btn').addEventListener('click', () => {
        const age = +$('age').value, rest = +$('rest').value;
        const err = root.querySelector('.calc-error'), res = root.querySelector('.calc-result');
        err.hidden = res.hidden = true;
        if (!age || age < 10 || age > 100 || !rest || rest < 30 || rest > 120) { err.textContent = 'Vul een geldige leeftijd (10-100) en rusthartslag (30-120) in.'; err.hidden = false; return; }
        const max = maxHrByFormula($('formula').value, age, +$('custom').value);
        if (!max || max < 100 || max > 230) { err.textContent = 'Vul een geldige maximale hartslag in (100-230).'; err.hidden = false; return; }
        const hrr = max - rest;
        const rows = ZONES.map((z) => [z[0], z[1], z[2], `${Math.round(hrr * z[3] + rest)} – ${Math.round(hrr * z[4] + rest)}`]);
        res.innerHTML = `<h4>Jouw hartslagzones (Karvonen-methode)</h4>
          <p><strong>Berekende maximale hartslag:</strong> ${max} spm<br><strong>Hartslagreserve:</strong> ${hrr} spm</p>` + zoneTable(rows);
        res.hidden = false;
      });
    },

    // Zones als percentage van de maximale hartslag
    hartslagzones_calculator(root) {
      root.append(el(`<div>
        <h3>Bereken je hartslagzones</h3>
        <div class="calc-field"><label>Leeftijd (jaren)</label><input type="number" min="10" max="100" data-f="age"></div>
        <button class="calc-btn">Bereken zones</button>
        <div class="calc-error" hidden></div>
        <div class="calc-result" hidden></div>
      </div>`));
      root.querySelector('.calc-btn').addEventListener('click', () => {
        const age = +root.querySelector('[data-f="age"]').value;
        const err = root.querySelector('.calc-error'), res = root.querySelector('.calc-result');
        err.hidden = res.hidden = true;
        if (!age || age < 10 || age > 100) { err.textContent = 'Vul een geldige leeftijd in (10-100).'; err.hidden = false; return; }
        const max = 220 - age;
        const rows = ZONES.map((z) => [z[0], z[1], z[2], `${Math.round(max * z[3])} – ${Math.round(max * z[4])}`]);
        res.innerHTML = `<h4>Jouw hartslagzones</h4><p><strong>Geschatte maximale hartslag:</strong> ${max} spm (220 − leeftijd)</p>` + zoneTable(rows);
        res.hidden = false;
      });
    },

    // Maximale hartslag via twee formules
    max_hartslag_calculator(root) {
      root.append(el(`<div>
        <h3>Bereken je maximale hartslag</h3>
        <div class="calc-field"><label>Leeftijd (jaren)</label><input type="number" min="10" max="100" data-f="age"></div>
        <button class="calc-btn">Bereken</button>
        <div class="calc-error" hidden></div>
        <div class="calc-result" hidden></div>
      </div>`));
      root.querySelector('.calc-btn').addEventListener('click', () => {
        const age = +root.querySelector('[data-f="age"]').value;
        const err = root.querySelector('.calc-error'), res = root.querySelector('.calc-result');
        err.hidden = res.hidden = true;
        if (!age || age < 10 || age > 100) { err.textContent = 'Vul een geldige leeftijd in (10-100).'; err.hidden = false; return; }
        res.innerHTML = `<h4>Jouw geschatte maximale hartslag</h4>
          <table><tbody>
            <tr><td>Klassieke formule (220 − leeftijd)</td><td><strong>${220 - age} spm</strong></td></tr>
            <tr><td>Tanaka-formule (208 − 0,7 × leeftijd)</td><td><strong>${Math.round(208 - 0.7 * age)} spm</strong></td></tr>
          </tbody></table>
          <p style="margin-top:12px; color:var(--color-text-secondary); font-size:0.8125rem;">Beide formules zijn schattingen; je werkelijke maximale hartslag kan afwijken.</p>`;
        res.hidden = false;
      });
    },

    // Rusthartslag vergeleken met leeftijdsgemiddelden
    hartslag_leeftijd_calculator(root) {
      root.append(el(`<div>
        <h3>Vergelijk je hartslag met je leeftijd</h3>
        <div class="calc-field"><label>Leeftijd (jaren)</label><input type="number" min="10" max="100" data-f="age"></div>
        <div class="calc-field"><label>Rusthartslag (slagen per minuut)</label><input type="number" min="30" max="150" data-f="rest"></div>
        <button class="calc-btn">Vergelijk</button>
        <div class="calc-error" hidden></div>
        <div class="calc-result" hidden></div>
      </div>`));
      const $ = (s) => root.querySelector(`[data-f="${s}"]`);
      root.querySelector('.calc-btn').addEventListener('click', () => {
        const age = +$('age').value, rest = +$('rest').value;
        const err = root.querySelector('.calc-error'), res = root.querySelector('.calc-result');
        err.hidden = res.hidden = true;
        if (!age || !rest || age < 10 || age > 100 || rest < 30 || rest > 150) { err.textContent = 'Vul een geldige leeftijd en rusthartslag in.'; err.hidden = false; return; }
        let verdict;
        if (rest < 60) verdict = 'Je rusthartslag is laag — dat zien we vaak bij mensen met een goede conditie.';
        else if (rest <= 80) verdict = 'Je rusthartslag valt binnen het normale bereik voor volwassenen (60-80 spm).';
        else if (rest <= 100) verdict = 'Je rusthartslag is aan de hoge kant van normaal (60-100 spm). Meer bewegen kan hem verlagen.';
        else verdict = 'Je rusthartslag is hoger dan gemiddeld. Meet op een rustig moment opnieuw en bespreek aanhoudend hoge waarden met je huisarts.';
        res.innerHTML = `<h4>Jouw resultaat</h4><p>${verdict}</p>
          <p style="margin-top:10px; color:var(--color-text-secondary); font-size:0.8125rem;">Richtlijn volwassenen in rust: 60-100 spm; sporters zitten vaak tussen 40-60 spm.</p>`;
        res.hidden = false;
      });
    },

    // Algemene duiding van de rusthartslag
    hartslag_calculator(root) {
      builders.hartslag_leeftijd_calculator(root);
      const h3 = root.querySelector('h3');
      if (h3) h3.textContent = 'Wat vertelt je rusthartslag?';
    },

    // Tempo-omrekening voor hardlopers
    hardloop_tempo(root) {
      root.append(el(`<div>
        <h3>Hardlooptempo omrekenen</h3>
        <div class="calc-field"><label>Snelheid (km/u)</label><input type="number" min="4" max="25" step="0.1" data-f="speed"></div>
        <button class="calc-btn">Bereken tempo</button>
        <div class="calc-error" hidden></div>
        <div class="calc-result" hidden></div>
      </div>`));
      root.querySelector('.calc-btn').addEventListener('click', () => {
        const speed = +root.querySelector('[data-f="speed"]').value;
        const err = root.querySelector('.calc-error'), res = root.querySelector('.calc-result');
        err.hidden = res.hidden = true;
        if (!speed || speed < 4 || speed > 25) { err.textContent = 'Vul een snelheid tussen 4 en 25 km/u in.'; err.hidden = false; return; }
        const paceMin = 60 / speed;
        const mm = Math.floor(paceMin), ss = Math.round((paceMin - mm) * 60);
        const fmt = (km) => { const t = paceMin * km; const h = Math.floor(t / 60), m = Math.round(t % 60); return h ? `${h}u ${String(m).padStart(2, '0')}m` : `${m} min`; };
        res.innerHTML = `<h4>Jouw tempo</h4>
          <p><strong>${mm}:${String(ss).padStart(2, '0')} min/km</strong></p>
          <table><thead><tr><th>Afstand</th><th>Geschatte tijd</th></tr></thead><tbody>
            <tr><td>5 km</td><td>${fmt(5)}</td></tr>
            <tr><td>10 km</td><td>${fmt(10)}</td></tr>
            <tr><td>Halve marathon (21,1 km)</td><td>${fmt(21.0975)}</td></tr>
            <tr><td>Marathon (42,2 km)</td><td>${fmt(42.195)}</td></tr>
          </tbody></table>`;
        res.hidden = false;
      });
    },
  };

  document.querySelectorAll('.igd-calculator[data-calc]').forEach((root) => {
    const build = builders[root.dataset.calc];
    if (build) build(root);
  });
})();
