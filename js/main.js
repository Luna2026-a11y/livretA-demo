const REFRESH_MS = 10 * 60 * 1000;
let remainingSeconds = REFRESH_MS / 1000;
let countdownTimer   = null;
let notifTimer       = null;

function generateSessionId() {
    const hex  = Date.now().toString(16).toUpperCase().slice(-4);
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return rand + '-' + hex;
}

function formatCountdown(s) {
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' +
           String(s % 60).padStart(2, '0');
}

function showNotification(message) {
    const el = document.getElementById('notification');
    clearTimeout(notifTimer);
    el.textContent = message;
    el.classList.add('show');
    notifTimer = setTimeout(function () { el.classList.remove('show'); }, 3200);
}

function renderRate(data) {
    const rateEl = document.getElementById('rate-display');
    const dateEl = document.getElementById('rate-change-date');
    rateEl.textContent = data.rate.toFixed(1);
    dateEl.textContent = data.changeDate;
    rateEl.style.animation = 'none';
    void rateEl.offsetWidth;
    rateEl.style.animation = 'pop-in 0.45s ease-out';
}

function startCountdown() {
    clearInterval(countdownTimer);
    remainingSeconds = REFRESH_MS / 1000;
    document.getElementById('countdown').textContent = formatCountdown(remainingSeconds);
    countdownTimer = setInterval(function () {
        remainingSeconds -= 1;
        document.getElementById('countdown').textContent = formatCountdown(remainingSeconds);
        if (remainingSeconds <= 0) {
            clearInterval(countdownTimer);
            location.reload();
        }
    }, 1000);
}

function updateRate() {
    const btn = document.getElementById('btn-update');
    const bar = document.getElementById('loading-bar');
    btn.disabled = true;
    btn.textContent = '[ Synchronisation en cours... ]';
    bar.classList.remove('active');
    void bar.offsetWidth;
    bar.classList.add('active');
    setTimeout(function () {
        renderRate(RATE_DATA);
        bar.classList.remove('active');
        btn.disabled = false;
        btn.textContent = '[ Actualiser le taux ]';
        showNotification('✓ TAUX SYNCHRONISÉ AVEC SUCCÈS');
        startCountdown();
    }, 1500);
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('session-id').textContent = generateSessionId();
    renderRate(RATE_DATA);
    startCountdown();
    initChart();
});
