/* ──────────────────────────────────────────────────────────────
   SIARHA · ur-guard.js
   Guard de sesión para páginas UR_*.html (viven en /pages/).
   REQUIERE: ur-api.js cargado ANTES que este archivo.

   Lo que hace:
   1. Verifica que haya token y rol de UR en localStorage.
      Si no → redirige al login.
   2. En DOMContentLoaded:
      - Rellena el nombre de la UR en navbar y offcanvas.
      - Conecta el enlace "Cerrar sesión" para limpiar la sesión
        correctamente antes de redirigir al login.
   ────────────────────────────────────────────────────────────── */

(function () {
    const token = getTokenUR();
    const rol   = getRolUR();

    // Si no hay sesión UR → al login
    if (!token || rol !== 'ur') {
        logoutUR('../index.html');
        return;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const ur = getUR();
        if (!ur) return;

        const nombre = ur.nombre_ur || 'Unidad Receptora';

        // ── 1. Nombre en navbar superior ──────────────────────
        // Cubre id="nombreURNav" (dashboard) y cualquier <span>
        // dentro de .navbar-custom que diga "Hospital General"
        const navSpan = document.getElementById('nombreURNav');
        if (navSpan) navSpan.textContent = nombre;

        // Fallback genérico para otras páginas que no usen el id
        document.querySelectorAll('.navbar-custom span').forEach(el => {
            if (el.textContent.trim() === 'Hospital General') {
                el.textContent = nombre;
            }
        });

        // ── 2. Nombre en el offcanvas (menú lateral) ──────────
        const menuNombre = document.getElementById('nombreURMenu');
        if (menuNombre) menuNombre.textContent = nombre;

        // Fallback genérico para offcanvas
        document.querySelectorAll('.offcanvas-custom div').forEach(el => {
            if (el.textContent.trim() === 'Hospital General') {
                el.textContent = nombre;
            }
        });

        // ── 3. Nombre en el encabezado de página ──────────────
        // id="nombreUR" — presente en el dashboard
        const h = document.getElementById('nombreUR');
        if (h) h.textContent = nombre;

        // ── 4. Conectar "Cerrar sesión" ───────────────────────
        // Cualquier enlace con clase .danger que apunte al index
        document.querySelectorAll('a.nav-link.danger').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                logoutUR('../index.html');
            });
        });
    });
})();
