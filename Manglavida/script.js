// ============================================
// NAVEGACIÓN STICKY
// ============================================
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    }
});

// ============================================
// NAVEGACIÓN MÓVIL
// ============================================
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// ============================================
// SMOOTH SCROLL
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// CONTADOR ANIMADO - STATS BANNER
// ============================================
const animateCounter = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);
    
    const updateCounter = () => {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    };
    
    updateCounter();
};

const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = parseInt(entry.target.dataset.target);
            animateCounter(entry.target, target);
            statsObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.stat-number').forEach(stat => {
    statsObserver.observe(stat);
});

// ============================================
// ANIMACIONES ON SCROLL (AOS)
// ============================================
const aosObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
});

document.querySelectorAll('[data-aos]').forEach(element => {
    aosObserver.observe(element);
});

// ============================================
// ANIMACIÓN DE BARRAS - GRÁFICOS
// ============================================
const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bars = entry.target.querySelectorAll('.bar');
            bars.forEach((bar, index) => {
                setTimeout(() => {
                    bar.style.width = bar.getAttribute('style').match(/width:\s*(\d+%)/)[1];
                }, index * 200);
            });
            barObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

const barChart = document.querySelector('.bar-chart');
if (barChart) {
    barObserver.observe(barChart);
}

// ============================================
// MAPA INTERACTIVO CON LEAFLET
// ============================================

