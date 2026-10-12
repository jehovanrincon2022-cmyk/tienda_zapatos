// ====== DATOS DE ZAPATOS POR CATEGORÍA ======
const shoeData = {
    hombre: [
        {
            id: 1,
            name: "Urban Runner",
            price: 18500,
            description: "Zapatillas ultraligeras con tecnología de amortiguación avanzada.",
            icon: "fa-running",
            badge: "Nuevo"
        },
        {
            id: 2,
            name: "Executive Oxford",
            price: 22900,
            description: "Zapatos de vestir con acabado premium y suela de cuero.",
            icon: "fa-suitcase",
            badge: "Top Quality"
        },
        {
            id: 3,
            name: "Speed Pro",
            price: 25900,
            description: "Diseñados para máximo rendimiento en pista y calle.",
            icon: "fa-bolt",
            badge: "Oferta"
        },
        {
            id: 4,
            name: "Italian Leather",
            price: 32000,
            description: "Zapatos italianos de cuero genuino. Sofisticación y lujo.",
            icon: "fa-crown",
            badge: "Premium"
        },
        {
            id: 5,
            name: "Trail Blazer",
            price: 28000,
            description: "Botas de trail running con agarre extremo.",
            icon: "fa-mountain",
            badge: "Aventura"
        }
    ],
    
    mujer: [
        {
            id: 6,
            name: "Elegance Heel",
            price: 21000,
            description: "Tacones elegantes con diseño italiano.",
            icon: "fa-heart",
            badge: "Nuevo"
        },
        {
            id: 7,
            name: "Sporty Girl",
            price: 16500,
            description: "Zapatillas deportivas con estilo urbano.",
            icon: "fa-running",
            badge: "Oferta"
        },
        {
            id: 8,
            name: "Classic Flats",
            price: 14800,
            description: "Zapatos planos de cuero suave, ideales para el día a día.",
            icon: "fa-walking",
            badge: "Clásico"
        },
        {
            id: 9,
            name: "Stiletto Lux",
            price: 35000,
            description: "Tacones aguja de lujo con acabados en piel premium.",
            icon: "fa-crown",
            badge: "Top Quality"
        }
    ],
    
    niños: [
        {
            id: 10,
            name: "Kids Runner",
            price: 12000,
            description: "Zapatillas deportivas con suela antideslizante.",
            icon: "fa-child",
            badge: "Nuevo"
        },
        {
            id: 11,
            name: "Mini Classic",
            price: 9800,
            description: "Zapatos escolares clásicos, cómodos y duraderos.",
            icon: "fa-walking",
            badge: "Oferta"
        },
        {
            id: 12,
            name: "Adventure Kids",
            price: 13500,
            description: "Botas resistentes para aventuras al aire libre.",
            icon: "fa-mountain",
            badge: "Aventura"
        }
    ],
    
    accesorios: [
        {
            id: 13,
            name: "Premium Socks",
            price: 2500,
            description: "Calcetines de algodón premium con refuerzo.",
            icon: "fa-socks",
            badge: "Top Quality"
        },
        {
            id: 14,
            name: "Shoe Care Kit",
            price: 4500,
            description: "Kit completo para el cuidado de tus zapatos.",
            icon: "fa-tools",
            badge: "Esencial"
        },
        {
            id: 15,
            name: "Leather Belt",
            price: 6800,
            description: "Cinturón de cuero genuino con hebilla de acero.",
            icon: "fa-circle",
            badge: "Premium"
        }
    ],
    
    topquality: [
        {
            id: 16,
            name: "Masterpiece Oxford",
            price: 45000,
            description: "Zapatos hechos a mano con cuero de la mejor calidad.",
            icon: "fa-crown",
            badge: "⭐ Top Quality"
        },
        {
            id: 17,
            name: "Luxury Loafers",
            price: 38000,
            description: "Mocasines de lujo con piel de becerro italiano.",
            icon: "fa-crown",
            badge: "⭐ Top Quality"
        },
        {
            id: 18,
            name: "Premium Boots",
            price: 52000,
            description: "Botas de cuero premium con suela de cuero.",
            icon: "fa-crown",
            badge: "⭐ Top Quality"
        }
    ],
    
    triplea: [
        {
            id: 19,
            name: "A-Class Runner",
            price: 19000,
            description: "Calidad AAA en zapatillas deportivas.",
            icon: "fa-award",
            badge: "🔝 Triple A"
        },
        {
            id: 20,
            name: "A-Class Formal",
            price: 26000,
            description: "Zapatos formales con estándares de calidad AAA.",
            icon: "fa-award",
            badge: "🔝 Triple A"
        },
        {
            id: 21,
            name: "A-Class Casual",
            price: 22000,
            description: "Zapatos casuales con la mejor calidad garantizada.",
            icon: "fa-award",
            badge: "🔝 Triple A"
        }
    ]
};

// ====== ESTADO ======
let cartCount = 0;
let currentSection = 'inicio';

// ====== TEMA CLARO/OSCURO ======
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

const savedTheme = localStorage.getItem('theme') || 'dark';
body.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-sun';
    }
}

