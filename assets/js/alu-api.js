/* ──────────────────────────────────────────────────────────────
   SIARHA · alu-api.js
   Utilidades de sesión y fetch para páginas ALU_*.html.

   REQUIERE: api.js cargado ANTES (comparte API_BASE y showToast).
   En páginas ALU_*.html cargar en este orden:
     <script src="../assets/js/api.js"></script>
     <script src="../assets/js/alu-api.js"></script>
     <script src="../assets/js/alu-guard.js"></script>
   ────────────────────────────────────────────────────────────── */
// API_BASE viene de api.js — no se redeclara aquí

// ── Sesión ────────────────────────────────────────────────────
function getTokenAlu()  { return localStorage.getItem('token_alumno'); }
function getRolAlu()    { return localStorage.getItem('rol_alumno'); }  // siempre 'alumno'
function getAlumno() {
    const raw = localStorage.getItem('alumno_data');
    return raw ? JSON.parse(raw) : null;
}

function saveSessionAlu({ token, data }) {
    localStorage.setItem('rol_alumno',    'alumno');
    localStorage.setItem('token_alumno',  token);
    localStorage.setItem('alumno_data',   JSON.stringify(data));
}

function logoutAlu(redirectTo = '../index.html') {
    localStorage.removeItem('token_alumno');
    localStorage.removeItem('rol_alumno');
    localStorage.removeItem('alumno_data');
    if (redirectTo) window.location.href = redirectTo;
}

// ── Fetch autenticado ─────────────────────────────────────────
async function apiFetchAlu(url, options = {}) {
    const token = getTokenAlu();

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

    if (res.status === 401 && getTokenAlu()) {
        logoutAlu('../index.html');
        throw new Error('Sesión expirada.');
    }

    return res;
}

// ── Helper: nombre completo del alumno ────────────────────────
function nombreCompletoAlumno(alumno) {
    if (!alumno) return 'Alumno';
    const partes = [
        alumno.nombre_alum,
        alumno.apellido_p_alum,
        alumno.apellido_m_alum
    ].filter(Boolean);
    return partes.join(' ') || 'Alumno';
}

// ── Helper: etiqueta de programa ──────────────────────────────
function etiquetaPrograma(prog) {
    return prog === 'ss' ? 'Servicio Social'
         : prog === 'pp' ? 'Prácticas Profesionales'
         : 'Programa';
}
