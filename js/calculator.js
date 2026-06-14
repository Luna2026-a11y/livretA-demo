const PLAFOND = 22950;

function formatEur(val) {
    return val.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function animateValue(el, from, to, duration) {
    const start = performance.now();
    function step(now) {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        el.textContent = formatEur(from + (to - from) * ease);
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function computeCalc() {
    const amountInput = document.getElementById('calc-amount');
    const warning     = document.getElementById('calc-warning');
    const bar         = document.getElementById('calc-plafond-bar');

    let principal = parseFloat(amountInput.value) || 0;
    const years   = parseInt(document.getElementById('calc-years').value) || 0;
    const rate    = RATE_DATA.rate / 100;

    // Plafond indicator
    const pct = Math.min((principal / PLAFOND) * 100, 100);
    bar.style.width = pct + '%';
    bar.style.background = pct >= 100 ? 'var(--pink)' : 'var(--green)';
    bar.style.boxShadow  = pct >= 100
        ? '0 0 8px var(--pink)'
        : '0 0 8px var(--green)';

    if (principal > PLAFOND) {
        warning.style.display = 'block';
        principal = PLAFOND;
    } else {
        warning.style.display = 'none';
    }

    const total    = principal * Math.pow(1 + rate, years);
    const interest = total - principal;

    animateValue(document.getElementById('calc-interest'), 0, interest, 600);
    animateValue(document.getElementById('calc-total'),    0, total,    600);
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('calc-amount').addEventListener('input', computeCalc);
    document.getElementById('calc-years').addEventListener('input', computeCalc);
    computeCalc();
});
