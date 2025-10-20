// Импорт Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signInAnonymously,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCCn5NMeeKP_suFUI48x5zYZ_jZm9B0erU",
    authDomain: "register-d5570.firebaseapp.com",
    projectId: "register-d5570",
    storageBucket: "register-d5570.firebasestorage.app",
    messagingSenderId: "233605905077",
    appId: "1:233605905077:web:89e13c44b1fabfdc669cfc",
    measurementId: "G-S0S25DKM3D"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Элементы DOM
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const chatContainer = document.getElementById('chatContainer');
const regName = document.getElementById('regName');
const regEmail = document.getElementById('regEmail');
const regPassword = document.getElementById('regPassword');
const registerBtn = document.getElementById('registerBtn');
const googleRegisterBtn = document.getElementById('googleRegisterBtn');
const anonymousBtn = document.getElementById('anonymousBtn');
const regError = document.getElementById('regError');
const regSuccess = document.getElementById('regSuccess');
const showLogin = document.getElementById('showLogin');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const anonymousLoginBtn = document.getElementById('anonymousLoginBtn');
const loginError = document.getElementById('loginError');
const loginSuccess = document.getElementById('loginSuccess');
const showRegister = document.getElementById('showRegister');
const userNameDisplay = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const anonymousModal = document.getElementById('anonymousModal');
const anonymousNameInput = document.getElementById('anonymousName');
const saveAnonymousNameBtn = document.getElementById('saveAnonymousNameBtn');
const nameError = document.getElementById('nameError');

// Переключение между формами регистрации и входа
showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    clearErrors();
});

showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    clearErrors();
});

// Регистрация по email
registerBtn.addEventListener('click', () => {
    const name = regName.value.trim();
    const email = regEmail.value;
    const password = regPassword.value;
    
    if (!name || !email || !password) {
        showError(regError, 'Заполните все поля');
        return;
    }
    
    if (name.length < 2) {
        showError(regError, 'Имя должно содержать минимум 2 символа');
        return;
    }
    
    if (password.length < 6) {
        showError(regError, 'Пароль должен содержать минимум 6 символов');
        return;
    }
    
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Обновляем профиль с именем пользователя
            return updateProfile(userCredential.user, {
                displayName: name
            });
        })
        .then(() => {
            clearError(regError);
            showSuccess(regSuccess, 'Регистрация успешна!');
            console.log('Пользователь зарегистрирован:', auth.currentUser);
        })
        .catch((error) => {
            showError(regError, getErrorMessage(error.code));
        });
});

// Вход по email
loginBtn.addEventListener('click', () => {
    const email = loginEmail.value;
    const password = loginPassword.value;
    
    if (!email || !password) {
        showError(loginError, 'Заполните все поля');
        return;
    }
    
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            clearError(loginError);
            showSuccess(loginSuccess, 'Вход выполнен!');
            console.log('Пользователь вошел:', userCredential.user);
        })
        .catch((error) => {
            showError(loginError, getErrorMessage(error.code));
        });
});

// Регистрация через Google
googleRegisterBtn.addEventListener('click', () => {
    signInWithPopup(auth, googleProvider)
        .then((result) => {
            const user = result.user;
            console.log('Успешная регистрация через Google:', user);
        })
        .catch((error) => {
            showError(regError, getErrorMessage(error.code));
        });
});

// Вход через Google
googleLoginBtn.addEventListener('click', () => {
    signInWithPopup(auth, googleProvider)
        .then((result) => {
            const user = result.user;
            console.log('Успешный вход через Google:', user);
        })
        .catch((error) => {
            showError(loginError, getErrorMessage(error.code));
        });
});

// Анонимный вход - регистрация
anonymousBtn.addEventListener('click', () => {
    anonymousModal.style.display = 'flex';
});

// Анонимный вход - вход
anonymousLoginBtn.addEventListener('click', () => {
    anonymousModal.style.display = 'flex';
});

// Сохранение имени анонимного пользователя
saveAnonymousNameBtn.addEventListener('click', () => {
    const userName = anonymousNameInput.value.trim();
    
    if (!userName) {
        showError(nameError, 'Введите имя');
        return;
    }
    
    if (userName.length < 2) {
        showError(nameError, 'Имя должно содержать минимум 2 символа');
        return;
    }
    
    signInAnonymously(auth)
        .then((userCredential) => {
            // Обновляем профиль с именем пользователя
            return updateProfile(userCredential.user, {
                displayName: userName
            });
        })
        .then(() => {
            anonymousModal.style.display = 'none';
            anonymousNameInput.value = '';
            clearError(nameError);
            console.log('Анонимный вход выполнен');
        })
        .catch((error) => {
            showError(nameError, getErrorMessage(error.code));
        });
});

