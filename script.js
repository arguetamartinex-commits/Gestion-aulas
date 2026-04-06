// ==================== DATOS ====================
const scheduleData = [
    { id: 1, day: 1, time: 8, subject: 'Sistemas Digitales', room: 'CC-1', floor: 1, carrera: 'ing', teacher: 'gonzalez' },
    { id: 2, day: 2, time: 10, subject: 'Taller de Diseño', room: 'B-6', floor: 2, carrera: 'arq', teacher: 'perez' },
    { id: 3, day: 3, time: 8, subject: 'Cálculo Avanzado', room: 'C-2', floor: 3, carrera: 'ing', teacher: 'ruiz' }
];

const dayNames = {1:'LUNES',2:'MARTES',3:'MIÉRCOLES',4:'JUEVES',5:'VIERNES',6:'SÁBADO',7:'DOMINGO'};
const hours = [7,8,9,10,11,12,13,14,15,16,17,18,19];
const allRooms = ['CC-1','A-2','A-1','Biblioteca','Oficina','Baños','Cafeteria','CC-2','B-6','B-5','B-4','B-1','B-2','B-3','C-7','C-6','C-5','C-4','C-1','C-2','C-3'];

let scene, camera, renderer, controls, floorGroups = {}, roomMeshes = [];
let scheduleVisible = true;

// ==================== THREE.JS ====================
function init3D() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / (window.innerHeight - 280), 0.1, 1000);
    camera.position.set(38, 22, 42);

    camera.lookAt(0, 10, 0);

    renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    renderer.setSize(window.innerWidth, window.innerHeight - 280);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    controls.target.set(0, 10, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const light = new THREE.DirectionalLight(0x00f2ff, 1);
    light.position.set(20, 40, 20);
    scene.add(light);

    for(let i=1; i<=3; i++) createFloorModel(i);
    animate();
}

function createFloorModel(level) {
    const group = new THREE.Group();
    const yPos = (level - 1) * 8;
    const base = new THREE.Mesh(new THREE.BoxGeometry(18, 0.2, 26), new THREE.MeshPhongMaterial({color:0x1a1a1a, transparent:true, opacity:0.5}));
    base.position.y = yPos; group.add(base);

    const stairs = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 3), new THREE.MeshBasicMaterial({color:0xff3e3e}));
    stairs.position.set(0, yPos + 1, -11); group.add(stairs);

    const floorRooms = {
        1: {left:['CC-1','A-2','A-1'], right:['Biblioteca','Oficina','Baños','Cafeteria']},
        2: {left:['CC-2','B-6','B-5','B-4'], right:['B-1','B-2','B-3','Baños']},
        3: {left:['C-7','C-6','C-5','C-4'], right:['C-1','C-2','C-3','Baños']}
    };

    const rooms = floorRooms[level];
    rooms.left.forEach((name,i) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(5.5, 3.5, 5.5), new THREE.MeshPhongMaterial({color:0x004d40, transparent:true, opacity:0.7}));
        const zPos = level===1 ? (-8.5 + i*8.5) : (-9 + i*6);
        mesh.position.set(-6, yPos + 1.75, zPos);
        setupRoom(mesh, name, level, group);
    });
    rooms.right.forEach((name,i) => {
        let d = 5.5; if(name==='Biblioteca') d = 9;
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(5.5, 3.5, d), new THREE.MeshPhongMaterial({color:0x004d40, transparent:true, opacity:0.7}));
        const zPos = level===1 ? (-8.5 + i*6) : (-9 + i*6);
        mesh.position.set(6, yPos + 1.75, zPos);
        setupRoom(mesh, name, level, group);
    });

    scene.add(group);
    floorGroups[level] = group;
}

function setupRoom(mesh, name, level, group) {
    mesh.userData = {name, floor: level};
    const edges = new THREE.EdgesGeometry(mesh.geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color:0x00f2ff}));
    mesh.add(line);
    roomMeshes.push(mesh);
    group.add(mesh);
}

