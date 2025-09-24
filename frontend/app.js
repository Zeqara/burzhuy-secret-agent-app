document.addEventListener('DOMContentLoaded', () => {
   // ЭТОТ АДРЕС МЫ ПОЛУЧИМ НА СЛЕДУЮЩЕМ ШАГЕ ОТ RENDER
const API_BASE_URL = 'https://burzhuy-secret-agent-app.onrender.com';

    const tg = window.Telegram.WebApp;
    tg.expand();

    const onboardingScreen = document.getElementById('onboarding-screen');
    const mainApp = document.getElementById('main-app');
    const content = document.getElementById('content');
    const navButtons = document.querySelectorAll('.nav-btn');

    const checkRegistration = () => {
        if (localStorage.getItem('userProfile')) {
            onboardingScreen.style.display = 'none';
            mainApp.style.display = 'block';
            loadPage('cooperation');
        } else {
            onboardingScreen.style.display = 'flex';
            mainApp.style.display = 'none';
        }
    };

    document.getElementById('registration-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const regError = document.getElementById('reg-error');
        const user = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            city: document.getElementById('city').value,
        };
        try {
            const res = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            localStorage.setItem('userProfile', JSON.stringify(result.user));
            checkRegistration();
        } catch (error) {
            regError.textContent = error.message;
        }
    });
    
    const loadPage = (page) => {
        content.innerHTML = document.getElementById(`template-${page}`).innerHTML;
        addPageListeners(page);
    };

    navButtons.forEach(btn => btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadPage(btn.dataset.target);
    }));

    const addPageListeners = (page) => {
        if (page === 'cooperation') {
            document.getElementById('report-form').addEventListener('submit', async e => {
                e.preventDefault();
                const statusEl = document.getElementById('report-status');
                statusEl.textContent = 'Отправка...';
                const formData = new FormData();
                formData.append('address', document.getElementById('address').value);
                formData.append('cleanliness', document.getElementById('cleanliness').value);
                Array.from(document.getElementById('photos').files).forEach(file => formData.append('photos', file));
                try {
                    const res = await fetch(`${API_BASE_URL}/api/report`, { method: 'POST', body: formData });
                    const result = await res.json();
                    if (!res.ok) throw new Error(result.message);
                    statusEl.textContent = result.message;
                    statusEl.className = 'status-message success';
                    e.target.reset();
                } catch (error) {
                    statusEl.textContent = `Ошибка: ${error.message}`;
                    statusEl.className = 'status-message error';
                }
            });
        } else if (page === 'support') {
            document.getElementById('support-form').addEventListener('submit', async e => {
                e.preventDefault();
                const statusEl = document.getElementById('support-status');
                statusEl.textContent = 'Отправка...';
                try {
                    const res = await fetch(`${API_BASE_URL}/api/support`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ question: document.getElementById('question').value })
                    });
                    const result = await res.json();
                    if (!res.ok) throw new Error(result.message);
                    statusEl.textContent = result.message;
                    statusEl.className = 'status-message success';
                    e.target.reset();
                } catch (error) {
                    statusEl.textContent = `Ошибка: ${error.message}`;
                    statusEl.className = 'status-message error';
                }
            });
        }
    };
    checkRegistration();
});
