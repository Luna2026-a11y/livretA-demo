function formatEurObj(val) {
    return val.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function computeObjective() {
    const target = parseFloat(document.getElementById('obj-target').value) || 0;
    const years  = parseInt(document.getElementById('obj-years').value)   || 0;
    const rate   = RATE_DATA.rate / 100;

    const rMonthly = rate / 12;
    const nMonths  = years * 12;

    let monthly = 0;
    if (nMonths > 0 && rMonthly > 0) {
        monthly = target * rMonthly / (Math.pow(1 + rMonthly, nMonths) - 1);
    } else if (nMonths > 0) {
        monthly = target / nMonths;
    }

    const totalDeposed = monthly * nMonths;
    const interest     = target - totalDeposed;

    document.getElementById('obj-monthly').textContent = monthly > 0 ? formatEurObj(monthly) : '—';
    document.getElementById('obj-total-deposed').textContent = totalDeposed > 0 ? formatEurObj(totalDeposed) : '—';
    document.getElementById('obj-interest').textContent = interest > 0 ? '+' + formatEurObj(interest) : '—';

    const warn = document.getElementById('obj-warning');
    if (typeof PLAFOND !== 'undefined' && target > PLAFOND) {
        warn.style.display = 'block';
    } else {
        warn.style.display = 'none';
    }
}

function switchTab(tab) {
    const gainEl  = document.getElementById('mode-gain');
    const objEl   = document.getElementById('mode-objectif');
    const tabGain = document.getElementById('tab-gain');
    const tabObj  = document.getElementById('tab-objectif');

    if (tab === 'gain') {
        gainEl.style.display = '';
        objEl.style.display  = 'none';
        tabGain.classList.add('active');
        tabObj.classList.remove('active');
    } else {
        gainEl.style.display = 'none';
        objEl.style.display  = '';
        tabGain.classList.remove('active');
        tabObj.classList.add('active');
        computeObjective();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('obj-target').addEventListener('input', computeObjective);
    document.getElementById('obj-years').addEventListener('input', computeObjective);
});
