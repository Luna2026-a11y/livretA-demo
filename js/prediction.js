function computePrediction(inflHistory) {
    if (!inflHistory || inflHistory.length === 0) return null;

    // Moyenne des 6 derniers mois disponibles (référence semestrielle BdF)
    const last6    = inflHistory.slice(-6).filter(function (p) { return p.rate !== null; });
    const avgInfl  = last6.reduce(function (s, p) { return s + p.rate; }, 0) / last6.length;
    const estr     = ESTR_RATE.rate;

    // Formule officielle Banque de France
    const formula1 = 0.5 * (avgInfl + estr);      // ½ × (inflation + €STR)
    const formula2 = avgInfl - 0.25;               // inflation − 0,25 %
    const raw      = Math.max(formula1, formula2);
    const floored  = Math.max(0.5, raw);           // plancher légal 0,5 %

    // Arrondi au 0,25 % le plus proche
    const predicted = Math.round(floored * 4) / 4;

    return {
        predicted,
        avgInfl:  avgInfl.toFixed(2),
        estr:     estr.toFixed(2),
        formula1: formula1.toFixed(2),
        formula2: formula2.toFixed(2),
        raw:      floored.toFixed(2),
        period:   last6[0] ? last6[0].date.slice(0, 7) + ' → ' + last6[last6.length - 1].date.slice(0, 7) : '—'
    };
}

function startPredictionCountdown() {
    const target = new Date('2026-08-01T00:00:00');
    const el     = document.getElementById('pred-countdown');
    if (!el) return;

    function tick() {
        const diff = target - new Date();
        if (diff <= 0) { el.textContent = 'AUJOURD\'HUI'; return; }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000)  / 60000);
        el.textContent = d + 'J ' + String(h).padStart(2, '0') + 'H ' + String(m).padStart(2, '0') + 'M';
        setTimeout(tick, 30000);
    }
    tick();
}

function renderPrediction() {
    const result = computePrediction(window.INFLATION_HISTORY || []);
    if (!result) return;

    document.getElementById('pred-value').textContent    = result.predicted.toFixed(2) + ' %';
    document.getElementById('pred-infl').textContent     = result.avgInfl + ' %';
    document.getElementById('pred-estr').textContent     = result.estr + ' %';
    document.getElementById('pred-period').textContent   = result.period;
    document.getElementById('pred-f1').textContent       = result.formula1 + ' %';
    document.getElementById('pred-f2').textContent       = result.formula2 + ' %';
    document.getElementById('pred-raw').textContent      = result.raw + ' %';

    const diff   = result.predicted - RATE_DATA.rate;
    const dirEl  = document.getElementById('pred-direction');
    if (diff > 0) {
        dirEl.textContent  = '▲ HAUSSE ESTIMÉE';
        dirEl.className    = 'pred-direction up';
    } else if (diff < 0) {
        dirEl.textContent  = '▼ BAISSE ESTIMÉE';
        dirEl.className    = 'pred-direction down';
    } else {
        dirEl.textContent  = '= STABLE ESTIMÉ';
        dirEl.className    = 'pred-direction stable';
    }

    document.getElementById('pred-panel').style.display = 'block';
    startPredictionCountdown();
}
