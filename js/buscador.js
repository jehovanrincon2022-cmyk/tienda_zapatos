/* ============================================
   BUSCADOR GLOBAL - JR SPORT SHOP
   Carga productos.json Y ropa.json
   Se activa cuando el header está cargado
   ============================================ */

(function() {
    'use strict';

    let CATALOGO = [];
    let catalogLoaded = false;
    let overlay, panel, input, closeBtn, resultsBox;
    let focusedIndex = -1;
    let currentResults = [];
    let triggerBtn;

    function normalize(text) {
        return (text || '').toString().toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    function calidadKey(categoria) {
        const c = normalize(categoria);
        if (c.includes('top')) return 'top';
        if (c.includes('triple')) return 'triple';
        if (c.includes('doble')) return 'doble';
        if (c.includes('gym')) return 'gym';
        if (c.includes('camiseta')) return 'camisetas';
        if (c.includes('pantalon')) return 'pantalones';
        if (c.includes('chaqueta')) return 'chaquetas';
        if (c.includes('gorra')) return 'gorras';
        return 'top';
    }

    async function cargarCatalogo() {
        try {
            console.log('📂 Buscador: Cargando catálogo completo...');
            
            const [resZapatos, resRopa] = await Promise.all([
                fetch('/tienda_zapatos/data/productos.json?v=' + Date.now()),
                fetch('/tienda_zapatos/data/ropa.json?v=' + Date.now())
            ]);

            let zapatos = [];
            let ropa = [];

            if (resZapatos.ok) {
                const dataZapatos = await resZapatos.json();
                zapatos = (dataZapatos.productos || []).map(p => ({
                    numero: p.numero,
                    name: p.nombre,
                    brand: p.marca || '',
                    price: p.precio,
                    quality: p.categoria || 'Top Quality',
                    qualityKey: calidadKey(p.categoria),
                    img: (p.imagenes && p.imagenes[0]) || '',
                    url: '/tienda_zapatos/zapatos/detalle.html?nombre=' + encodeURIComponent(p.nombre),
                    genero: p.genero || '',
                    material: p.material || '',
                    tipo: 'zapato'
                }));
            }

            if (resRopa.ok) {
                const dataRopa = await resRopa.json();
                ropa = (dataRopa.productos || []).map(p => ({
                    numero: p.numero,
                    name: p.nombre,
                    brand: p.marca || '',
                    price: p.precio,
                    quality: p.categoria || 'Ropa',
                    qualityKey: calidadKey(p.categoria),
                    img: (p.imagenes && p.imagenes[0]) || '',
                    url: '/tienda_zapatos/ropa/detalle_ropa.html?nombre=' + encodeURIComponent(p.nombre),
                    genero: p.genero || '',
                    material: p.material || '',
                    tipo: 'ropa'
                }));
            }

            CATALOGO = [...zapatos, ...ropa];
            catalogLoaded = true;
            console.log(`✅ Buscador: ${CATALOGO.length} productos cargados (${zapatos.length} zapatos + ${ropa.length} ropa)`);
            return CATALOGO;
        } catch (err) {
            console.error('❌ Buscador:', err);
            catalogLoaded = true;
            return [];
        }
    }

    function crearPanel() {
        if (document.getElementById('searchOverlay')) return;

        overlay = document.createElement('div');
        overlay.className = 'search-overlay';
        overlay.id = 'searchOverlay';
        document.body.appendChild(overlay);

        panel = document.createElement('div');
        panel.className = 'search-panel';
        panel.id = 'searchPanel';
        panel.innerHTML = `
            <div class="search-panel-header">
                <i class="fas fa-search"></i>
                <input type="text" class="search-panel-input" id="searchPanelInput" placeholder="Buscar en toda la tienda..." autocomplete="off">
                <button class="search-panel-close" id="searchPanelClose" aria-label="Cerrar">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="search-results" id="searchResults"></div>
        `;
        document.body.appendChild(panel);

        input = document.getElementById('searchPanelInput');
        closeBtn = document.getElementById('searchPanelClose');
        resultsBox = document.getElementById('searchResults');

        overlay.addEventListener('click', closeSearch);
        closeBtn.addEventListener('click', closeSearch);

        input.addEventListener('input', (e) => {
            renderResults(e.target.value);
        });

        document.addEventListener('keydown', (e) => {
            if (!panel.classList.contains('open')) return;
            const items = resultsBox.querySelectorAll('.search-result-item');

            if (e.key === 'Escape') {
                closeSearch();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (items.length === 0) return;
                focusedIndex = Math.min(focusedIndex + 1, items.length - 1);
                updateFocus(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (items.length === 0) return;
                focusedIndex = Math.max(focusedIndex - 1, 0);
                updateFocus(items);
            } else if (e.key === 'Enter') {
                if (focusedIndex >= 0 && items[focusedIndex]) {
                    e.preventDefault();
                    items[focusedIndex].click();
                }
            }
        });
    }

    function openSearch() {
        if (!panel) crearPanel();
        overlay.classList.add('open');
        panel.classList.add('open');
        if (triggerBtn) triggerBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => input.focus(), 250);
        renderResults('');
    }

    function closeSearch() {
        if (!panel) return;
        overlay.classList.remove('open');
        panel.classList.remove('open');
        if (triggerBtn) triggerBtn.classList.remove('active');
        document.body.style.overflow = '';
        input.value = '';
        focusedIndex = -1;
    }

    function renderResults(query) {
        const q = normalize(query.trim());
        resultsBox.innerHTML = '';
        focusedIndex = -1;

        if (!catalogLoaded) {
            resultsBox.innerHTML = `
                <div class="search-empty">
                    <i class="fas fa-spinner fa-spin"></i>
                    <strong>Cargando catálogo...</strong>
                </div>
            `;
            return;
        }

        if (q === '') {
            resultsBox.innerHTML = `
                <div class="search-empty">
                    <i class="fas fa-search"></i>
                    <strong>Busca en toda la tienda 🔍</strong>
                    <small>Ejemplo: "Air Force One", "Jordan 4", "Yeezy", "Camiseta"</small>
                </div>
            `;
            currentResults = [];
            return;
        }

        const matches = CATALOGO.filter(p => {
            const n = normalize(p.name);
            const b = normalize(p.brand);
            const qual = normalize(p.quality);
            const gen = normalize(p.genero);
            return n.includes(q) || b.includes(q) || qual.includes(q) || gen.includes(q);
        });

        currentResults = matches;

        if (matches.length === 0) {
            resultsBox.innerHTML = `
                <div class="search-empty">
                    <i class="fas fa-search"></i>
                    <strong>No encontramos "${query}" 😕</strong>
                    Intenta con otra palabra o revisa la ortografía
                    <small>Prueba: "Jordan", "Yeezy", "Dunk", "Camiseta"</small>
                </div>
            `;
            return;
        }

        const counter = document.createElement('div');
        counter.className = 'search-counter';
        counter.innerHTML = `<strong>${matches.length}</strong> ${matches.length === 1 ? 'resultado' : 'resultados'}`;
        resultsBox.appendChild(counter);

        matches.forEach((p, i) => {
            const item = document.createElement('a');
            item.className = 'search-result-item';
            item.href = p.url;
            item.dataset.index = i;

            const imgHTML = p.img
                ? `<img src="${p.img}" alt="${p.name}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-shoe-prints\\'></i>'">`
                : `<i class="fas fa-shoe-prints"></i>`;

            const iconoTipo = p.tipo === 'ropa' ? 'fa-tshirt' : 'fa-shoe-prints';

            item.innerHTML = `
                <div class="search-result-thumb">${imgHTML}</div>
                <div class="search-result-info">
                    <div class="search-result-name">
                        <i class="fas ${iconoTipo}" style="font-size:10px;opacity:0.5;margin-right:5px;"></i>
                        ${p.name}
                    </div>
                    <div class="search-result-meta">
                        <span class="search-result-quality ${p.qualityKey}">${p.quality}</span>
                        <span class="search-result-price">${p.price}</span>
                    </div>
                </div>
            `;
            resultsBox.appendChild(item);
        });
    }

    function updateFocus(items) {
        items.forEach((it, i) => {
            it.classList.toggle('focused', i === focusedIndex);
        });
        if (items[focusedIndex]) {
            items[focusedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    // ============================================================
    // API GLOBAL
    // ============================================================
    window.abrirBuscador = function() {
        if (!panel) crearPanel();
        openSearch();
    };

    window.cerrarBuscador = closeSearch;

    // ============================================================
    // INICIALIZAR
    // ============================================================
    async function init() {
        // Crear el panel inmediatamente
        crearPanel();
        
        // Cargar el catálogo
        await cargarCatalogo();
        
        console.log('✅ Buscador listo');
    }

    // Exponer función global para que header.js pueda llamarla
    window.iniciarBuscador = init;

    // Auto-inicializar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();