// Выход
logoutBtn.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            console.log('Пользователь вышел');
        })
        .catch((error) => {
            console.error('Ошибка при выходе:', error);
        });
});

// Отправка сообщения
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    const user = auth.currentUser;
    if (!user) return;
    
    // Определяем отображаемое имя
    let displayName = 'Аноним';
    if (user.displayName) {
        displayName = user.displayName;
    } else if (user.email) {
        displayName = user.email.split('@')[0]; // Берем часть до @ из email
    }
    
    addDoc(collection(db, 'messages'), {
        text: message,
        sender: displayName,
        senderId: user.uid,
        timestamp: serverTimestamp()
    })
    .then(() => {
        messageInput.value = '';
    })
    .catch((error) => {
        console.error('Ошибка отправки сообщения:', error);
    });
}

// Отслеживание состояния аутентификации
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Пользователь вошел
        registerForm.style.display = 'none';
        loginForm.style.display = 'none';
        chatContainer.style.display = 'flex';
        
        // Отображаем имя пользователя
        if (user.displayName) {
            userNameDisplay.textContent = user.displayName;
            if (user.isAnonymous) {
                userNameDisplay.textContent += ' (Аноним)';
            }
        } else if (user.email) {
            userNameDisplay.textContent = user.email.split('@')[0];
        } else {
            userNameDisplay.textContent = 'Анонимный пользователь';
        }
        
        loadMessages();
    } else {
        // Пользователь вышел
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
        chatContainer.style.display = 'none';
        userNameDisplay.textContent = '';
        chatMessages.innerHTML = '';
        clearFormFields();
    }
});

// Загрузка сообщений
function loadMessages() {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    
    onSnapshot(q, (querySnapshot) => {
        chatMessages.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const message = doc.data();
            displayMessage(message);
        });
        
        // Прокрутка вниз
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

// Отображение сообщения
function displayMessage(message) {
    const messageDiv = document.createElement('div');
    const user = auth.currentUser;
    
    if (user && message.senderId === user.uid) {
        messageDiv.className = 'message own-message';
    } else {
        messageDiv.className = 'message other-message';
    }
    
    const senderDiv = document.createElement('div');
    senderDiv.className = 'message-sender';
    senderDiv.textContent = message.sender;
    
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = message.text;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    
    if (message.timestamp) {
        const date = message.timestamp.toDate();
        timeDiv.textContent = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else {
        timeDiv.textContent = 'Только что';
    }
    
    messageDiv.appendChild(senderDiv);
    messageDiv.appendChild(textDiv);
    messageDiv.appendChild(timeDiv);
    
    chatMessages.appendChild(messageDiv);
}

// Вспомогательные функции
function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

function showSuccess(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

function clearError(element) {
    element.textContent = '';
    element.style.display = 'none';
}

function clearErrors() {
    clearError(regError);
    clearError(regSuccess);
    clearError(loginError);
    clearError(loginSuccess);
    clearError(nameError);
}

function clearFormFields() {
    regName.value = '';
    regEmail.value = '';
    regPassword.value = '';
    loginEmail.value = '';
    loginPassword.value = '';
    anonymousNameInput.value = '';
}

function getErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'Этот email уже используется';
        case 'auth/invalid-email':
            return 'Неверный формат email';
        case 'auth/weak-password':
            return 'Пароль слишком слабый';
        case 'auth/user-not-found':
            return 'Пользователь не найден';
        case 'auth/wrong-password':
            return 'Неверный пароль';
        case 'auth/popup-closed-by-user':
            return 'Окно входа было закрыто';
        case 'auth/popup-blocked':
            return 'Всплывающее окно было заблокировано браузером';
        case 'auth/operation-not-allowed':
            return 'Анонимный вход не включен';
        default:
            return 'Произошла ошибка. Попробуйте снова';
    }
}

// Закрытие модального окна при клике вне его
anonymousModal.addEventListener('click', (e) => {
    if (e.target === anonymousModal) {
        anonymousModal.style.display = 'none';
        clearError(nameError);
    }
});