'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function Page() {
  // ---------- Constantes / utilidades ----------
  const START = useMemo(() => new Date(2025, 9, 29, 15, 36, 0, 0), []);
  const frases = useMemo(() => [
    'Tú eres la coincidencia favorita del universo.',
    'Cada día contigo es un upgrade del corazón.',
    'Qué bonita te ves cuando te ríes… y cuando no también.',
    'Me gusta tu energía: calma que enciende.',
    'Si existiera el modo ‘contigo’, lo dejo activado siempre.',
    'Eres la playlist que quiero repetir diario.',
    'Te pienso y el mundo se acomoda poquito.',
    'Lo sencillo contigo se vuelve épico.',
    'Eres mi notificación favorita.',
    'No fue suerte, fue sincronía.',
    'La vida me guiñó un ojo cuando te conocí.',
    'Tienes luz hasta cuando no hay sol.',
    'Hoy te queda perfecto sonreír (como siempre).',
    'Me dan ganas de escribir ‘gracias’ y firmarlo con tu nombre.',
    'En un mundo de ruido, tú eres mi silencio bonito.',
    'Más tú, por favor.',
    'Qué bien te sale ser tú.',
    'A tu lado, todo tiene sentido y brillo.'
  ], []);
  const phraseForDay = (i) => frases[i % frases.length];
  const fmt = useMemo(() => new Intl.DateTimeFormat('es-MX', { dateStyle: 'full' }), []);
  const fmtShort = useMemo(() => new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: '2-digit', month: 'short' }), []);
  const fmtISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const pad = (n) => String(n).padStart(2, '0');

  // ---------- Gate con localStorage ----------
  const [gateOpen, setGateOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    const url = new URL(window.location.href);
    if (url.searchParams.get('reset') === '1') localStorage.removeItem('fernanda_gate_ok');
    // migración desde sessionStorage si existía
    if (sessionStorage.getItem('fernanda_gate_ok') === '1' && !localStorage.getItem('fernanda_gate_ok')) {
      localStorage.setItem('fernanda_gate_ok', '1');
    }
    return !(localStorage.getItem('fernanda_gate_ok') === '1');
  });
  const gateInputRef = useRef(null);
  const [gateErr, setGateErr] = useState('');

  // ---------- Contadores ----------
  const [counterStr, setCounterStr] = useState('—');
  const [flatDays, setFlatDays] = useState(0);
  const [flatWeeksStr, setFlatWeeksStr] = useState('0 sem · 0 d');
  const [flatHours, setFlatHours] = useState(0);
  const [flatMins, setFlatMins] = useState(0);
  const [cd, setCd] = useState('--:--:--');

  // ---------- Listas modales ----------
  const [hiddenCount, setHiddenCount] = useState(0);
  const [hiddenOpen, setHiddenOpen] = useState(false);
  const [hiddenList, setHiddenList] = useState([]);
  const [nextOpen, setNextOpen] = useState(false);
  const [nextList, setNextList] = useState([]);

  const rotRef = useRef(null);

  // Diferencias de calendario y planas
  function calendarDiff(from, to) {
    let y = to.getFullYear() - from.getFullYear();
    let m = to.getMonth() - from.getMonth();
    let base = new Date(from);
    base.setFullYear(base.getFullYear() + y);
    if (base > to) { y--; base.setFullYear(base.getFullYear() - 1); }
    base.setMonth(base.getMonth() + m);
    if (base > to) { m--; base.setMonth(base.getMonth() - 1); }
    let ms = Math.max(0, to - base);
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const r = s % 86400;
    const h = Math.floor(r / 3600);
    const mi = Math.floor((r % 3600) / 60);
    const se = r % 60;
    return { y, m, d, h, mi, se };
  }
  function flat(now, start) {
    const ms = now - start; const secs = Math.max(0, ms / 1000);
    return {
      weeks: Math.floor(secs / 604800),
      days: Math.floor(secs / 86400),
      hours: Math.floor(secs / 3600),
      mins: Math.floor(secs / 60),
    };
  }

  // Ticker principal + countdown a 23:59
  useEffect(() => {
    let raf;
    function tick() {
      const now = new Date();
      const c = calendarDiff(START, now);
      const f = flat(now, START);
      setCounterStr(`${c.y} años · ${c.m} meses · ${c.d} días · ${pad(c.h)}:${pad(c.mi)}:${pad(c.se)}`);
      setFlatDays(f.days);
      setFlatWeeksStr(`${f.weeks} sem · ${f.days - f.weeks * 7} d`);
      setFlatHours(f.hours);
      setFlatMins(f.mins);

      const unlock = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 0, 0);
      const diff = Math.max(0, unlock - now);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCd(`${pad(h)}:${pad(m)}:${pad(s)}`);

      raf = requestAnimationFrame(tick);
    }
    tick();
    return () => cancelAnimationFrame(raf);
  }, [START]);

  // Gate
  function checkGate() {
    const val = (gateInputRef.current?.value || '').trim();
    if (val === '29-10-25') {
      localStorage.setItem('fernanda_gate_ok', '1');   // ✅ persistente por dispositivo
      sessionStorage.setItem('fernanda_gate_ok', '1'); // opcional
      setGateOpen(false);
      setGateErr('');
    } else {
      setGateErr('Respuesta incorrecta. Intenta de nuevo 🙈');
    }
  }

  // Hearts de fondo
  useEffect(() => {
    const c = document.getElementById('hearts');
    if (!c) return;
    c.innerHTML = '';
    const n = 28;
    for (let i = 0; i < n; i++) {
      const h = document.createElement('div');
      h.className = 'heart';
      const size = Math.floor(16 + Math.random() * 24);
      h.style.width = size + 'px';
      h.style.height = size + 'px';
      h.style.left = Math.floor(Math.random() * 100) + '%';
      h.style.bottom = (-10 - Math.random() * 20) + 'vh';
      const dur = 10 + Math.random() * 10; const beat = 1.2 + Math.random() * 0.8;
      h.style.setProperty('--float', dur + 's');
      h.style.setProperty('--beat', beat + 's');
      h.style.animationDelay = (-Math.random() * dur) + 's, 0s';
      c.appendChild(h);
    }
  }, []);

  // Construcción de listas
  function buildHidden() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const startDay = new Date(START.getFullYear(), START.getMonth(), START.getDate());
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const totalDays = Math.max(0, Math.floor((yesterday - startDay) / (1000 * 60 * 60 * 24)) + 1);
    const arr = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDay); d.setDate(d.getDate() + i);
      arr.push({ key: fmtISO(d), date: fmtShort.format(d), phrase: `“${phraseForDay(i)}”` });
    }
    setHiddenList(arr);
    setHiddenCount(totalDays);
    setHiddenOpen(true);
    setTimeout(() => staggerList(document.getElementById('hiddenList')), 0);
  }

  function buildNext() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const arr = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today); d.setDate(d.getDate() + i);
      const unlock = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1, 23, 59, 0, 0);
      const idx = Math.floor((d - new Date(START.getFullYear(), START.getMonth(), START.getDate())) / (1000 * 60 * 60 * 24));
      const unlocked = now >= unlock;
      arr.push({
        key: fmtISO(d),
        full: fmt.format(d),
        short: fmtShort.format(d),
        phrase: unlocked ? `“${phraseForDay(idx)}”` : '🔒 Se revela a las 23:59',
        locked: !unlocked,
      });
    }
    setNextList(arr);
    setNextOpen(true);
    setTimeout(() => staggerList(document.getElementById('nextList')), 0);
  }

  // Stagger + rotador
  function staggerList(container) {
    if (!container) return;
    [...container.children].forEach((el, i) => {
      el.classList.add('reveal');
      el.style.animationDelay = (i * 0.15) + 's';
    });
  }
  useEffect(() => {
    let id;
    function show() {
      if (!rotRef.current) return;
      const el = rotRef.current;
      const ix = Math.floor(Date.now() / 4500) % frases.length;
      el.textContent = `“${frases[ix]}”`;
      el.classList.remove('line'); void el.offsetWidth; el.classList.add('line');
      id = setTimeout(show, 4500);
    }
    show();
    return () => clearTimeout(id);
  }, [frases]);

  // iOS: preferir app Spotify
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS) return;
    const dock = document.querySelector('.spotify-dock');
    if (!dock) return;
    dock.innerHTML = `
      <div style="display:grid; gap:8px; width:100%">
        <div class="mut">En iPhone, el audio embebido se pausa al bloquear pantalla o cambiar de app. Mejor ábrelo directo en Spotify:</div>
        <a class="btn" style="justify-self:start" target="_blank" rel="noopener"
           href="https://open.spotify.com/track/2vVA5mtCa4Ra66CBfW7JH3">🎧 Abrir en Spotify (app)</a>
        <div class="tiny">Tip: en la app sí suena en segundo plano y con pantalla bloqueada.</div>
      </div>
    `;
  }, []);

  // ---------- Render ----------
  return (
    <>
      <div className="hearts" id="hearts" aria-hidden="true" />

      {gateOpen && (
        <div className="gate">
          <div className="gate-card">
            <h2>🔐 Pregunta secreta</h2>
            <p style={{ margin: '6px 0 10px' }}>¿Qué día nos conocimos 🧐? (usa guiones)</p>
            <div className="inp" style={{ marginBottom: 8 }}>
              <input ref={gateInputRef} placeholder="Formato: 29-10-25" inputMode="numeric" />
              <button className="btn" onClick={checkGate}>Desbloquear</button>
            </div>
            <div className="err">{gateErr}</div>
            <div className="hint">Pista: formato DD-MM-AA</div>
          </div>
        </div>
      )}

      <main className={`wrap ${gateOpen ? 'blurred' : ''}`} id="content">
        <section className="header">
          <div><h1>Desde que conocí a <span className="name">Fernanda</span> 💗</h1></div>
          <span className="pill">29·Oct·2025 · 15:36</span>
        </section>

        <section className="card reveal">
          <div className="v">miércoles, 29 de octubre de 2025, 15:36</div>
        </section>

        <section className="card reveal">
          <div className="chat">
            <div className="ts">2025-10-29 15:36</div>
            <div className="rowchat me"><div className="bubble">un frii</div><div className="avatar" aria-hidden="true" /></div>
            <div className="rowchat me"><div className="bubble">o q</div><div className="avatar" aria-hidden="true" /></div>
            <div className="ts">2025-10-29 16:22</div>
            <div className="rowchat"><div className="avatar" aria-hidden="true" /><div className="bubble other">Holiiiii, pasa ID</div></div>
          </div>
        </section>

        <section className="card reveal">
          <div className="counter">{counterStr}</div>
          <div className="grid" style={{ marginTop: 10 }}>
            <div><div className="k">Total en días</div><div className="v">{flatDays.toLocaleString('es-MX')}</div></div>
            <div><div className="k">Semanas + días</div><div className="v">{flatWeeksStr}</div></div>
            <div><div className="k">Horas totales</div><div className="v">{flatHours.toLocaleString('es-MX')}</div></div>
            <div><div className="k">Minutos totales</div><div className="v">{flatMins.toLocaleString('es-MX')}</div></div>
          </div>
        </section>

        <section className="card reveal">
          <div className="k">Mini frase animada</div>
          <div className="rotator"><div ref={rotRef} className="line" /></div>
          <div className="mut">Cambia sola cada ~4.5s con un suave fade.</div>
        </section>

        <section className="card reveal">
          <div className="row">
            <button className="btn" onClick={buildHidden}>💌 Mensajes no leídos de hace <span>{hiddenCount}</span> días</button>
            <button className="btn" onClick={buildNext}>🌙 Próximos mensajes (se revelan 23:59) — <span className="countdown">{cd}</span></button>
          </div>
          <div className="mut" style={{ marginTop: 8 }}>Los no leídos se conservan aunque cierres. Las sorpresas de mañana se revelan a las 23:59.</div>
        </section>

        {hiddenOpen && (
          <div className="modal open" onClick={(e) => { if (e.target.classList.contains('modal')) setHiddenOpen(false); }}>
            <div className="sheet">
              <button className="x" onClick={() => setHiddenOpen(false)}>Cerrar ✕</button>
              <h3 style={{ margin: '6px 0 0' }}>Mensajes no leídos</h3>
              <div className="mut">Desde el 29/oct/2025 hasta ayer.</div>
              <div className="list" id="hiddenList">
                {hiddenList.map(it => (
                  <div key={it.key} className="item">
                    <div><div className="date">{it.date}</div><div className="mut">{it.key}</div></div>
                    <div className="quote">{it.phrase}</div>
                  </div>
                ))}
              </div>
              <div className="mut" style={{ marginTop: 10 }}>Se conservarán como no leídos al cerrar.</div>
            </div>
          </div>
        )}

        {nextOpen && (
          <div className="modal open" onClick={(e) => { if (e.target.classList.contains('modal')) setNextOpen(false); }}>
            <div className="sheet">
              <button className="x" onClick={() => setNextOpen(false)}>Cerrar ✕</button>
              <h3 style={{ margin: '6px 0 0' }}>Próximos mensajes</h3>
              <div className="mut">Cada frase se desbloquea a las <strong>23:59</strong> del día anterior.</div>
              <div className="list" id="nextList">
                {nextList.map(it => (
                  <div key={it.key} className="item">
                    <div><div className="date">{it.short}</div><div className="mut">{it.full}</div></div>
                    <div className={`quote ${it.locked ? 'lock' : ''}`}>{it.phrase}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="spotify-dock">
        <iframe
          className="spotify-iframe"
          src="https://open.spotify.com/embed/track/2vVA5mtCa4Ra66CBfW7JH3?utm_source=generator&theme=0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
        <div className="spotify-ctrls">
          <a className="btn" target="_blank" rel="noopener" href="https://open.spotify.com/track/2vVA5mtCa4Ra66CBfW7JH3">Abrir en Spotify</a>
        </div>
      </div>
    </>
  );
}
