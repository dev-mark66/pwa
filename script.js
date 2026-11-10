// ==========================================
// 1. MODO OSCURO
// ==========================================
const themeBtn = document.getElementById('themeBtn');
const bodyElement = document.body;
const icon = themeBtn.querySelector('i');

function applyThemeIcon() {
    const dark = bodyElement.classList.contains('dark-mode');
    icon.className = dark ? 'ph ph-sun' : 'ph ph-moon';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
}
if (localStorage.getItem('theme') === 'dark') { bodyElement.classList.add('dark-mode'); applyThemeIcon(); }

themeBtn.addEventListener('click', (e) => {
    const toggle = () => { bodyElement.classList.toggle('dark-mode'); applyThemeIcon(); };
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return toggle();
    const x = e.clientX, y = e.clientY, r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(toggle).ready.then(() => {
        document.documentElement.animate(
            { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
            { duration: 600, easing: 'ease-in', pseudoElement: '::view-transition-new(root)' });
    });
});

// ==========================================
// 2. ENRUTADOR SPA
// ==========================================
const navMenu = document.getElementById('navMenu');
const burgerBtn = document.getElementById('burgerBtn');

function navigateTo(targetId) {
    document.querySelectorAll('.app-view').forEach(view => view.classList.remove('active'));
    const targetView = document.getElementById(targetId);
    if (targetView) {
        targetView.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.target === targetId);
    });
    navMenu.classList.remove('show');
    burgerBtn.setAttribute('aria-expanded', false);
    burgerBtn.querySelector('i').className = 'ph ph-list';
}

document.querySelectorAll('[data-target]').forEach(el => {
    el.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(el.dataset.target);
    });
});

// ==========================================
// 3. MENÚ HAMBURGUESA
// ==========================================
burgerBtn.addEventListener('click', () => {
    const open = navMenu.classList.toggle('show');
    burgerBtn.setAttribute('aria-expanded', open);
    burgerBtn.querySelector('i').className = open ? 'ph ph-x' : 'ph ph-list';
});

// ==========================================
// 4. FILTRO DE JUEGOS
// ==========================================
const tarjetas = document.querySelectorAll('.juego-card');
const botonesFiltro = document.querySelectorAll('#juegos .btn');
let filtroTimer;

function filtrarJuegos(categoria, btn) {
    botonesFiltro.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    clearTimeout(filtroTimer);
    tarjetas.forEach(card => {
        const visible = categoria === 'todos' || card.dataset.categoria === categoria;
        if (visible) {
            card.style.display = 'block';
            requestAnimationFrame(() => requestAnimationFrame(() => card.style.opacity = '1'));
        } else {
            card.style.opacity = '0';
        }
    });
    filtroTimer = setTimeout(() => tarjetas.forEach(c => {
        if (c.dataset.categoria !== categoria && categoria !== 'todos') c.style.display = 'none';
    }), 350);
}
botonesFiltro.forEach(btn => btn.addEventListener('click', () => filtrarJuegos(btn.dataset.filtro, btn)));

// ==========================================
// 5. VALIDACIÓN DE FORMULARIO
// ==========================================
const form = document.getElementById('contactForm');
const alertBox = document.getElementById('alertBox');
const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexTelefono = /^\+?[0-9]{7,15}$/;

const campos = [
    { el: document.getElementById('nombre'), err: 'errorNombre', ok: v => regexNombre.test(v) && v.length >= 3, msg: 'Solo letras (mín. 3).' },
    { el: document.getElementById('email'), err: 'errorEmail', ok: v => regexEmail.test(v), msg: 'Correo inválido.' },
    { el: document.getElementById('telefono'), err: 'errorTelefono', ok: v => regexTelefono.test(v), msg: 'Solo números (7-15).' },
    { el: document.getElementById('mensaje'), err: 'errorMensaje', ok: v => v.length >= 10, msg: 'Mínimo 10 letras.' }
];

