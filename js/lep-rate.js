// ─── Fetch automatique du taux LEP depuis la Caisse des Dépôts ───────────────
// Source : opendata.caissedesdepots.fr — dataset flux-et-taux-la-ldds-lep
// CORS libre, open data officiel CDC.
// Fallback : taux de LEP_RATE_DATA (lep-data.js) si API indisponible ou trop ancienne.

const LEP_CDC_URL =
    'https://opendata.caissedesdepots.fr/api/explore/v2.1/catalog/datasets/' +
    'flux-et-taux-la-ldds-lep/records?order_by=date%20desc&limit=1&select=date,tlep_percent';

// Date du dernier taux connu (arrêté ministériel) — à mettre à jour si nécessaire
const LEP_KNOWN_DATE = new Date('2026-02-01');

function lepChangeDateFromCDC(dateStr) {
    const [year, month] = dateStr.split('-');
    const m = parseInt(month, 10);
    if (m >= 8) return '01 AOÛT '    + year;
    if (m >= 2) return '01 FÉVRIER ' + year;
    return '01 AOÛT ' + (parseInt(year, 10) - 1);
}

function applyLepRate(data) {
    LEP_RATE_DATA.rate       = data.rate;
    LEP_RATE_DATA.changeDate = data.changeDate;
    RATE_DATA.rate           = data.rate;
    RATE_DATA.changeDate     = data.changeDate;

    const rateEl = document.getElementById('rate-display');
    if (rateEl) {
        rateEl.textContent = data.rate.toFixed(1);
        rateEl.style.animation = 'none';
        void rateEl.offsetWidth;
        rateEl.style.animation = 'pop-in 0.45s ease-out';
    }

    const dateEl = document.getElementById('rate-change-date');
    if (dateEl) dateEl.textContent = data.changeDate;

    const infEl = document.getElementById('inf-livreta-value');
    if (infEl) infEl.textContent = data.rate.toFixed(1).replace('.', ',') + '%';

    if (typeof computeCalc       === 'function') computeCalc();
    if (typeof renderInflation   === 'function') renderInflation();
    if (typeof window.redrawChart === 'function') window.redrawChart();
}

async function fetchLepRate() {
    const fallback = { rate: LEP_RATE_DATA.rate, changeDate: LEP_RATE_DATA.changeDate };
    try {
        const res    = await fetch(LEP_CDC_URL);
        const json   = await res.json();
        const record = json.results && json.results[0];
        if (!record || !record.tlep_percent) { applyLepRate(fallback); return; }

        const cdcDate = new Date(record.date + '-01');

        // Si CDC est plus récent que notre fallback → utiliser CDC
        if (cdcDate >= LEP_KNOWN_DATE) {
            applyLepRate({
                rate:       record.tlep_percent,
                changeDate: lepChangeDateFromCDC(record.date)
            });
        } else {
            // CDC en retard : on garde le fallback hardcodé (plus récent)
            applyLepRate(fallback);
        }
    } catch (_) {
        applyLepRate(fallback);
    }
}

document.addEventListener('DOMContentLoaded', fetchLepRate);
