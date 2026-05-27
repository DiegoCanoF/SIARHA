/* ──────────────────────────────────────────────────────────────
   SIARHA · ur-api.js
   Utilidades de sesión y fetch para páginas UR_*.html.

   REQUIERE: api.js cargado ANTES (comparte API_BASE y showToast).
   En páginas UR_*.html cargar en este orden:
     <script src="../assets/js/api.js"></script>
     <script src="../assets/js/ur-api.js"></script>
     <script src="../assets/js/ur-guard.js"></script>
   ────────────────────────────────────────────────────────────── */
// API_BASE viene de api.js — no se redeclara aquí

// ── Sesión ────────────────────────────────────────────────────
function getTokenUR() { return localStorage.getItem('token_ur'); }
function getRolUR()   { return localStorage.getItem('rol_ur'); }   // siempre 'ur'
function getUR() {
    const raw = localStorage.getItem('ur_data');
    return raw ? JSON.parse(raw) : null;
}

function saveSessionUR({ token, data }) {
    localStorage.setItem('rol_ur',    'ur');
    localStorage.setItem('token_ur',  token);
    localStorage.setItem('ur_data',   JSON.stringify(data));
}

function logoutUR(redirectTo = '../index.html') {
    localStorage.removeItem('token_ur');
    localStorage.removeItem('rol_ur');
    localStorage.removeItem('ur_data');
    if (redirectTo) window.location.href = redirectTo;
}

// ── Fetch autenticado ─────────────────────────────────────────
async function apiFetchUR(url, options = {}) {
    const token = getTokenUR();

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    let res;
    try {
        res = await fetch(`${API_BASE}${url}`, { ...options, headers });
    } catch (err) {
        throw new Error('No se pudo conectar con el servidor.');
    }

    if (res.status === 401 && getTokenUR()) {
        logoutUR('../index.html');
        throw new Error('Sesión expirada.');
    }

    return res;
}

// ── Toast (mismo estilo que api.js) ───────────────────────────
function showToastUR(mensaje, tipo = 'info') {
    let cont = document.getElementById('siarha-toast-container');
    if (!cont) {
        cont = document.createElement('div');
        cont.id = 'siarha-toast-container';
        cont.style.cssText = `
            position:fixed;top:1rem;right:1rem;z-index:9999;
            display:flex;flex-direction:column;gap:.5rem;
        `;
        document.body.appendChild(cont);
    }

    const colores = {
        info:    { bg: '#501013', fg: '#fff' },
        success: { bg: '#1f6b3a', fg: '#fff' },
        error:   { bg: '#9b1c1c', fg: '#fff' }
    };
    const c = colores[tipo] || colores.info;

    const t = document.createElement('div');
    t.textContent = mensaje;
    t.style.cssText = `
        background:${c.bg};color:${c.fg};
        padding:.75rem 1rem;border-radius:10px;
        font-family:'Plus Jakarta Sans',sans-serif;font-size:.88rem;
        box-shadow:0 4px 16px rgba(0,0,0,.18);
        opacity:0;transform:translateY(-6px);
        transition:opacity .25s,transform .25s;
        max-width:340px;
    `;
    cont.appendChild(t);
    requestAnimationFrame(() => {
        t.style.opacity = '1';
        t.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateY(-6px)';
        setTimeout(() => t.remove(), 250);
    }, 3000);
}

// showToast ya viene de api.js — no se redeclara aquí
