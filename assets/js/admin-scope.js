/* ──────────────────────────────────────────────────────────────
   SIARHA · admin-scope.js
   Helper compartido para páginas ADMIN_*.html
   - Catálogos (institutos, roles, programas)
   - requireAdmin(rolesPermitidos) — guardia por rol específico
   - aplicarScopeAdmin() — visibilidad por data-visible / data-programa
   - Helpers de formato

   REQUIERE: api.js cargado ANTES que este archivo.
   Usa getAdmin(), getRol(), getToken(), apiFetch() de api.js.

   Orden recomendado en cada página:
     <script src="../assets/js/api.js"></script>
     <script src="../assets/js/admin-guard.js"></script>
     <script src="../assets/js/admin-scope.js"></script>
   ────────────────────────────────────────────────────────────── */

// Validación temprana de dependencias
if (typeof getAdmin === 'undefined' || typeof apiFetch === 'undefined') {
    console.error('[admin-scope] api.js debe cargarse ANTES que admin-scope.js');
}

// ── CATÁLOGOS COMPARTIDOS ──────────────────────────────────────────
const INSTITUTOS_CAT = {
    'IDA':    'Instituto de Artes',
    'ICAP':   'Instituto de Ciencias Agropecuarias',
    'ICBI':   'Instituto de Ciencias Básicas e Ingeniería',
    'ICSa':   'Instituto de Ciencias de la Salud',
    'ICEA':   'Instituto de Ciencias Económico Administrativas',
    'ICSHu':  'Instituto de Ciencias Sociales y Humanidades',
    'ES-ACT': 'Escuela Superior de Actopan',
    'ES-APA': 'Escuela Superior de Apan',
    'ES-ATO': 'Escuela Superior de Atotonilco de Tula',
    'ES-SAH': 'Escuela Superior de Ciudad Sahagún',
    'ES-HUE': 'Escuela Superior de Huejutla',
    'ES-TEP': 'Escuela Superior de Tepeji del Río',
    'ES-TIZ': 'Escuela Superior de Tizayuca',
    'ES-TLA': 'Escuela Superior de Tlahuelilpan',
    'ES-ZIM': 'Escuela Superior de Zimapán'
};

const ROLES_LABEL = {
    'superadmin':     'Superadministrador',
    'admin_area':     'Admin de área',
    'admin_reportes': 'Coordinador de reportes'
};

const PROGRAMAS_LABEL = {
    'ss':    'Servicio Social',
    'pp':    'Prácticas Profesionales',
    'ambos': 'Ambos programas'
};

// Mapeo rol del FRONT (rol-card data-rol) ↔ rol del BACK
const ROL_FRONT_TO_BACK = {
    'superadmin': 'superadmin',
    'area':       'admin_area',
    'reportes':   'admin_reportes'
};
const ROL_BACK_TO_FRONT = {
    'superadmin':     'superadmin',
    'admin_area':     'area',
    'admin_reportes': 'reportes'
};

// ── GUARDIA: redirige si no es admin con el rol permitido ──────────
/**
 * Verifica sesión y, opcionalmente, que el rol esté en la lista permitida.
 * Si no, redirige y devuelve null. Si sí, devuelve el objeto admin.
 *
 *   const admin = requireAdmin(['superadmin']);   // solo superadmin
 *   const admin = requireAdmin();                  // cualquier admin con sesión
 */
function requireAdmin(rolesPermitidos = null) {
    const admin = getAdmin();
    if (!admin || getRol() !== 'admin') {
        logout('../index.html');
        return null;
    }
    if (rolesPermitidos && !rolesPermitidos.includes(admin.rol)) {
        if (typeof showToast === 'function') {
            showToast('No tienes permisos para acceder a esta sección.', 'error');
        } else {
            alert('No tienes permisos para acceder a esta sección.');
        }
        window.location.href = 'ADMIN_dashboard-servicio.html';
        return null;
    }
    return admin;
}

// ── APLICAR VISIBILIDAD POR ROL Y PROGRAMA ─────────────────────────
/**
 * Muestra/oculta elementos según rol y programa del admin.
 *
 *   <div data-visible="superadmin">Solo superadmin</div>
 *   <div data-visible="superadmin,admin_area">Ambos</div>
 *   <div data-programa="ss">Visible si maneja SS o ambos</div>
 */
function aplicarScopeAdmin(admin = null) {
    if (!admin) admin = getAdmin();
    if (!admin) return;

    // Visibilidad por rol
    document.querySelectorAll('[data-visible]').forEach(el => {
        const roles = el.dataset.visible.split(',').map(r => r.trim());
        el.style.display = roles.includes(admin.rol) ? '' : 'none';
    });

    // Visibilidad por programa
    document.querySelectorAll('[data-programa]').forEach(el => {
        const programas = el.dataset.programa.split(',').map(p => p.trim());
        const adminProgs = admin.programa === 'ambos'
            ? ['ss', 'pp', 'ambos']
            : [admin.programa, 'ambos'];
        const visible = programas.some(p => adminProgs.includes(p));
        el.style.display = visible ? '' : 'none';
    });

    // Badge de rol (si la página lo tiene)
    const rolNombre = document.getElementById('rolNombre');
    const rolBadge  = document.getElementById('rolBadge');
    if (rolNombre) rolNombre.textContent = ROLES_LABEL[admin.rol] || 'Administrador';
    if (rolBadge) {
        rolBadge.classList.remove('rol-superadmin', 'rol-area', 'rol-reportes');
        const cls = {
            superadmin:     'rol-superadmin',
            admin_area:     'rol-area',
            admin_reportes: 'rol-reportes'
        }[admin.rol];
        if (cls) rolBadge.classList.add(cls);
    }
}

// ── HELPERS DE FORMATO ─────────────────────────────────────────────
function rolBackToFront(rolBack)  { return ROL_BACK_TO_FRONT[rolBack] || rolBack; }
function rolFrontToBack(rolFront) { return ROL_FRONT_TO_BACK[rolFront] || rolFront; }

/**
 * Dado un nombre completo de instituto, devuelve su código corto (IDA, ICBI, ...).
 * Si no lo encuentra, devuelve el valor tal cual.
 */
function codigoDeInstituto(nombre) {
    return Object.keys(INSTITUTOS_CAT).find(k => INSTITUTOS_CAT[k] === nombre) || nombre;
}

/**
 * Genera iniciales para avatares ("Aldo González" → "AG").
 */
function iniciales(nombre, apellido_p = '') {
    const a = (nombre || '').trim().split(' ')[0] || '';
    const b = (apellido_p || '').trim().split(' ')[0] || '';
    return ((a[0] || '') + (b[0] || '')).toUpperCase() || '?';
}
