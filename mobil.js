
// Detectar si es dispositivo móvil
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
        || window.innerWidth <= 768;
}

// Ajustar el layout según el dispositivo
function adjustLayoutForMobile() {
    const canvas = document.getElementById('canvas-container');
    const drawer = document.getElementById('schedule-drawer');
    
    if (isMobileDevice()) {
        // En móviles: reducir altura del 3D
        if (canvas) canvas.style.height = 'calc(100% - 280px)';
        if (drawer) drawer.style.height = '140px';
    } else {
        // En desktop: layout original
        if (canvas) canvas.style.height = 'calc(100% - 330px)';
        if (drawer) drawer.style.height = '280px';
    }
}

// Optimizar la tabla para móviles (mostrar solo 4-5 columnas en lugar de 7)
function optimizeGridForMobile() {
    const grid = document.getElementById('grid');
    if (!grid) return;
    
    if (isMobileDevice()) {
        // Ocultar columnas de fin de semana en móviles
        const children = grid.children;
        for (let i = 0; i < children.length; i++) {
            // Cada fila tiene 8 celdas (hora + 7 días)
            // Ocultar sábado (columna 7) y domingo (columna 8)
            if ((i % 8 === 7) || (i % 8 === 0 && i > 0)) {
                // Ajustar: Mostrar columnas 1-5 (Lunes a Viernes)
                if (i % 8 >= 6) {
                    children[i].style.display = 'none';
                }
            }
        }
    }
}

// Ajustar tamaño de fuente dinámicamente
function adjustFontSizeForMobile() {
    const root = document.documentElement;
    
    if (isMobileDevice()) {
        root.style.fontSize = '12px';
    } else {
        root.style.fontSize = '16px';
    }
}

// Detectar cambios de orientación
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        adjustLayoutForMobile();
        if (renderer && camera) {
            const newHeight = window.innerHeight - 280;
            camera.aspect = window.innerWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, newHeight);
        }
    }, 100);
});

// Detectar cambios de tamaño de ventana
window.addEventListener('resize', () => {
    if (renderer && camera) {
        const isNowMobile = isMobileDevice();
        const currentHeight = window.innerHeight;
        const scheduleHeight = isNowMobile ? 140 : 280;
        const canvasHeight = currentHeight - scheduleHeight - 50; // 50px para nav
        
        if (canvasHeight > 100) { // Asegurar que hay altura mínima
            camera.aspect = window.innerWidth / canvasHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, canvasHeight);
        }
    }
});

// Mejorar el toggle de schedule para móviles
const originalToggleSchedule = window.toggleSchedule;
window.toggleSchedule = function() {
    scheduleVisible = !scheduleVisible;
    const drawer = document.getElementById('schedule-drawer');
    const canvas = document.getElementById('canvas-container');
    const text = document.getElementById('btn-text');
    
    if (isMobileDevice()) {
        // Comportamiento especial para móviles
        if (!scheduleVisible) {
            drawer.style.height = '0';
            canvas.style.height = 'calc(100% - 50px)';
            text.innerHTML = 'Restaurar horarios';
        } else {
            drawer.style.height = '140px'; // Altura reducida para móviles
            canvas.style.height = 'calc(100% - 190px)';
            text.innerHTML = 'Maximizar 3D';
        }
    } else {
        // Comportamiento original para desktop
        if (!scheduleVisible) {
            drawer.style.height = '0';
            canvas.style.height = 'calc(100% - 50px)';
            text.innerHTML = 'Restaurar horarios';
        } else {
            drawer.style.height = '280px';
            canvas.style.height = 'calc(100% - 330px)';
            text.innerHTML = 'Maximizar 3D';
        }
    }
    
    // Reajustar cámara después de la transición
    setTimeout(() => {
        const newHeight = isMobileDevice() 
            ? (scheduleVisible ? window.innerHeight - 190 : window.innerHeight - 50)
            : (scheduleVisible ? window.innerHeight - 330 : window.innerHeight - 50);
        
        camera.aspect = window.innerWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, newHeight);
    }, 400);
};

// Ejecutar ajustes al cargar
window.addEventListener('load', () => {
    setTimeout(() => {
        adjustLayoutForMobile();
        adjustFontSizeForMobile();
        optimizeGridForMobile();
    }, 100);
});

// Ejecutar también después de init3D
const originalInit3D = window.init3D;
window.init3D = function() {
    originalInit3D();
    adjustLayoutForMobile();
};