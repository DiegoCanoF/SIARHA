/* ──────────────────────────────────────────────────────────────
   SIARHA · alu-guard.js
   Guard de sesión para páginas ALU_*.html (viven en /pages/).
   REQUIERE: alu-api.js cargado ANTES que este archivo.

   Lo que hace:
   1. Verifica que haya token y rol de alumno en localStorage.
      Si no → redirige al login.
   2. En DOMContentLoaded:
      - Rellena el nombre del alumno en navbar, offcanvas y
        encabezados de página (reemplaza el hardcoded "Juan Pérez").
      - Muestra el programa (SS / PP) donde corresponda.
      - Conecta el enlace "Cerrar sesión" para limpiar sesión
        correctamente.
   ────────────────────────────────────────────────────────────── */

(function () {
    const token = getTokenAlu();
    const rol   = getRolAlu();

    // Si no hay sesión de alumno → al login
    if (!token || rol !== 'alumno') {
        logoutAlu('../index.html');
        return;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const alumno = getAlumno();
        if (!alumno) return;

        const nombre     = nombreCompletoAlumno(alumno);
        const nombreCorto = [alumno.nombre_alum, alumno.apellido_p_alum]
                                .filter(Boolean).join(' ') || 'Alumno';
        const prog       = etiquetaPrograma(alumno.programa);

        // ── 1. Nombre en navbar superior ──────────────────────
        const navSpan = document.getElementById('nombreAlumnoNav');
        if (navSpan) navSpan.textContent = nombreCorto;

        // Fallback genérico (cualquier span con "Juan Pérez")
        document.querySelectorAll('.navbar-custom span').forEach(el => {
            if (el.textContent.trim() === 'Juan Pérez') {
                el.textContent = nombreCorto;
            }
        });

        // ── 2. Nombre en offcanvas ────────────────────────────
        document.querySelectorAll('.offcanvas-custom div').forEach(el => {
            if (el.textContent.trim() === 'Juan Pérez') {
                el.textContent = nombreCorto;
            }
        });

        // ── 3. Programa en offcanvas ──────────────────────────
        document.querySelectorAll('.offcanvas-custom div').forEach(el => {
            if (el.textContent.trim() === 'Prácticas Profesionales' ||
                el.textContent.trim() === 'Servicio Social') {
                el.textContent = prog;
            }
        });

        // ── 4. Nombre en encabezado de página ─────────────────
        const h = document.getElementById('nombreAlumno');
        if (h) h.textContent = nombreCorto;

        // Nombre completo donde se muestre así
        document.querySelectorAll('[id*="nombreCompleto"]').forEach(el => {
            el.textContent = nombre;
        });

        // ── 5. Badge de programa ──────────────────────────────
        const badgeProg = document.querySelector('.badge-programa');
        if (badgeProg && badgeProg.textContent.trim() !== prog) {
            badgeProg.textContent = prog;
        }

        // ── 6. Conectar "Cerrar sesión" ───────────────────────
        document.querySelectorAll('a.nav-link.danger').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                logoutAlu('../index.html');
            });
        });
    });
})();
