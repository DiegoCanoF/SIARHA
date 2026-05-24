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

    document.addEventListener('DOMContentLoaded', () => {
        const admin = getAdmin();
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
    });
})();
