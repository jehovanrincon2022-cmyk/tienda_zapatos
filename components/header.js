// ============================================================
// HEADER COMPARTIDO - JR SPORT SHOP
// Carga el header, el buscador y los datos
// ============================================================

(function() {
    const container = document.getElementById('header-container');
    if (!container) {
        console.warn('⚠️ No se encontró #header-container');
        return;
    }

    // ============================================================
    // CARGAR EL HEADER.HTML
    // ============================================================
    fetch('/tienda_zapatos/components/header.html')
        .then(res => {
            if (!res.ok) throw new Error('Error cargando header');
            return res.text();
        })
        .then(html => {
            container.innerHTML = html;
            console.log('✅ Header HTML cargado');
            
            // Esperar un momento para que el DOM se actualice
            setTimeout(() => {
                inicializarHeader();
                inicializarBuscador(); // ← Inicializar el buscador después
            }, 100);
        })
        .catch(err => console.error('❌ Error cargando header:', err));


    // ============================================================
    // INICIALIZAR HEADER (MENÚ, TEMA)
    // ============================================================
    function inicializarHeader() {
        console.log('✅ Header inicializado');

        // ===== MENÚ HAMBURGUESA =====
        const menuToggle = document.querySelector('.menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }

        // ===== DROPDOWN MÓVIL =====
    document.querySelectorAll('.has-dropdown > a').forEach(link => {
    link.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            const parent = this.parentElement;
            // Primer toque: abre submenú. Segundo toque: navega.
            if (!parent.classList.contains('active')) {
                e.preventDefault();
                document.querySelectorAll('.has-dropdown').forEach(item => {
                    if (item !== parent) item.classList.remove('active');
                });
                parent.classList.add('active');
            }
        }
        // En PC (más de 768px) siempre navega normal ✅
    });
});

        // ===== TEMA DARK/LIGHT =====
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const body = document.body;
            const savedTheme = localStorage.getItem('theme') || 'dark';
            body.setAttribute('data-theme', savedTheme);
            
            const icon = themeToggle.querySelector('i');
            if (icon) icon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';

            themeToggle.addEventListener('click', () => {
                const newTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                body.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                const icon = themeToggle.querySelector('i');
                if (icon) icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
            });
        }
    }


    // ============================================================
    // INICIALIZAR BUSCADOR (después de que el header se cargue)
    // ============================================================
    function inicializarBuscador() {
        const searchTrigger = document.getElementById('searchTrigger');
        if (!searchTrigger) {
            console.warn('⚠️ No se encontró #searchTrigger');
            return;
        }

        // Si la función abrirBuscador existe, enganchar el botón
        searchTrigger.addEventListener('click', () => {
            if (typeof window.abrirBuscador === 'function') {
                window.abrirBuscador();
            } else {
                console.warn('⚠️ buscador.js no está cargado');
            }
        });

        console.log('✅ Botón de búsqueda enganchado');
    }


    // ============================================================
    // CARGAR PRODUCTOS (ZAPATOS + ROPA)
    // ============================================================
    window.cargarTodosLosProductos = async function() {
        try {
            console.log('📂 Cargando todos los productos...');
            
            const [resZapatos, resRopa] = await Promise.all([
                fetch('/tienda_zapatos/data/zapatos.json?v=' + Date.now()),
                fetch('/tienda_zapatos/data/ropa.json?v=' + Date.now())
            ]);

            let zapatos = [];
            let ropa = [];

            if (resZapatos.ok) {
                const dataZapatos = await resZapatos.json();
                zapatos = dataZapatos.productos || [];
                console.log(`✅ ${zapatos.length} zapatos cargados`);
            }

            if (resRopa.ok) {
                const dataRopa = await resRopa.json();
                ropa = dataRopa.productos || [];
                console.log(`✅ ${ropa.length} prendas cargadas`);
            }

            const todos = [...zapatos, ...ropa];
            console.log(`✅ Total: ${todos.length} productos`);

            window.productosData = todos;
            window.zapatosData = zapatos;
            window.ropaData = ropa;

            return todos;
        } catch (error) {
            console.error('❌ Error cargando productos:', error);
            return [];
        }
    };


    // ============================================================
    // AUTO-INICIALIZAR
    // ============================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.cargarTodosLosProductos();
        });
    } else {
        window.cargarTodosLosProductos();
    }

})();