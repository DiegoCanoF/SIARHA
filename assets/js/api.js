/* ──────────────────────────────────────────────────────────────
   SIARHA · api.js
   Utilidades compartidas para hablar con el backend.
   ────────────────────────────────────────────────────────────── */

const API_BASE = 'http://localhost:3000';

function getToken()   { return localStorage.getItem('token_admin'); }
function getRol()     { return localStorage.getItem('rol'); }
function getAdmin() {
    const raw = localStorage.getItem('admin_data');
    return raw ? JSON.parse(raw) : null;
}

function saveSession({ rol, token, data }) {
    localStorage.setItem('rol', rol);
    localStorage.setItem('token_admin', token);
    localStorage.setItem('admin_data', JSON.stringify(data));
}

function logout(redirectTo) {
    localStorage.removeItem('token_admin');
    localStorage.removeItem('rol');
    localStorage.removeItem('admin_data');
    if (redirectTo) window.location.href = redirectTo;
}

async function apiFetch(url, options = {}) {
    const token = getToken();

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

    if (res.status === 401 && getToken()) {
        logout('../index.html');
        throw new Error('Sesión expirada.');
    }

    return res;
}

function showToast(mensaje, tipo = 'info') {
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
        info:    { bg:'#501013', fg:'#fff' },
        success: { bg:'#1f6b3a', fg:'#fff' },
        error:   { bg:'#9b1c1c', fg:'#fff' }
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
    requestAnimationFrame(() => { t.style.opacity='1'; t.style.transform='translateY(0)'; });

    setTimeout(() => {
        t.style.opacity='0'; t.style.transform='translateY(-6px)';
        setTimeout(() => t.remove(), 250);
    }, 3000);
}