function validateField({ el, err, ok, msg }) {
    const valido = ok(el.value.trim());
    el.classList.toggle('input-success', valido);
    el.classList.toggle('input-error', !valido);
    document.getElementById(err).textContent = valido ? '' : msg;
    return valido;
}
campos.forEach(c => c.el.addEventListener('input', () => validateField(c)));

if(form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const resultados = campos.map(validateField);
        if (resultados.every(Boolean)) {
            const nombre = campos[0].el.value.trim().replace(/[<>&]/g, '');
            alertBox.innerHTML = `<p class="msg-exito"><i class="ph ph-check-circle"></i> ¡Gracias ${nombre}, tu propuesta ha sido enviada!</p>`;
            form.reset();
            campos.forEach(c => c.el.classList.remove('input-success'));
        } else {
            alertBox.innerHTML = `<p class="msg-error-box"><i class="ph ph-warning"></i> Revisa los campos marcados en rojo.</p>`;
        }
    });
}

// ==========================================
// 6. CARRUSEL 3D
// ==========================================
const cards = document.querySelectorAll('.card-3d');
const dotsBox = document.getElementById('dots');
const wrapper = document.querySelector('.carousel-wrapper');
let currentIndex = 0, autoplay;

if (cards.length > 0 && dotsBox) {
    cards.forEach((_, i) => {
        const d = document.createElement('span');
        d.addEventListener('click', () => goTo(i));
        dotsBox.appendChild(d);
    });
    function updateCarousel() {
        cards.forEach((card, i) => {
            card.classList.remove('active', 'prev', 'next');
            if (i === currentIndex) card.classList.add('active');
            else if (i === (currentIndex - 1 + cards.length) % cards.length) card.classList.add('prev');
            else card.classList.add('next');
        });
        [...dotsBox.children].forEach((d, i) => d.classList.toggle('on', i === currentIndex));
    }
    function goTo(i) { currentIndex = (i + cards.length) % cards.length; updateCarousel(); }
    function rotateCarousel(dir) { goTo(currentIndex + dir); }
    function startAuto() { stopAuto(); autoplay = setInterval(() => rotateCarousel(1), 4000); }
    function stopAuto() { clearInterval(autoplay); }

    document.getElementById('prevBtn').addEventListener('click', () => rotateCarousel(-1));
    document.getElementById('nextBtn').addEventListener('click', () => rotateCarousel(1));
    cards.forEach((c, i) => c.addEventListener('click', () => goTo(i)));
    wrapper.addEventListener('mouseenter', stopAuto);
    wrapper.addEventListener('mouseleave', startAuto);

    let startX = 0;
    wrapper.addEventListener('pointerdown', e => startX = e.clientX);
    wrapper.addEventListener('pointerup', e => { const dx = e.clientX - startX; if (Math.abs(dx) > 50) rotateCarousel(dx < 0 ? 1 : -1); });
    document.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') rotateCarousel(-1); if (e.key === 'ArrowRight') rotateCarousel(1); });

    updateCarousel(); startAuto();
}

// ==========================================
// 7. TYPEWRITER
// ==========================================
const textElement = document.getElementById('typewriter');
const textArray = ["Ingeniero en Sistemas.", "Desarrollador Full Stack.", "Creador de APKs.", "Entusiasta de Kali Linux."];
let textIndex = 0, charIndex = 0, isDeleting = false;

function type() {
    if(!textElement) return;
    const current = textArray[textIndex];
    charIndex += isDeleting ? -1 : 1;
    textElement.textContent = current.substring(0, charIndex);
    let speed = isDeleting ? 45 : 95;
    if (!isDeleting && charIndex === current.length) { speed = 1800; isDeleting = true; }
    else if (isDeleting && charIndex === 0) { isDeleting = false; textIndex = (textIndex + 1) % textArray.length; speed = 400; }
    setTimeout(type, speed);
}
if(textElement) document.addEventListener('DOMContentLoaded', () => setTimeout(type, 800));

