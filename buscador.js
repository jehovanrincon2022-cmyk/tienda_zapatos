/* ============================================
   BUSCADOR GLOBAL - SoleStyle
   Lee productos desde productos.json
   ============================================ */
(function() {
    'use strict';

    let CATALOGO = [];
    let catalogLoaded = false;

    // Normalizar texto (quita tildes, minúsculas)
    function normalize(text) {
        return (text || '').toString().toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    // Mapear categoría a key corta
    function calidadKey(categoria) {
        const c = normalize(categoria);
        if (c.includes('top')) return 'top';
        if (c.includes('triple')) return 'triple';
        if (c.includes('doble')) return 'doble';
        return 'top';
    }

    // Cargar productos.json
    function cargarCatalogo() {
        return fetch('productos.json')
            .then(res => {
                if (!res.ok) throw new Error('No se pudo cargar productos.json');
                return res.json();
            })
            .then(data => {
                const productos = (data.productos || data).map(p => ({
                    numero: p.numero,
                    name: p.nombre,
                    brand: p.marca || '',
                    price: p.precio,
                    quality: p.categoria || 'Top Quality',
                    qualityKey: calidadKey(p.categoria),
                    img: (p.imagenes && p.imagenes[0]) || '',
                    url: 'detalle.html?nombre=' + encodeURIComponent(p.nombre),
                    genero: p.genero || '',
                    material: p.material || ''
                }));
                CATALOGO = productos;
                catalogLoaded = true;
                console.log(`✅ Buscador: ${CATALOGO.length} productos cargados`);
                return CATALOGO;
            })
            .catch(err => {
                console.error('❌ Buscador:', err);
                catalogLoaded = true;
                return [];
            });
    }

    // Inicializar cuando el DOM esté listo
    function init() {
        const triggerBtn = document.getElementById('searchTrigger');
        if (!triggerBtn) return;

        // Crear overlay + panel si no existen
        if (!document.getElementById('searchOverlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'search-overlay';
            overlay.id = 'searchOverlay';
            document.body.appendChild(overlay);

            const panel = document.createElement('div');
            panel.className = 'search-panel';
            panel.id = 'searchPanel';
            panel.innerHTML = `
                <div class="search-panel-header">
                    <i class="fas fa-search"></i>
                    <input type="text" class="search-panel-input" id="searchPanelInput" placeholder="Buscar zapatos en toda la tienda..." autocomplete="off">
                    <button class="search-panel-close" id="searchPanelClose" aria-label="Cerrar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="search-results" id="searchResults"></div>
            `;
            document.body.appendChild(panel);
        }

        const overlay = document.getElementById('searchOverlay');
        const panel = document.getElementById('searchPanel');
        const input = document.getElementById('searchPanelInput');
        const closeBtn = document.getElementById('searchPanelClose');
        const resultsBox = document.getElementById('searchResults');

        let focusedIndex = -1;
        let currentResults = [];

        function openSearch() {
            overlay.classList.add('open');
            panel.classList.add('open');
            triggerBtn.classList.add('active');
            document.body.style.overflow = 'hidden';
            setTimeout(() => input.focus(), 250);
            renderResults('');
        }

        function closeSearch() {
            overlay.classList.remove('open');
            panel.classList.remove('open');
            triggerBtn.classList.remove('active');
            document.body.style.overflow = '';
            input.value = '';
            focusedIndex = -1;
        }

        function renderResults(query) {
            const q = normalize(query.trim());
            resultsBox.innerHTML = '';
            focusedIndex = -1;

            // Estado de carga
            if (!catalogLoaded) {
                resultsBox.innerHTML = `
                    <div class="search-empty">
                        <i class="fas fa-spinner fa-spin"></i>
                        <strong>Cargando catálogo...</strong>
                    </div>
                `;
                return;
            }

            // Estado vacío
            if (q === '') {
                resultsBox.innerHTML = `
                    <div class="search-empty">
                        <i class="fas fa-shoe-prints"></i>
                        <strong>Busca en toda la tienda 🔍</strong>
                        <small>Ejemplo: "Air Force One", "Jordan 4", "Yeezy"</small>
                    </div>
                `;
                currentResults = [];
                return;
            }

            // Filtrar
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
                        <small>Prueba: "Jordan", "Yeezy", "Dunk", "Air Max"</small>
                    </div>
                `;
                return;
            }

            // Contador
            const counter = document.createElement('div');
            counter.className = 'search-counter';
            counter.innerHTML = `<strong>${matches.length}</strong> ${matches.length === 1 ? 'resultado' : 'resultados'}`;
            resultsBox.appendChild(counter);

            // Items
            matches.forEach((p, i) => {
                const item = document.createElement('a');
                item.className = 'search-result-item';
                item.href = p.url;
                item.dataset.index = i;

                const imgHTML = p.img
                    ? `<img src="${p.img}" alt="${p.name}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-shoe-prints\\'></i>'">`
                    : `<i class="fas fa-shoe-prints"></i>`;

                item.innerHTML = `
                    <div class="search-result-thumb">${imgHTML}</div>
                    <div class="search-result-info">
                        <div class="search-result-name">${p.name}</div>
                        <div class="search-result-meta">
                            <span class="search-result-quality ${p.qualityKey}">${p.quality}</span>
                            <span class="search-result-price">${p.price}</span>
                        </div>
                    </div>
                `;
                resultsBox.appendChild(item);
            });
        }

        // Eventos
        triggerBtn.addEventListener('click', openSearch);
        overlay.addEventListener('click', closeSearch);
        closeBtn.addEventListener('click', closeSearch);

        input.addEventListener('input', (e) => {
            renderResults(e.target.value);
        });

        // Teclado
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

        function updateFocus(items) {
            items.forEach((it, i) => {
                it.classList.toggle('focused', i === focusedIndex);
            });
            if (items[focusedIndex]) {
                items[focusedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }

        // Cargar catálogo
        cargarCatalogo();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();