function focusRoom(roomName, floorLevel) {
    Object.keys(floorGroups).forEach(lvl => {
        floorGroups[lvl].traverse(child => { if(child.isMesh) child.material.opacity = (lvl == floorLevel) ? 0.7 : 0.05; });
    });
    roomMeshes.forEach(m => m.material.color.setHex(0x004d40));
    const target = roomMeshes.find(m => m.userData.name === roomName);
    if(target) target.material.color.setHex(0xffea00);
}

// ==================== HORARIOS Y MODAL ====================
function openAddModal() {
    const modal = document.getElementById('add-modal');
    const daySelect = document.getElementById('modal-day');
    daySelect.innerHTML = Object.keys(dayNames).map(k => `<option value="${k}">${dayNames[k]}</option>`).join('');
    const timeSelect = document.getElementById('modal-time');
    timeSelect.innerHTML = hours.map(h => `<option value="${h}">${h}:00</option>`).join('');
    const roomSelect = document.getElementById('modal-room');
    roomSelect.innerHTML = allRooms.map(r => `<option value="${r}">${r}</option>`).join('');
    modal.style.display = 'flex';
}

function closeAddModal() {
    document.getElementById('add-modal').style.display = 'none';
}

function saveNewClass() {
    const day = parseInt(document.getElementById('modal-day').value);
    const time = parseInt(document.getElementById('modal-time').value);
    const room = document.getElementById('modal-room').value;
    const subject = document.getElementById('modal-subject').value || 'Clase nueva';
    const teacher = document.getElementById('modal-teacher').value || 'Sin asignar';
    let floor = 1;
    if (room.startsWith('B') || room === 'CC-2') floor = 2;
    if (room.startsWith('C')) floor = 3;

    scheduleData.push({id: Date.now(), day, time, subject, room, floor, carrera: 'ing', teacher: teacher});
    closeAddModal();
    updateSchedule();
}

function updateSchedule() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    const carr = document.getElementById('carrera-select').value;
    const teach = document.getElementById('docente-select') ? document.getElementById('docente-select').value : 'all';

    const headerHora = document.createElement('div'); headerHora.className='header-cell'; headerHora.textContent='HORA'; grid.appendChild(headerHora);
    for(let d=1; d<=7; d++) {
        const h = document.createElement('div'); h.className='header-cell'; h.textContent=dayNames[d]; grid.appendChild(h);
    }

    hours.forEach(h => {
        const timeLabel = document.createElement('div'); timeLabel.className='time-cell'; timeLabel.textContent=`${h}:00`; grid.appendChild(timeLabel);
        for(let d=1; d<=7; d++) {
            const slot = document.createElement('div'); slot.className='slot';
            const item = scheduleData.find(s => s.day===d && s.time===h);
            if(item && (carr==='all' || item.carrera===carr) && (teach==='all' || item.teacher===teach)) {
                slot.innerHTML = `<div class="class-card" onclick="focusRoom('${item.room}',${item.floor})"><strong>${item.subject}</strong><span style="color:var(--yellow);font-size:0.65rem;">${item.room}</span></div>`;
            } else {
                slot.innerHTML = `<div onclick="openAddModal()" style="height:100%;display:flex;align-items:center;justify-content:center;color:#555;font-size:0.65rem;cursor:pointer;border:2px dashed #444;border-radius:6px;"><i class="fas fa-plus"></i></div>`;
            }
            grid.appendChild(slot);
        }
    });
}

function toggleSchedule() {
    scheduleVisible = !scheduleVisible;
    const drawer = document.getElementById('schedule-drawer');
    const canvas = document.getElementById('canvas-container');
    const text = document.getElementById('btn-text');
    if(!scheduleVisible){
        drawer.style.height = '0';
        canvas.style.height = 'calc(100% - 50px)';
        text.innerHTML = 'Restaurar horarios';
    } else {
        drawer.style.height = '280px';
        canvas.style.height = 'calc(100% - 330px)';
        text.innerHTML = 'Maximizar 3D';
    }
    setTimeout(() => {
        camera.aspect = window.innerWidth / (window.innerHeight - (scheduleVisible ? 330 : 50));
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight - (scheduleVisible ? 330 : 50));
    }, 400);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.onload = () => {
    init3D();
    updateSchedule();
};