// ==========================================
// 8. REVEAL / CONTADORES / TILT / SCROLL
// ==========================================
function animateSkill(box) {
    box.querySelectorAll('.progress').forEach(p => p.style.width = p.dataset.w + '%');
    box.querySelectorAll('.count').forEach(c => {
        const to = +c.dataset.to, t0 = performance.now();
        const step = t => { const k = Math.min((t - t0) / 1600, 1); c.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
    });
}

document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--ry', ((x - .5) * 12) + 'deg');
        card.style.setProperty('--rx', ((.5 - y) * 12) + 'deg');
        card.style.setProperty('--cx', x * 100 + '%'); card.style.setProperty('--cy', y * 100 + '%');
    });
    card.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
});
addEventListener('pointermove', e => {
    document.documentElement.style.setProperty('--mx', e.clientX + 'px');
    document.documentElement.style.setProperty('--my', e.clientY + 'px');
}, { passive: true });

const navbar = document.getElementById('navbar');
addEventListener('scroll', () => {
    if(navbar) navbar.classList.toggle('scrolled', scrollY > 30);
    const max = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty('--p', max > 0 ? scrollY / max : 0);
}, { passive: true });

function markNow() {
    const d = new Date(), m = d.getHours() * 60 + d.getMinutes();
    document.querySelectorAll('#schedule tr').forEach(tr => tr.classList.toggle('now', m >= +tr.dataset.start && m < +tr.dataset.end));
}
markNow(); setInterval(markNow, 60000);
if(document.getElementById('year')) document.getElementById('year').textContent = new Date().getFullYear();

const track = document.getElementById('marquee');
if(track) [...track.children].forEach(n => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); });

// ==========================================
// 9. BUSCADOR (Ctrl+K)
// ==========================================
const palette = document.getElementById('palette');
const palInput = document.getElementById('palInput');
const palList = document.getElementById('palList');
const irA = id => () => navigateTo(id);
const acciones = [
    ['ph-house', 'Inicio', irA('inicio')], ['ph-game-controller', 'Pasatiempos', irA('pasatiempos')],
    ['ph-rocket-launch', 'Intereses', irA('intereses')], ['ph-clock-user', 'Horario', irA('horario')],
    ['ph-music-notes', 'Música', irA('musica')], ['ph-trophy', 'Juegos', irA('juegos')],
    ['ph-terminal-window', 'Terminal', irA('terminal')], ['ph-question', 'FAQ', irA('faq')],
    ['ph-envelope-simple', 'Contacto', irA('contacto')],
    ['ph-circle-half', 'Cambiar tema', () => themeBtn.click()]
];
let sel = 0, vista = acciones;
function pintarPalette() {
    palList.innerHTML = '';
    vista.forEach(([ic, txt, fn], i) => {
        const li = document.createElement('li');
        li.className = i === sel ? 'sel' : '';
        li.innerHTML = `<i class="ph ${ic}"></i>`;
        li.append(txt);
        li.addEventListener('click', () => { palette.close(); fn(); });
        palList.appendChild(li);
    });
}
if(document.getElementById('paletteBtn')) {
    document.getElementById('paletteBtn').addEventListener('click', () => { palInput.value = ''; vista = acciones; sel = 0; pintarPalette(); palette.showModal(); palInput.focus(); });
    addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette.open ? palette.close() : document.getElementById('paletteBtn').click(); } });
    palette.addEventListener('click', e => { if (e.target === palette) palette.close(); });
    palInput.addEventListener('input', () => { vista = acciones.filter(a => a[1].toLowerCase().includes(palInput.value.toLowerCase())); sel = 0; pintarPalette(); });
    palInput.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') { sel = (sel + 1) % vista.length; pintarPalette(); e.preventDefault(); }
        if (e.key === 'ArrowUp') { sel = (sel - 1 + vista.length) % vista.length; pintarPalette(); e.preventDefault(); }
        if (e.key === 'Enter' && vista[sel]) { palette.close(); vista[sel][2](); }
    });
}

