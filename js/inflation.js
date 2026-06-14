const EUROSTAT_URL =
    'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/' +
    'prc_hicp_manr?geo=FR&coicop=CP00&lastTimePeriod=1&format=JSON';

const EUROSTAT_HISTORY_URL =
    'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/' +
    'prc_hicp_manr?geo=FR&coicop=CP00&sinceTimePeriod=2016-01&format=JSON';

window.INFLATION_HISTORY = [];

const INFLATION_FALLBACK = { rate: 0.7, period: 'Déc 2025' };

const MONTHS_FR = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

async function fetchInflation() {
    try {
        const res  = await fetch(EUROSTAT_URL);
        const json = await res.json();
        const rate = Object.values(json.value)[0];
        const key  = Object.keys(json.dimension.time.category.index).pop();
        const [year, month] = key.split('-');
        return { rate, period: MONTHS_FR[parseInt(month, 10) - 1] + ' ' + year };
    } catch (_) {
        return INFLATION_FALLBACK;
    }
}

async function fetchInflationHistory() {
    try {
        const res  = await fetch(EUROSTAT_HISTORY_URL);
        const json = await res.json();
        const times  = json.dimension.time.category.index;
        const values = json.value;
        return Object.entries(times)
            .map(function (entry) {
                return { date: entry[0] + '-01', rate: values[String(entry[1])] };
            })
            .filter(function (p) { return p.rate !== undefined; })
            .sort(function (a, b) { return a.date.localeCompare(b.date); });
    } catch (_) {
        return [];
    }
}

async function renderInflation() {
    const data     = await fetchInflation();
    const real     = (RATE_DATA.rate - data.rate);
    const positive = real >= 0;
    const sign     = positive ? '+' : '';

    document.getElementById('inf-inflation-value').textContent  = data.rate.toFixed(1);
    document.getElementById('inf-inflation-period').textContent = data.period;
    document.getElementById('inf-real-value').textContent       = sign + real.toFixed(2) + '%';
    document.getElementById('inf-tip-period').textContent       = data.period;
    document.getElementById('inf-tip-value').textContent        = data.rate.toFixed(1);

    const realEl   = document.getElementById('inf-real-value');
    const statusEl = document.getElementById('inf-status');

    realEl.className = 'inf-real-value ' + (positive ? 'positive' : 'negative');

    if (positive) {
        statusEl.textContent  = '✓ TON ÉPARGNE BAT L\'INFLATION';
        statusEl.className    = 'inf-status positive';
    } else {
        statusEl.textContent  = '⚠ TON ÉPARGNE PERD DU POUVOIR D\'ACHAT';
        statusEl.className    = 'inf-status negative';
    }

    fetchInflationHistory().then(function (history) {
        window.INFLATION_HISTORY = history;
        if (typeof window.redrawChart    === 'function') window.redrawChart();
        if (typeof renderPrediction      === 'function') renderPrediction();
    });
}
