/**
 * Subham Sarangi — Portfolio
 * main.js — Cursor, Glitch, Portrait, Scroll, Interactions
 */

document.addEventListener('DOMContentLoaded', () => {

    // ── PAGE LOAD ──────────────────────────────────────────
    document.body.classList.add('page-loaded');

    // ── CUSTOM CURSOR ──────────────────────────────────────
    const cursor = document.getElementById('cursor');
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    if (!isTouch && cursor) {
        let mx = 0, my = 0, cx = 0, cy = 0;
        document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
        (function animateCursor() {
            cx += (mx - cx) * 0.12;
            cy += (my - cy) * 0.12;
            cursor.style.left = cx + 'px';
            cursor.style.top = cy + 'px';
            requestAnimationFrame(animateCursor);
        })();
        document.querySelectorAll('a, button, .work-card, .tech-item, .work-list-row').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }

    // ── NAV SCROLL ─────────────────────────────────────────
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.pageYOffset > 60);
    }, { passive: true });

    // ── MOBILE MENU ────────────────────────────────────────
    const toggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            const open = navLinks.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open);
        });
        navLinks.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                navLinks.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ── INTERSECTION OBSERVER ──────────────────────────────
    const ioOpts = { threshold: 0.08, rootMargin: '0px 0px -60px 0px' };

    const revealObs = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
        });
    }, ioOpts);
    document.querySelectorAll('.section-reveal').forEach(el => revealObs.observe(el));

    // Stagger helpers
    function stagger(selector) {
        const el = document.querySelector(selector);
        if (!el) return;
        el.classList.add('stagger-children');
        Array.from(el.children).forEach((child, index) => {
            child.style.setProperty('--stagger-index', index);
        });
        const obs = new IntersectionObserver((entries, o) => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); o.unobserve(e.target); } });
        }, ioOpts);
        obs.observe(el);
    }
    stagger('.experience-list');
    stagger('.tech-stack-list');
    stagger('.work-list');

    // ── GLITCH EFFECT ──────────────────────────────────────
    const glitchEls = document.querySelectorAll('.glitch-text');
    function triggerGlitch() {
        if (!glitchEls.length) return;
        const el = glitchEls[Math.floor(Math.random() * glitchEls.length)];
        el.classList.add('glitching');
        setTimeout(() => el.classList.remove('glitching'), 180);
    }
    (function scheduleGlitch() {
        setTimeout(() => {
            if (Math.random() > 0.25) triggerGlitch();
            scheduleGlitch();
        }, 3000 + Math.random() * 3000);
    })();

    // ── CANVAS PORTRAIT WITH REAL PHOTO ────────────────────
    const canvas = document.getElementById('portrait-canvas');
    if (false && canvas) {
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;

        const img = new Image();
        img.onload = () => {
            // Draw source image into offscreen canvas for pixel sampling
            const off = document.createElement('canvas');
            off.width = W; off.height = H;
            const octx = off.getContext('2d');

            // Crop to portrait — center square from top
            const aspect = img.naturalWidth / img.naturalHeight;
            let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
            if (aspect > 0.8) {
                sw = img.naturalHeight * 0.8;
                sx = (img.naturalWidth - sw) / 2;
            }
            octx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);

            const imgData = octx.getImageData(0, 0, W, H).data;

            // Clear main canvas
            ctx.fillStyle = '#040404';
            ctx.fillRect(0, 0, W, H);

            const cols = 52, rows = 66;
            const cw = W / cols, ch = H / rows;
            const chars = ['█', '▓', '▒', '░', '■', '▪', '●', '◆', '▲', '▼', '◉', '◎', '□', '○'];

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    // Sample pixel from source
                    const px = Math.floor((col / cols) * W);
                    const py = Math.floor((row / rows) * H);
                    const idx = (py * W + px) * 4;
                    const r = imgData[idx], g = imgData[idx + 1], b = imgData[idx + 2];
                    const lum = 0.299 * r + 0.587 * g + 0.114 * b; // luminance

                    const char = chars[Math.floor((1 - lum / 255) * (chars.length - 1))];
                    const hasChroma = Math.random() > 0.85;

                    let color;
                    const rand = Math.random();
                    if (rand > 0.80) {
                        // RGB glitch accent
                        color = `hsl(${rand > 0.9 ? 0 : 180}, 90%, ${lum / 255 * 55 + 8}%)`;
                    } else if (rand > 0.65) {
                        color = `hsl(120, 60%, ${lum / 255 * 45 + 6}%)`;
                    } else {
                        color = `hsl(0,0%,${lum / 255 * 75 + 5}%)`;
                    }

                    ctx.font = `${ch * 1.15}px monospace`;

                    if (hasChroma) {
                        ctx.fillStyle = `rgba(255,30,30,0.55)`;
                        ctx.fillText(char, col * cw - 2, row * ch);
                        ctx.fillStyle = `rgba(0,255,255,0.55)`;
                        ctx.fillText(char, col * cw + 2, row * ch);
                    }

                    ctx.fillStyle = color;
                    ctx.fillText(char, col * cw, row * ch);
                }
            }

            // Horizontal glitch scanlines
            for (let i = 0; i < 12; i++) {
                const gy = Math.floor(Math.random() * H * 0.85);
                const gh = Math.floor(Math.random() * 3) + 1;
                const shift = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 8 + 2);
                try {
                    const slice = ctx.getImageData(0, gy, W, gh);
                    ctx.putImageData(slice, shift, gy);
                } catch (e) { }
                ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.06 + 0.01})`;
                ctx.fillRect(0, gy, W, gh);
            }

            // Vertical color bleed
            for (let i = 0; i < 5; i++) {
                const vx = Math.floor(Math.random() * W);
                ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 0},${Math.random() > 0.5 ? 100 : 255},${Math.random() > 0.5 ? 255 : 50},0.06)`;
                ctx.fillRect(vx, 0, Math.random() * 3 + 1, H);
            }
        };
        img.src = document.getElementById('portrait-src').dataset.src;
    }

    // ── SMOOTH ANCHOR SCROLL ───────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                const offset = (nav ? nav.offsetHeight : 0) + 20;
                window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - offset, behavior: 'smooth' });
            }
        });
    });

});