// Esperar a que Leaflet esté cargado
if (typeof L !== 'undefined') {
    // Inicializar el mapa centrado en Panamá
    const map = L.map('map', {
        center: [8.5380, -80.7821],
        zoom: 8,
        scrollWheelZoom: true
    });

    // Capa de mapa base
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);

    // Iconos personalizados para diferentes estados
    const iconoProtegido = L.icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
                <path fill="#52b788" d="M16 0c-5.5 0-10 4.5-10 10 0 10 10 24 10 24s10-14 10-24c0-5.5-4.5-10-10-10z"/>
                <circle fill="white" cx="16" cy="10" r="4"/>
            </svg>
        `),
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
    });

    const iconoAmenazado = L.icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
                <path fill="#fca311" d="M16 0c-5.5 0-10 4.5-10 10 0 10 10 24 10 24s10-14 10-24c0-5.5-4.5-10-10-10z"/>
                <circle fill="white" cx="16" cy="10" r="4"/>
            </svg>
        `),
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
    });

    const iconoRestauracion = L.icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
                <path fill="#0077b6" d="M16 0c-5.5 0-10 4.5-10 10 0 10 10 24 10 24s10-14 10-24c0-5.5-4.5-10-10-10z"/>
                <circle fill="white" cx="16" cy="10" r="4"/>
            </svg>
        `),
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
    });

    // Datos de manglares en Panamá
    const manglares = [
        {
            nombre: "Golfo de Montijo",
            lat: 7.6833,
            lng: -81.1667,
            tipo: "protegido",
            costa: "pacifico",
            tamanoHa: 12000,
            area: "~12,000 hectáreas",
            especies: "Mangle rojo, negro, blanco",
            descripcion: "Una de las áreas de manglar más extensas del Pacífico panameño. Hogar de especies amenazadas como el águila pescadora y el cocodrilo americano. Sitio Ramsar de importancia internacional.",
            amenazas: "Desarrollo costero moderado",
            imagen: "imagenes/golfodemontijo.jpg"
        },
        {
            nombre: "Bahía de Panamá",
            lat: 8.9333,
            lng: -79.5167,
            tipo: "amenazado",
            costa: "pacifico",
            tamanoHa: 8500,
            area: "~8,500 hectáreas",
            especies: "Mangle rojo, negro, blanco, botoncillo",
            descripcion: "Manglares urbanos cercanos a la Ciudad de Panamá. Sitio Ramsar reconocido internacionalmente. Críticos para la pesca artesanal y como filtro natural de contaminantes.",
            amenazas: "Expansión urbana, contaminación",
            imagen: "imagenes/bahiadepanama.jpg"
        },
        {
            nombre: "Archipiélago de Bocas del Toro",
            lat: 9.3333,
            lng: -82.2500,
            tipo: "protegido",
            costa: "caribe",
            tamanoHa: 15000,
            area: "~15,000 hectáreas",
            especies: "Mangle rojo, negro, blanco",
            descripcion: "Manglares caribeños con alta biodiversidad. Parte del Parque Nacional Marino Isla Bastimentos. Importante para el turismo ecológico.",
            amenazas: "Turismo no regulado",
            imagen: "imagenes/Archi bocas.jpg"
        },
        {
            nombre: "Golfo de San Miguel",
            lat: 8.0833,
            lng: -78.3333,
            tipo: "protegido",
            costa: "pacifico",
            tamanoHa: 30000,
            area: "~30,000 hectáreas",
            especies: "Mangle rojo, negro, blanco",
            descripcion: "La mayor extensión de manglares en Panamá. Sitio Ramsar oficial. Refugio vital para aves migratorias y especies marinas. Parte de la reserva de biosfera Darién.",
            amenazas: "Bajo nivel de amenaza",
            imagen: "imagenes/golfodesanmiguel.jpg"
        },
        {
            nombre: "Golfo de Chiriquí",
            lat: 8.0000,
            lng: -82.0000,
            tipo: "protegido",
            costa: "pacifico",
            tamanoHa: 50133,
            area: "~50,133 hectáreas",
            especies: "Mangle rojo, negro, blanco, botoncillo",
            descripcion: "Uno de los tres manglares más extensos del Pacífico panameño. Parte del Parque Nacional Marino Golfo de Chiriquí. Alta biodiversidad marina y cobertura boscosa bien conservada.",
            amenazas: "Pesca no regulada, cambio climático",
            imagen: "imagenes/Golfo de Chiriquí.jpg"
        },
        {
            nombre: "Damani-Guariviara",
            lat: 9.1000,
            lng: -81.8000,
            tipo: "protegido",
            costa: "caribe",
            tamanoHa: 16000,
            area: "~16,000 hectáreas",
            especies: "Mangle rojo, negro, blanco",
            descripcion: "Sitio Ramsar en la comarca Ngäbe-Buglé. Humedal costero de gran importancia para las comunidades indígenas locales. Ecosistema bien conservado con alta biodiversidad.",
            amenazas: "Presión por desarrollo, extracción no regulada",
            imagen: "imagenes/Damani-Guariviara (Ngäbe-Buglé).jpeg"
        },
        {
            nombre: "San San Pond Sak",
            lat: 9.4333,
            lng: -82.5000,
            tipo: "protegido",
            costa: "caribe",
            tamanoHa: 16125,
            area: "~16,125 hectáreas",
            especies: "Mangle rojo, negro, blanco",
            descripcion: "Sitio Ramsar en Bocas del Toro, declarado Parque Nacional en 2025. Hábitat crítico para el manatí antillano y la tortuga carey. Ecosistema caribeño de alta importancia ecológica.",
            amenazas: "Cambio climático, turismo no regulado",
            imagen: "imagenes/San San Pond Sak (Bocas del Toro).jpeg"
        },
        {
            nombre: "Complejo de Humedales de Matusagaratí",
            lat: 8.7000,
            lng: -77.8000,
            tipo: "protegido",
            costa: "pacifico",
            tamanoHa: 64750,
            area: "~64,750 hectáreas",
            especies: "Mangle rojo, negro, blanco y vegetación de humedal",
            descripcion: "El mayor humedal natural de Panamá y Sitio Ramsar. Ubicado en el Darién, es refugio de caimanes, manatíes y cientos de especies de aves. Mínima intervención humana.",
            amenazas: "Deforestación en zonas adyacentes, cambio climático",
            imagen: "imagenes/Complejo de Humedales de Matusagaratí (Darién).jpeg"
        },
        {
            nombre: "Humedal Golfo de los Mosquitos",
            lat: 9.6167,
            lng: -79.3833,
            tipo: "protegido",
            costa: "caribe",
            tamanoHa: 7500,
            area: "~7,500 hectáreas",
            especies: "Mangle rojo, negro, blanco",
            descripcion: "Sitio Ramsar de importancia internacional. Crucial para aves playeras migratorias. Ecosistema bien conservado.",
            amenazas: "Bajo nivel de amenaza",
            imagen: "imagenes/humedaldelgolfodelosmosquitos.jpg"
        },
        {
            nombre: "Manglares de Pedasí",
            lat: 7.5500,
            lng: -80.0333,
            tipo: "amenazado",
            costa: "pacifico",
            tamanoHa: 2100,
            area: "~2,100 hectáreas",
            especies: "Mangle rojo, blanco, botoncillo",
            descripcion: "Manglares en zona de desarrollo turístico en Los Santos. Presión creciente por construcción de resorts.",
            amenazas: "Desarrollo turístico, fragmentación",
            imagen: "imagenes/pedasi.jpg"
        },
        {
            nombre: "Isla Coiba - Manglares",
            lat: 7.3667,
            lng: -81.7333,
            tipo: "protegido",
            costa: "pacifico",
            tamanoHa: 4500,
            area: "~4,500 hectáreas",
            especies: "Mangle rojo, negro, blanco",
            descripcion: "Manglares dentro del Parque Nacional Coiba, Patrimonio de la Humanidad UNESCO. Ecosistema prístino con mínima intervención humana.",
            amenazas: "Cambio climático",
            imagen: "imagenes/Islacoiba.jpeg"
        },
        {
            nombre: "Bahía de Chame",
            lat: 8.6167,
            lng: -79.8000,
            tipo: "restauracion",
            costa: "pacifico",
            tamanoHa: 6774,
            area: "~6,774 hectáreas (250 ha en restauración activa)",
            especies: "Mangle rojo, blanco",
            descripcion: "Proyecto oficial de MiAmbiente y PNUD para recuperar 250 hectáreas afectadas por tala ilegal. Entre 2012 y 2019 se perdieron 358.94 hectáreas. Se realizan capacitaciones comunitarias en ecoturismo y pesca artesanal.",
            amenazas: "Tala ilegal, extracción de carbón, erosión costera",
            imagen: "imagenes/bahiadechame.jpg"
        },
        {
            nombre: "Laguna de Chiriquí",
            lat: 9.1500,
            lng: -82.1000,
            tipo: "amenazado",
            costa: "caribe",
            tamanoHa: 11824,
            area: "~11,824 hectáreas",
            especies: "Mangle rojo, negro, blanco",
            descripcion: "La mayor cobertura de manglares de la costa caribeña panameña. Aunque está en Bocas del Toro, enfrenta presión creciente por acuicultura de camarón y desarrollo turístico no planificado.",
            amenazas: "Camaronicultura, turismo no regulado, contaminación",
            imagen: "imagenes/lagunadechiriqui.jpg"
        },
        {
            nombre: "Manglares de Guna Yala",
            lat: 9.5500,
            lng: -78.8000,
            tipo: "amenazado",
            costa: "caribe",
            tamanoHa: 3017,
            area: "~3,017 hectáreas",
            especies: "Mangle rojo, negro, blanco",
            descripcion: "Manglares en el archipiélago de San Blas, dentro de la comarca indígena Guna Yala. Amenazados por el aumento del nivel del mar y el desarrollo turístico. Las comunidades Guna dependen directamente de estos ecosistemas.",
            amenazas: "Aumento del nivel del mar, turismo, extracción de madera",
            imagen: "imagenes/gunayala.jpg"
        },
        {
            nombre: "Costa Arriba de Colón",
            lat: 9.6000,
            lng: -79.5000,
            tipo: "amenazado",
            costa: "caribe",
            tamanoHa: 1541,
            area: "~1,541 hectáreas",
            especies: "Mangle rojo, negro, blanco",
            descripcion: "Manglares del Caribe en la provincia de Colón. Afectados por la contaminación del tráfico marítimo del Canal de Panamá y el crecimiento urbano. Zona de alto riesgo de derrames de petróleo.",
            amenazas: "Contaminación por tráfico marítimo, expansión urbana, derrames",
            imagen: "imagenes/colon.jpg"
        },
        {
            nombre: "Río La Villa - Los Santos",
            lat: 7.7800,
            lng: -80.4200,
            tipo: "restauracion",
            costa: "pacifico",
            tamanoHa: 100,
            area: "~100 hectáreas (en reforestación activa)",
            especies: "Mangle rojo, negro",
            descripcion: "Proyecto de reforestación activo en la ribera del Río La Villa, respaldado por MiAmbiente y el programa Azuero Sostenible del PNUD. Área degradada por ganadería y agricultura que está siendo recuperada con participación comunitaria.",
            amenazas: "Anteriormente degradado por agricultura y ganadería",
            imagen: "imagenes/villa.png"
        }
    ];

    // Función para crear el contenido del popup
    function crearPopupContent(manglar) {
        return `
            <div style="min-width: 280px; max-width: 320px;">
                <img src="${manglar.imagen}" 
                     style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;"
                     alt="${manglar.nombre}">
                <h3 style="margin: 0 0 10px 0; color: #1a4d2e; font-size: 1.1rem;">${manglar.nombre}</h3>
                <div style="margin-bottom: 8px;">
                    <strong style="color: #2d6a4f;">📍 Extensión:</strong> ${manglar.area}
                </div>
                <div style="margin-bottom: 8px;">
                    <strong style="color: #2d6a4f;">🌳 Especies:</strong> ${manglar.especies}
                </div>
                <p style="margin: 10px 0; font-size: 0.9rem; line-height: 1.5; color: #495057;">
                    ${manglar.descripcion}
                </p>
                <div style="padding: 8px; background: #f8f9fa; border-radius: 6px; margin-top: 10px;">
                    <strong style="color: #e63946; font-size: 0.85rem;">⚠️ Amenazas:</strong>
                    <span style="font-size: 0.85rem; color: #495057;">${manglar.amenazas}</span>
                </div>
            </div>
        `;
    }

    // Crear marcadores y guardarlos con referencia al manglar
    const marcadores = manglares.map(manglar => {
        let icono;
        switch(manglar.tipo) {
            case 'protegido':   icono = iconoProtegido;   break;
            case 'amenazado':   icono = iconoAmenazado;   break;
            case 'restauracion': icono = iconoRestauracion; break;
        }
        const marker = L.marker([manglar.lat, manglar.lng], { icon: icono })
            .addTo(map)
            .bindPopup(crearPopupContent(manglar), { maxWidth: 350, className: 'custom-popup' });
        marker.on('mouseover', function() { this.openPopup(); });
        return { marker, manglar };
    });

    // Ajustar vista inicial
    const bounds = L.latLngBounds(manglares.map(m => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [50, 50] });

    // ============================================
    // SISTEMA DE FILTROS DEL MAPA
    // ============================================
    function getTamano(ha) {
        if (ha < 3000) return 'pequeno';
        if (ha <= 15000) return 'mediano';
        return 'grande';
    }

    let filtroActivo = { costa: 'todos', estado: 'todos', tamano: 'todos', busqueda: '' };

    function aplicarFiltros() {
        let visibles = 0;
        marcadores.forEach(({ marker, manglar }) => {
            const coincideCosta   = filtroActivo.costa   === 'todos' || manglar.costa === filtroActivo.costa;
            const coincideEstado  = filtroActivo.estado  === 'todos' || manglar.tipo  === filtroActivo.estado;
            const coincideTamano  = filtroActivo.tamano  === 'todos' || getTamano(manglar.tamanoHa) === filtroActivo.tamano;
            const coincideBusq    = filtroActivo.busqueda === '' ||
                manglar.nombre.toLowerCase().includes(filtroActivo.busqueda) ||
                manglar.especies.toLowerCase().includes(filtroActivo.busqueda);

            const mostrar = coincideCosta && coincideEstado && coincideTamano && coincideBusq;

            if (mostrar) {
                if (!map.hasLayer(marker)) marker.addTo(map);
                visibles++;
            } else {
                if (map.hasLayer(marker)) marker.remove();
            }
        });

        // Actualizar contador
        const contador = document.getElementById('contador-manglares');
        if (contador) contador.textContent = `${visibles} manglar${visibles !== 1 ? 'es' : ''}`;

        // Mostrar/ocultar mensaje sin resultados
        const sinResultados = document.getElementById('mapa-sin-resultados');
        if (sinResultados) sinResultados.style.display = visibles === 0 ? 'block' : 'none';

        // Ajustar vista a los visibles
        const visiblesCoords = marcadores
            .filter(({ marker }) => map.hasLayer(marker))
            .map(({ manglar }) => [manglar.lat, manglar.lng]);
        if (visiblesCoords.length > 0) {
            map.fitBounds(L.latLngBounds(visiblesCoords), { padding: [50, 50], maxZoom: 10 });
        }
    }

    // Botones filtro costa
    document.querySelectorAll('[data-filtro-costa]').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('[data-filtro-costa]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filtroActivo.costa = this.dataset.filtroCosta;
            aplicarFiltros();
        });
    });

    // Botones filtro estado
    document.querySelectorAll('[data-filtro-estado]').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('[data-filtro-estado]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filtroActivo.estado = this.dataset.filtroEstado;
            aplicarFiltros();
        });
    });

    // Botones filtro tamaño
    document.querySelectorAll('[data-filtro-tamano]').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('[data-filtro-tamano]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filtroActivo.tamano = this.dataset.filtroTamano;
            aplicarFiltros();
        });
    });

    // Input búsqueda por nombre
    const inputBuscar = document.getElementById('buscar-manglar');
    if (inputBuscar) {
        inputBuscar.addEventListener('input', function() {
            filtroActivo.busqueda = this.value.trim().toLowerCase();
            aplicarFiltros();
        });
    }

    // Botón reset
    const btnReset = document.getElementById('reset-filtros');
    if (btnReset) {
        btnReset.addEventListener('click', function() {
            filtroActivo = { costa: 'todos', estado: 'todos', tamano: 'todos', busqueda: '' };
            if (inputBuscar) inputBuscar.value = '';
            document.querySelectorAll('[data-filtro-costa]').forEach(b => b.classList.toggle('active', b.dataset.filtroCosta === 'todos'));
            document.querySelectorAll('[data-filtro-estado]').forEach(b => b.classList.toggle('active', b.dataset.filtroEstado === 'todos'));
            document.querySelectorAll('[data-filtro-tamano]').forEach(b => b.classList.toggle('active', b.dataset.filtroTamano === 'todos'));
            aplicarFiltros();
        });
    }
}

// ============================================
// ESTILOS PERSONALIZADOS PARA POPUPS
// ============================================
const style = document.createElement('style');
style.textContent = `
    .custom-popup .leaflet-popup-content-wrapper {
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        padding: 0;
    }
    
    .custom-popup .leaflet-popup-content {
        margin: 15px;
        font-family: 'Work Sans', sans-serif;
    }
    
    .custom-popup .leaflet-popup-tip {
        background: white;
    }
    
    .leaflet-popup-close-button {
        font-size: 24px !important;
        padding: 8px 10px !important;
        color: #1a4d2e !important;
    }
    
    .leaflet-popup-close-button:hover {
        color: #e63946 !important;
    }
