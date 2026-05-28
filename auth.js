// auth.js
const users = [
    { username: "usuario1", password: "12345", role: "estudiante" },
    { username: "docente1", password: "12345", role: "docente" },
    { username: "admin", password: "admin123", role: "admin" }
];

function authenticateUser(username, password) {
    return users.find(user => 
        user.username === username && user.password === password
    );
}

function handleLogin(event, role) {
    event.preventDefault();
    
    const username = document.getElementById(`user-${role}`).value.trim();
    const password = document.getElementById(`pass-${role}`).value.trim();
    const errorDiv = document.getElementById(`error-${role}`);

    errorDiv.classList.remove('show');

    const user = authenticateUser(username, password);

    if (user) {
        if (user.role === role || user.role === 'admin') {
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            setTimeout(() => {
                if (role === 'estudiante' || (user.role === 'admin' && role === 'estudiante')) {
                    window.location.href = 'estudiante.html';
                } else {
                    window.location.href = 'docente.html';
                }
            }, 300);
        } else {
            errorDiv.textContent = `Acceso denegado. Este usuario no es ${role}.`;
            errorDiv.classList.add('show');
        }
    } else {
        errorDiv.textContent = 'Usuario o contraseña incorrectos';
        errorDiv.classList.add('show');
    }
}

// Hacer funciones globales
window.handleLogin = handleLogin;