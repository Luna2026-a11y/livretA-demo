let consoleOpen  = false;
let consoleBuilt = false;

function buildConsole() {
    if (consoleBuilt) return;
    consoleBuilt = true;

    const body = document.getElementById('console-body');
    const sep  = '─'.repeat(62);
    const lines = [];

    lines.push({ cls: 'cmd',  text: '$ list-sources --type taux-livret-a --format detail' });
    lines.push({ cls: 'sep',  text: sep });
    lines.push({ cls: 'info', text: '  ' + SOURCES.length + ' sources officielles référencées' });
    lines.push({ cls: 'info', text: '  Révision du taux : 1er février et 1er août de chaque année' });
    lines.push({ cls: 'sep',  text: sep });
    lines.push({ cls: 'info', text: '' });

    SOURCES.forEach(function (s) {
        lines.push({ cls: 'source-num',  text: '  [' + s.num + ']' });
        lines.push({ cls: 'source-name', text: '       ' + s.name });
        lines.push({ cls: 'source-url',  text: '       ', url: s.url });
        lines.push({ cls: 'source-desc', text: '       ' + s.desc });
        lines.push({ cls: 'info',        text: '' });
    });

    lines.push({ cls: 'sep',    text: sep });
    lines.push({ cls: 'warn',   text: '  ⚠  Modifier RATE_DATA et HISTORY dans js/data.js à chaque arrêté.' });
    lines.push({ cls: 'sep',    text: sep });
    lines.push({ cls: 'prompt', text: '$ _' });

    lines.forEach(function (line, i) {
        const el = document.createElement('div');
        el.className = 'console-line ' + line.cls;
        el.style.animationDelay = (i * 28) + 'ms';

        if (line.url) {
            el.textContent = line.text;
            const a = document.createElement('a');
            a.href = line.url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.textContent = line.url;
            el.appendChild(a);
        } else {
            el.textContent = line.text;
        }

        body.appendChild(el);
    });
}

function toggleConsole() {
    if (consoleOpen) { closeConsole(); } else { openConsole(); }
}

function openConsole() {
    consoleOpen = true;
    buildConsole();
    document.getElementById('console-panel').classList.add('open');
    document.getElementById('console-overlay').classList.add('open');
    document.getElementById('console-panel').setAttribute('aria-hidden', 'false');
    document.getElementById('btn-console-toggle').classList.add('active');
    document.getElementById('btn-console-toggle').setAttribute('aria-expanded', 'true');
}

function closeConsole() {
    consoleOpen = false;
    document.getElementById('console-panel').classList.remove('open');
    document.getElementById('console-overlay').classList.remove('open');
    document.getElementById('console-panel').setAttribute('aria-hidden', 'true');
    document.getElementById('btn-console-toggle').classList.remove('active');
    document.getElementById('btn-console-toggle').setAttribute('aria-expanded', 'false');
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && consoleOpen) closeConsole();
});