`;
document.head.appendChild(style);

// ============================================
// LAZY LOADING DE IMÁGENES
// ============================================
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add('loaded');
            imageObserver.unobserve(img);
        }
    });
});

document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
});

// ============================================
// CONSOLE INFO
// ============================================
console.log('%c🌿 Manglares de Panamá', 'color: #2d6a4f; font-size: 24px; font-weight: bold;');
console.log('%cProyecto educativo dedicado a la conservación de nuestros ecosistemas costeros', 'color: #495057; font-size: 14px;');
console.log('%cDesarrollado con 💚 para la conservación', 'color: #52b788; font-size: 12px;');

// ===================================
// BIBLIOTECA DE ESPECIES - FILTROS
// ===================================
document.addEventListener('DOMContentLoaded', function () {
    const filtrosBtns = document.querySelectorAll('.filtro-btn');
    const cards = document.querySelectorAll('.especie-card');

    filtrosBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Activar botón
            filtrosBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filtro = this.dataset.filtro;

            cards.forEach((card, i) => {
                const costa = card.dataset.costa;
                const visible = filtro === 'all' || costa === filtro;

                if (visible) {
                    card.classList.remove('hidden');
                    card.style.animationDelay = (i * 0.04) + 's';
                    card.style.animation = 'none';
                    void card.offsetWidth;
                    card.style.animation = 'fadeInCard 0.35s ease both';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // Ajuste de tooltip para cards cerca del borde derecho/izquierdo
    const animalChips = document.querySelectorAll('.animal-chip');
    animalChips.forEach(chip => {
        chip.addEventListener('mouseenter', function () {
            const tooltip = this.querySelector('.animal-tooltip');
            if (!tooltip) return;
            const rect = this.getBoundingClientRect();
            const tooltipWidth = 180;

            // Reset
            tooltip.style.left = '';
            tooltip.style.transform = '';

            if (rect.left < tooltipWidth / 2) {
                tooltip.style.left = '0';
                tooltip.style.transform = 'none';
            } else if (rect.right + tooltipWidth / 2 > window.innerWidth) {
                tooltip.style.left = 'auto';
                tooltip.style.right = '0';
                tooltip.style.transform = 'none';
            }
        });
    });
});