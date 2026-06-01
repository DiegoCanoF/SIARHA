/* ──────────────────────────────────────────────────────────────
   SIARHA · admin-guard.js
   Para páginas ADMIN_*.html que viven dentro de /pages/.
   Requiere: api.js cargado ANTES que este archivo.
   ────────────────────────────────────────────────────────────── */

(function () {
    const token = getToken();
    const rol   = getRol();

    if (!token || rol !== 'admin') {
        logout('../index.html');
        return;
    }

    // Páginas permitidas para admin_reportes
    // (solo su dashboard de reportes y mensajes)
    const PAGINAS_REPORTES = [
        'ADMIN_dashboard-reportes.html',
        'ADMIN_reportes-globales.html',
        'ADMIN_mensajes-admin.html'
    ];

    // Redirigir admin_reportes si intenta entrar a una página no permitida
    const paginaActual = window.location.pathname.split('/').pop();
    const admin = getAdmin();

    if (admin && admin.rol === 'admin_reportes') {
        const permitida = PAGINAS_REPORTES.some(p => paginaActual === p || paginaActual === '');
        if (!permitida) {
            window.location.href = 'ADMIN_dashboard-reportes.html';
            return;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!admin) return;

        const nombre = admin.nombre_admin || 'Administrador';

        // 1) Navbar superior: <span>Administrador</span>
        document.querySelectorAll('.navbar-custom span').forEach(el => {
            if (el.textContent.trim() === 'Administrador') {
                el.textContent = nombre;
            }
        });

        // 2) Offcanvas: <div>Administrador</div>
        document.querySelectorAll('.offcanvas-custom div').forEach(el => {
            if (el.textContent.trim() === 'Administrador') {
                el.textContent = nombre;
            }
        });

        // 3) Conectar "Cerrar sesión"
        document.querySelectorAll('a.nav-link.danger').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                logout('../index.html');
            });
        });

        // 4) Aplicar visibilidad por rol en TODOS los elementos con data-visible
        const rolBack = admin.rol; // 'superadmin' | 'admin_area' | 'admin_reportes'

        document.querySelectorAll('[data-visible]').forEach(el => {
            const roles = el.dataset.visible.split(',').map(r => r.trim());
            el.style.display = roles.includes(rolBack) ? '' : 'none';
        });
    });
})();
