

function isMobileDevice() {
    return window.innerWidth <= 768;
}

// Habilitar scroll horizontal en el grid en móviles
function enableGridScroll() {
    const grid = document.getElementById('grid');
    if (!grid) return;
    
    if (isMobileDevice()) {
        grid.style.overflowX = 'auto';
        grid.style.overflowY = 'hidden';
    }
}

// Ajustar canvas cuando se hace toggle del horario
const originalToggleSchedule = window.toggleSchedule || function() {};

window.toggleSchedule = function() {
    scheduleVisible = !scheduleVisible;
    const drawer = document.getElementById('schedule-drawer');
    const canvas = document.getElementById('canvas-container');
    const text = document.getElementById('btn-text');
    
    if (!scheduleVisible) {
        drawer.style.height = '0';
        canvas.style.height = 'calc(100% - 50px)';
        text.innerHTML = 'Restaurar horarios';
    } else {
        drawer.style.height = '280px';
        canvas.style.height = 'calc(100% - 330px)';
        text.innerHTML = 'Maximizar 3D';
    }
    
    setTimeout(() => {
        if (renderer && camera) {
            const newHeight = scheduleVisible 
                ? window.innerHeight - 330 
                : window.innerHeight - 50;
            camera.aspect = window.innerWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, newHeight);
        }
    }, 400);
};

// Ajustar grid cuando cambia de tamaño
window.addEventListener('resize', () => {
    if (renderer && camera) {
        const newHeight = window.innerHeight - (scheduleVisible ? 330 : 50);
        if (newHeight > 100) {
            camera.aspect = window.innerWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, newHeight);
        }
    }
    enableGridScroll();
});

// Ejecutar al cargar
window.addEventListener('load', () => {
    setTimeout(enableGridScroll, 100);
});
