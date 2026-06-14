let animFrame = null;

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
    const principal = parseFloat(document.getElementById('calc-amount').value) || 0;
    const years     = parseInt(document.getElementById('calc-years').value)   || 0;
    const rate      = RATE_DATA.rate / 100;

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
