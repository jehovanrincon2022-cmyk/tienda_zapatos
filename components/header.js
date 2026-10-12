// ============================================================
// HEADER COMPARTIDO - Carga el header en todas las páginas
// Incluye: Menú, Tema, Buscador, Conexión con JSONs
// ============================================================

(function() {
    // ============================================================
    // CARGAR EL HEADER.HTML EN TODAS LAS PÁGINAS
    // ============================================================
    const container = document.getElementById('header-container');
    if (!container) {
        console.warn('⚠️ No se encontró #header-container');
        return;
    }

    fetch('/tienda_zapatos/components/header.html')
        .then(res => {
            if (!res.ok) throw new Error('Error cargando header');
            return res.text();
        })
        .then(html => {
            container.innerHTML = html;
            inicializarHeader();
        })
        .catch(err => console.error('❌ Error cargando header:', err));


    // ============================================================
    // INICIALIZAR TODAS LAS FUNCIONES DEL HEADER
    // ============================================================
    function inicializarHeader() {
        console.log('✅ Header cargado correctamente');

        // ===== MENÚ HAMBURGUESA (MÓVIL) =====
        const menuToggle = document.querySelector('.menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }

        // ===== DROPDOWN EN MÓVIL =====
        document.querySelectorAll('.has-dropdown > a').forEach(link => {
            link.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const parent = this.parentElement;
                    document.querySelectorAll('.has-dropdown').forEach(item => {
                        if (item !== parent) item.classList.remove('active');
                    });
                    parent.classList.toggle('active');
                }
            });
        });

        // ===== BOTÓN DE TEMA (DARK/LIGHT) =====
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const body = document.body;
            const savedTheme = localStorage.getItem('theme') || 'dark';
            body.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);

            themeToggle.addEventListener('click', () => {
                const newTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                body.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateThemeIcon(newTheme);
            });
        }

        function updateThemeIcon(theme) {
            const icon = themeToggle.querySelector('i');
            if (icon) icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }

        // ===== BOTÓN DE BÚSQUEDA =====
        const searchTrigger = document.getElementById('searchTrigger');
        if (searchTrigger) {
            searchTrigger.addEventListener('click', () => {
                // Abrir el buscador
                if (typeof window.abrirBuscador === 'function') {
                    window.abrirBuscador();
                } else {
                    console.warn('⚠️ buscador.js no está cargado');
                }
            });
        }
    }


    // ============================================================
    // CARGAR DATOS DE PRODUCTOS (ZAPATOS + ROPA)
    // ============================================================
    window.cargarTodosLosProductos = async function() {
        try {
            console.log('📂 Cargando todos los productos...');
            
            const [resZapatos, resRopa] = await Promise.all([
                fetch('/tienda_zapatos/data/productos.json?v=' + Date.now()),
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

            // Guardar en variable global para que otros scripts la usen
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
    // BUSCAR PRODUCTO POR NOMBRE
    // ============================================================
    window.buscarProductoGlobal = function(nombre) {
        if (!window.productosData || window.productosData.length === 0) {
            console.warn('⚠️ No hay productos cargados aún');
            return null;
        }

        const nombreDecodificado = decodeURIComponent(nombre);
        
        let producto = window.productosData.find(p => p.nombre === nombreDecodificado);
        
        if (!producto) {
            producto = window.productosData.find(p => 
                p.nombre.toLowerCase().includes(nombreDecodificado.toLowerCase()) ||
                nombreDecodificado.toLowerCase().includes(p.nombre.toLowerCase())
            );
        }
        
        return producto;
    };


    // ============================================================
    // DETECTAR SI ES ROPA O ZAPATO
    // ============================================================
    window.esRopa = function(categoria) {
        const categoriasRopa = ['Camisetas', 'Pantalones', 'Chaquetas', 'Gorras', 'GYM'];
        return categoriasRopa.includes(categoria);
    };


    // ============================================================
    // AUTO-INICIALIZAR (si se necesita)
    // ============================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.cargarTodosLosProductos();
        });
    } else {
        window.cargarTodosLosProductos();
    }

})();