// ==========================================
// 10. TERMINAL INTERACTIVA
// ==========================================
const termIn = document.getElementById('termIn');
const termOut = document.getElementById('termOut');
if(termIn) {
    const historial = []; let hIdx = 0;
    const comandos = {
        help: () => 'Comandos: help, whoami, skills, games, music, schedule, theme, clear',
        whoami: () => 'Alex | Ingeniero en Sistemas | Full Stack ',
        skills: () => 'Full Stack 90% | Móvil 80% | SysAdmin 85%',
        games: () => 'Counter-Strike 2, Valorant, The Witcher 3, Elden Ring',
        music: () => 'Synthwave (modo focus)',
        schedule: () => '08:30 Clases | 12:00 Trabajo | 21:00 Proyectos',
        theme: () => { themeBtn.click(); return 'Tema cambiado.'; },
        clear: () => { termOut.innerHTML = ''; return null; }
    };
    function imprimir(txt, clase = '') {
        const p = document.createElement('div');
        if (clase) p.className = clase;
        p.textContent = txt;
        termOut.appendChild(p);
        termOut.scrollTop = termOut.scrollHeight;
    }
    imprimir('Bienvenido. Escribe "help" para ver los comandos.', 'ok');
    termIn.addEventListener('keydown', e => {
        if (e.key === 'ArrowUp' && historial.length) { hIdx = Math.max(0, hIdx - 1); termIn.value = historial[hIdx]; e.preventDefault(); }
        if (e.key === 'ArrowDown') { hIdx = Math.min(historial.length, hIdx + 1); termIn.value = historial[hIdx] || ''; e.preventDefault(); }
        if (e.key !== 'Enter') return;
        const cmd = termIn.value.trim().toLowerCase();
        termIn.value = '';
        if (!cmd) return;
        historial.push(cmd); hIdx = historial.length;
        imprimir('alex@kali:~$ ' + cmd, 'cmd');
        if (cmd.startsWith('sudo')) return imprimir('Buen intento, pero aquí el root es Alex.', 'err');
        const fn = comandos[cmd];
        if (!fn) return imprimir(`${cmd}: comando no encontrado. Prueba "help".`, 'err');
        const r = fn(); if (r) imprimir(r);
    });
    document.getElementById('term').addEventListener('click', () => termIn.focus());
}

// ==========================================
// 11. PWA: INSTALACIÓN Y ACTUALIZACIÓN
// ==========================================
let deferredPrompt;
const installBanner = document.getElementById('installBanner');
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if(installBanner) installBanner.style.display = 'flex';
});

if(installBtn) {
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('Instalación:', outcome);
        deferredPrompt = null;
        if(installBanner) installBanner.style.display = 'none';
    });
}

if ('serviceWorker' in navigator) {
    // Recargar si hay una nueva versión del Service Worker
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
    });

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('✅ SW registrado'))
            .catch(err => console.log('❌ Error SW:', err));
    });
}
// ==========================================
// 12. BOTÓN DE RE-HIDRATACIÓN MANUAL
// ==========================================
const hydrateBtn = document.getElementById('hydrateBtn');

if (hydrateBtn) {
    hydrateBtn.addEventListener('click', async () => {
        // Efecto visual de rotación
        hydrateBtn.style.transform = 'rotate(360deg) scale(0.9)';

        // 1. Borrar memoria local (tema, estados)
        localStorage.clear();
        sessionStorage.clear();

        // 2. Borrar la caché del Service Worker (Fuerza la recarga)
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            for (const name of cacheNames) {
                await caches.delete(name);
            }
        }

        // 3. Desregistrar el Service Worker viejo
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.unregister();
            }
        }

        // 4. Recargar la página (Ahora descargará todo de nuevo de GitHub)
        window.location.reload();
    });
}
