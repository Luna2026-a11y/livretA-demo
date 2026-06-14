function initChart() {
    const canvas  = document.getElementById('rate-chart');
    const tooltip = document.getElementById('chart-tooltip');
    const ctx     = canvas.getContext('2d');

    const START    = new Date('2016-01-01');
    const END      = new Date('2026-12-01');
    const TOTAL_MS = END - START;
    const MIN_R    = 0;

    let geo    = {};
    let MAX_R  = 7;

    function xOf(dateStr) {
        return geo.PAD.left + ((new Date(dateStr) - START) / TOTAL_MS) * geo.cW;
    }

    function yOf(rate) {
        return geo.PAD.top + geo.cH - ((rate - MIN_R) / (MAX_R - MIN_R)) * geo.cH;
    }

    function draw() {
        const inflHist = window.INFLATION_HISTORY || [];

        const maxLep    = Math.max.apply(null, HISTORY.map(function (p) { return p.rate; }));
        const maxInflat = inflHist.length
            ? Math.max.apply(null, inflHist.map(function (p) { return p.rate; }))
            : 0;
        MAX_R = Math.ceil(Math.max(maxLep, maxInflat, 7) * 2) / 2;

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

        ctx.font = '9px Courier New';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let r = 0; r <= MAX_R + 0.01; r += 0.5) {
            const rv = Math.round(r * 10) / 10;
            const y  = yOf(rv);
            ctx.strokeStyle = 'rgba(0,245,255,0.07)';
            ctx.lineWidth   = 1;
            ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke();
            ctx.fillStyle = 'rgba(0,245,255,0.35)';
            ctx.fillText(rv.toFixed(1) + '%', PAD.left - 4, y);
        }

        ctx.font = '9px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let yr = 2016; yr <= 2026; yr++) {
            const x = xOf(yr + '-01-01');
            ctx.strokeStyle = 'rgba(0,245,255,0.05)';
            ctx.lineWidth   = 1;
            ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, H - PAD.bottom); ctx.stroke();
            ctx.fillStyle = 'rgba(0,245,255,0.3)';
            ctx.fillText(yr, x + cW / 22, H - PAD.bottom + 4);
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const todayX   = Math.min(xOf(todayStr), W - PAD.right);
        const lastRate = HISTORY[HISTORY.length - 1].rate;

        // ── Inflation curve ──
        if (inflHist.length > 1) {
            ctx.beginPath();
            ctx.moveTo(xOf(inflHist[0].date), yOf(inflHist[0].rate));
            for (let i = 1; i < inflHist.length; i++) {
                ctx.lineTo(xOf(inflHist[i].date), yOf(inflHist[i].rate));
            }
            ctx.strokeStyle = 'rgba(255, 0, 170, 0.55)';
            ctx.shadowColor  = 'rgba(255, 0, 170, 0.3)';
            ctx.shadowBlur   = 4;
            ctx.lineWidth    = 1.5;
            ctx.stroke();
            ctx.shadowBlur   = 0;

            ctx.beginPath();
            ctx.moveTo(xOf(inflHist[0].date), H - PAD.bottom);
            ctx.lineTo(xOf(inflHist[0].date), yOf(inflHist[0].rate));
            for (let i = 1; i < inflHist.length; i++) {
                ctx.lineTo(xOf(inflHist[i].date), yOf(inflHist[i].rate));
            }
            ctx.lineTo(xOf(inflHist[inflHist.length - 1].date), H - PAD.bottom);
            ctx.closePath();
            const gradInf = ctx.createLinearGradient(0, PAD.top, 0, H - PAD.bottom);
            gradInf.addColorStop(0, 'rgba(255,0,170,0.07)');
            gradInf.addColorStop(1, 'rgba(255,0,170,0.00)');
            ctx.fillStyle = gradInf;
            ctx.fill();
        }

        // ── LEP gradient fill ──
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

        // ── LEP step line ──
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

        HISTORY.forEach(function (p) {
            ctx.beginPath();
            ctx.arc(xOf(p.date), yOf(p.rate), 3.5, 0, Math.PI * 2);
            ctx.fillStyle   = '#00ff41';
            ctx.shadowColor = '#00ff41';
            ctx.shadowBlur  = 10;
            ctx.fill();
            ctx.shadowBlur  = 0;
        });

        ctx.beginPath();
        ctx.arc(todayX, yOf(RATE_DATA.rate), 4.5, 0, Math.PI * 2);
        ctx.fillStyle   = '#ff00aa';
        ctx.shadowColor = '#ff00aa';
        ctx.shadowBlur  = 14;
        ctx.fill();
        ctx.shadowBlur  = 0;

        // ── Legend ──
        const lx = W - PAD.right - 4;
        const ly = PAD.top + 6;
        ctx.font      = '8px Courier New';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        ctx.beginPath();
        ctx.moveTo(lx - 42, ly);
        ctx.lineTo(lx - 26, ly);
        ctx.strokeStyle = '#00ff41';
        ctx.shadowColor = '#00ff41';
        ctx.shadowBlur  = 4;
        ctx.lineWidth   = 2;
        ctx.stroke();
        ctx.shadowBlur  = 0;
        ctx.fillStyle   = 'rgba(0,245,255,0.5)';
        ctx.fillText('L.E.P.', lx, ly);

        if (inflHist.length) {
            ctx.beginPath();
            ctx.moveTo(lx - 42, ly + 13);
            ctx.lineTo(lx - 26, ly + 13);
            ctx.strokeStyle = 'rgba(255,0,170,0.7)';
            ctx.shadowColor = 'rgba(255,0,170,0.4)';
            ctx.shadowBlur  = 4;
            ctx.lineWidth   = 1.5;
            ctx.stroke();
            ctx.shadowBlur  = 0;
            ctx.fillStyle   = 'rgba(255,0,170,0.6)';
            ctx.fillText('INFLATION', lx, ly + 13);
        }
    }

    // ── Tooltip ──
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

        const inflHist = window.INFLATION_HISTORY || [];
        let inflRate   = null;
        for (let i = 0; i < inflHist.length; i++) {
            if (new Date(inflHist[i].date) <= hoverDate) inflRate = inflHist[i].rate;
        }

        tooltip.textContent = '';

        function addLine(label, value, color) {
            const row = document.createElement('span');
            row.textContent = label;
            const val = document.createElement('strong');
            val.textContent = value;
            if (color) val.style.color = color;
            row.appendChild(val);
            tooltip.appendChild(row);
            tooltip.appendChild(document.createElement('br'));
        }

        addLine('L.E.P. : ', rate.toFixed(2) + '%', '#00ff41');

        if (inflRate !== null) {
            addLine('INFLATION : ', inflRate.toFixed(1) + '%', '#ff00aa');
            const real = rate - inflRate;
            const sign = real >= 0 ? '+' : '';
            addLine('TAUX RÉEL : ', sign + real.toFixed(2) + '%', real >= 0 ? '#00ff41' : '#ff00aa');
        }

        tooltip.appendChild(document.createTextNode('DE ' + since + ' — ' + until));
        tooltip.style.display = 'block';

        const tipW      = tooltip.offsetWidth;
        const overRight = (mouseX + 14 + tipW) > geo.W;
        tooltip.style.left = (overRight ? mouseX - tipW - 14 : mouseX + 14) + 'px';
        tooltip.style.top  = Math.max(4, mouseY - 28) + 'px';
    });

    canvas.addEventListener('mouseleave', function () {
        tooltip.style.display = 'none';
    });

    draw();
    window.redrawChart = draw;

    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(draw, 80);
    });
}