// ====== FUNCIÓN PARA RENDERIZAR CADA GRID ======
function renderGrid(category, containerId) {
    const container = document.getElementById(containerId);
    
    // Si el contenedor no existe, salir
    if (!container) {
        console.warn(`Contenedor ${containerId} no encontrado`);
        return;
    }
    
    const items = shoeData[category] || [];
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    if (items.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--text-secondary);">
                <i class="fas fa-box-open" style="font-size:48px;margin-bottom:20px;display:block;color:var(--accent);"></i>
                <h3 style="font-weight:300;letter-spacing:2px;">No hay productos en esta categoría</h3>
                <p style="margin-top:10px;opacity:0.6;">Pronto tendremos más novedades para ti</p>
            </div>
        `;
        return;
    }
    
    // Crear tarjetas
    items.forEach(shoe => {
        const card = document.createElement('div');
        card.className = 'shoe-card';
        
        // Normalizar el badge para clases CSS
        const badgeClass = shoe.badge.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        
        card.innerHTML = `
            <span class="badge-tag ${badgeClass}">${shoe.badge}</span>
            <i class="fas ${shoe.icon} shoe-icon"></i>
            <h3>${shoe.name}</h3>
            <p class="price">Bs. ${shoe.price.toLocaleString()}</p>
            <button class="btn-add" onclick="addToCart(${shoe.id}, '${category}')">
                <i class="fas fa-plus"></i> Agregar
            </button>
        `;
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-add')) {
                openModal(shoe.id, category);
            }
        });
        container.appendChild(card);
    });
}

// ====== INICIALIZAR TODOS LOS GRIDS ======
function initAllGrids() {
    console.log('Inicializando grids...');
    
    // Renderizar todas las categorías
    renderGrid('hombre', 'grid-hombre');
    renderGrid('mujer', 'grid-mujer');
    renderGrid('niños', 'grid-niños');
    renderGrid('accesorios', 'grid-accesorios');
    renderGrid('topquality', 'grid-topquality');
    renderGrid('triplea', 'grid-triplea');
    
    console.log('Grids inicializados correctamente');
}

// ====== NAVEGACIÓN ENTRE SECCIONES ======
function navigateTo(section) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section-page').forEach(el => {
        el.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(`section-${section}`);
    if (targetSection) {
        targetSection.classList.add('active');
    } else {
        console.warn(`Sección section-${section} no encontrada`);
        return;
    }
    
    // Actualizar enlaces del menú
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === section) {
            link.classList.add('active');
        }
    });
    
    currentSection = section;
    
    // Scroll al inicio de la sección
    setTimeout(() => {
        targetSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// ====== EVENTOS DE NAVEGACIÓN ======
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const section = this.dataset.section;
        navigateTo(section);
        
        // Cerrar menú móvil
        document.querySelector('.nav-links')?.classList.remove('active');
    });
});

// ====== CARRITO ======
function addToCart(shoeId, category) {
    cartCount++;
    document.getElementById('cart-count').textContent = cartCount;
    
    // Buscar el zapato en todas las categorías
    let shoe = null;
    for (const cat in shoeData) {
        const found = shoeData[cat].find(s => s.id === shoeId);
        if (found) { shoe = found; break; }
    }
    
    if (!shoe) return;
    
    const btn = event?.target?.closest('.btn-add');
    if (btn) {
        btn.textContent = '✓ Agregado';
        btn.style.borderColor = '#2ecc71';
        btn.style.color = '#2ecc71';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-plus"></i> Agregar';
            btn.style.borderColor = 'var(--accent)';
            btn.style.color = 'var(--accent)';
        }, 1500);
    }
}

// ====== MODAL ======
function openModal(shoeId, category) {
    // Buscar el zapato en todas las categorías
    let shoe = null;
    for (const cat in shoeData) {
        const found = shoeData[cat].find(s => s.id === shoeId);
        if (found) { shoe = found; break; }
    }
    
    if (!shoe) return;
    
    document.getElementById('modalTitle').textContent = shoe.name;
    document.getElementById('modalDescription').textContent = shoe.description;
    document.getElementById('modalPrice').textContent = `Bs. ${shoe.price.toLocaleString()}`;
    document.querySelector('.modal-image i').className = `fas ${shoe.icon}`;
    
    document.getElementById('shoeModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

document.querySelector('.close-modal')?.addEventListener('click', () => {
    document.getElementById('shoeModal').style.display = 'none';
    document.body.style.overflow = 'auto';
});

window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('shoeModal')) {
        document.getElementById('shoeModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// ====== MENÚ MÓVIL ======
document.querySelector('.menu-toggle')?.addEventListener('click', () => {
    document.querySelector('.nav-links')?.classList.toggle('active');
});

// ====== VIDEO CTA ======
document.querySelector('.btn-video-cta')?.addEventListener('click', () => {
    navigateTo('hombre');
});

// ====== INICIALIZAR CUANDO EL DOM ESTÉ LISTO ======
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando...');
    
    // Inicializar todos los grids
    initAllGrids();
    
    // Mostrar sección de inicio por defecto
    navigateTo('inicio');
    
    console.log('Inicialización completa');
});

// ====== RESPALDO: Inicializar si el DOM ya está cargado ======
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('DOM ya estaba cargado, inicializando...');
    initAllGrids();
    navigateTo('inicio');
}