function initChart() {
    const canvas  = document.getElementById('rate-chart');
    const tooltip = document.getElementById('chart-tooltip');
    const ctx     = canvas.getContext('2d');

    const START    = new Date('2016-01-01');
    const END      = new Date('2026-12-01');
    const TOTAL_MS = END - START;
    const MIN_R    = 0;
    const MAX_R    = 3.5;

    let geo = {};

    function xOf(dateStr) {
        return geo.PAD.left + ((new Date(dateStr) - START) / TOTAL_MS) * geo.cW;
    }

    function yOf(rate) {
        return geo.PAD.top + geo.cH - ((rate - MIN_R) / (MAX_R - MIN_R)) * geo.cH;
    }

    function draw() {
        const dpr = window.devicePixelRatio || 1;
        const W   = canvas.offsetWidth;
        const H   = canvas.offsetHeight;
        if (W === 0) return;

        canvas.width  = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const PAD = { top: 16, right: 16, bottom: 28, left: 40 };
        const cW  = W - PAD.left - PAD.right;
        const cH  = H - PAD.top  - PAD.bottom;
        geo = { W, H, PAD, cW, cH };

        ctx.fillStyle = '#020210';
        ctx.fillRect(0, 0, W, H);

        // Horizontal grid + Y labels
        ctx.font = '9px Courier New';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5].forEach(function (r) {
            const y = yOf(r);
            ctx.strokeStyle = 'rgba(0,245,255,0.07)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke();
            ctx.fillStyle = 'rgba(0,245,255,0.35)';
            ctx.fillText(r.toFixed(1) + '%', PAD.left - 4, y);
        });

        // Vertical grid + X labels
        ctx.font = '9px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let yr = 2016; yr <= 2026; yr++) {
            const x = xOf(yr + '-01-01');
            ctx.strokeStyle = 'rgba(0,245,255,0.05)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, H - PAD.bottom); ctx.stroke();
            ctx.fillStyle = 'rgba(0,245,255,0.3)';
            ctx.fillText(yr, x + cW / 22, H - PAD.bottom + 4);
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const todayX   = Math.min(xOf(todayStr), W - PAD.right);
        const lastRate = HISTORY[HISTORY.length - 1].rate;

        // Gradient fill
        ctx.beginPath();
        ctx.moveTo(PAD.left, H - PAD.bottom);
        ctx.lineTo(PAD.left, yOf(HISTORY[0].rate));
        HISTORY.forEach(function (p, i) {
            if (i === 0) return;
            const x = xOf(p.date);
            ctx.lineTo(x, yOf(HISTORY[i - 1].rate));
            ctx.lineTo(x, yOf(p.rate));
        });
        ctx.lineTo(todayX, yOf(lastRate));
        ctx.lineTo(todayX, H - PAD.bottom);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, PAD.top, 0, H - PAD.bottom);
        grad.addColorStop(0, 'rgba(0,255,65,0.14)');
        grad.addColorStop(1, 'rgba(0,255,65,0.01)');
        ctx.fillStyle = grad;
        ctx.fill();

        // Step line
        ctx.strokeStyle = '#00ff41';
        ctx.shadowColor = '#00ff41';
        ctx.shadowBlur  = 5;
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.moveTo(PAD.left, yOf(HISTORY[0].rate));
        HISTORY.forEach(function (p, i) {
            if (i === 0) return;
            const x = xOf(p.date);
            ctx.lineTo(x, yOf(HISTORY[i - 1].rate));
            ctx.lineTo(x, yOf(p.rate));
        });
        ctx.lineTo(todayX, yOf(lastRate));
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Dots at each rate change
        HISTORY.forEach(function (p) {
            ctx.beginPath();
            ctx.arc(xOf(p.date), yOf(p.rate), 3.5, 0, Math.PI * 2);
            ctx.fillStyle   = '#00ff41';
            ctx.shadowColor = '#00ff41';
            ctx.shadowBlur  = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // Current dot (pink)
        ctx.beginPath();
        ctx.arc(todayX, yOf(RATE_DATA.rate), 4.5, 0, Math.PI * 2);
        ctx.fillStyle   = '#ff00aa';
        ctx.shadowColor = '#ff00aa';
        ctx.shadowBlur  = 14;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    canvas.addEventListener('mousemove', function (e) {
        if (!geo.cW) return;
        const rect   = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (mouseX < geo.PAD.left || mouseX > geo.PAD.left + geo.cW) {
            tooltip.style.display = 'none';
            return;
        }

        const t         = (mouseX - geo.PAD.left) / geo.cW;
        const hoverDate = new Date(START.getTime() + t * TOTAL_MS);

        let rate  = HISTORY[0].rate;
        let since = HISTORY[0].label;
        let until = HISTORY[1] ? HISTORY[1].label : 'Aujourd\'hui';
        for (let i = 0; i < HISTORY.length; i++) {
            if (new Date(HISTORY[i].date) <= hoverDate) {
                rate  = HISTORY[i].rate;
                since = HISTORY[i].label;
                until = HISTORY[i + 1] ? HISTORY[i + 1].label : 'Aujourd\'hui';
            }
        }

        tooltip.textContent = '';
        const line = document.createElement('span');
        line.textContent = 'TAUX : ';
        const strong = document.createElement('strong');
        strong.textContent = rate.toFixed(2) + '%';
        line.appendChild(strong);
        tooltip.appendChild(line);
        tooltip.appendChild(document.createElement('br'));
        tooltip.appendChild(document.createTextNode('DE ' + since + ' — ' + until));
        tooltip.style.display = 'block';

        const tipW     = tooltip.offsetWidth;
        const overRight = (mouseX + 14 + tipW) > geo.W;
        tooltip.style.left = (overRight ? mouseX - tipW - 14 : mouseX + 14) + 'px';
        tooltip.style.top  = Math.max(4, mouseY - 28) + 'px';
    });

    canvas.addEventListener('mouseleave', function () {
        tooltip.style.display = 'none';
    });

    draw();

    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(draw, 80);
    });
}
