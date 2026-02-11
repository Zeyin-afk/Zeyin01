// nutrition-calc.js
// Handles POST, GET, DELETE for nutrition entries using Meal API

document.addEventListener('DOMContentLoaded', function() {

    const nutritionLog = document.getElementById('nutritionLog');
    const nutritionForm = document.getElementById('nutritionCalcForm');

    // Detect API base URL (works for both localhost and production)
    function getApiBaseUrl() {
        // If opened via file:// protocol, default to localhost
        if (window.location.protocol === 'file:') {
            return 'http://localhost:3000';
        }
        // If localhost, use localhost:3000
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000';
        }
        // Otherwise use the same origin
        return window.location.origin;
    }
    
    const API_BASE_URL = getApiBaseUrl();
    const API_URL = `${API_BASE_URL}/api/meals`;

    // Get token from localStorage
    function getToken() {
        return localStorage.getItem('jwt_token');
    }

    // Make authenticated API request
    async function apiRequest(url, options = {}) {
        const token = getToken();
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        // Add Authorization header if token exists
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
            ...options,
            headers
        };
        
        try {
            const response = await fetch(url, config);
            
            // Handle non-JSON responses
            let data;
            try {
                data = await response.json();
            } catch (e) {
                throw new Error('Server returned invalid response. Make sure the server is running.');
            }
            
            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired or invalid, redirect to login
                    localStorage.removeItem('jwt_token');
                    alert('Сессия истекла. Пожалуйста, войдите снова.');
                    window.location.href = 'login.html';
                    return null;
                }
                throw new Error(data.message || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API request error:', error);
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Не удалось подключиться к серверу. Убедитесь, что сервер запущен на http://localhost:3000');
            }
            throw error;
        }
    }

    // ====== Функция загрузки всех записей питания ======
    async function loadNutritionEntries() {
        if (!nutritionLog) return;

        nutritionLog.innerHTML = '';
        
        // Check if user is logged in
        if (!getToken()) {
            nutritionLog.innerHTML = '<p class="text-muted">Пожалуйста, <a href="login.html">войдите</a> для просмотра записей питания.</p>';
            return;
        }
        
        try {
            const entries = await apiRequest(API_URL);
            if (!entries) return; // User was redirected to login

            if (entries.length === 0) {
                nutritionLog.innerHTML = '<p class="text-muted">Нет сохраненных записей.</p>';
                return;
            }

            entries.forEach(entry => {
                const item = document.createElement('div');
                item.className = 'list-group-item d-flex justify-content-between align-items-center';
                item.innerHTML = `
                    <div class="flex-grow-1">
                        <h5 class="mb-1">${entry.name || 'Без названия'}</h5>
                        <p class="mb-1">
                            <strong>Калории:</strong> ${entry.calories} ккал | 
                            <strong>Белки:</strong> ${entry.protein} г | 
                            <strong>Жиры:</strong> ${entry.fat} г | 
                            <strong>Углеводы:</strong> ${entry.carbs} г
                        </p>
                        <small class="text-muted">${entry.createdAt ? 'Добавлено: ' + new Date(entry.createdAt).toLocaleDateString('ru-RU') : ''}</small>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-danger delete-btn-meal" data-id="${entry._id}">Удалить</button>
                `;
                const deleteBtn = item.querySelector('button');
                deleteBtn.addEventListener('click', async () => {
                    if (!getToken()) {
                        alert('Пожалуйста, войдите в систему для удаления записей.');
                        window.location.href = 'login.html';
                        return;
                    }
                    
                    if (!confirm('Вы уверены, что хотите удалить эту запись?')) {
                        return;
                    }
                    
                    try {
                        const result = await apiRequest(`${API_URL}/${entry._id}`, { 
                            method: 'DELETE' 
                        });
                        
                        if (!result) return; // User was redirected to login
                        
                        loadNutritionEntries(); // обновляем список
                    } catch (err) {
                        console.error('Ошибка удаления записи:', err);
                        alert('Ошибка при удалении записи: ' + err.message);
                    }
                });
                nutritionLog.appendChild(item);
            });
        } catch (err) {
            console.error('Ошибка загрузки записей питания:', err);
            nutritionLog.innerHTML = 
                '<p class="text-danger">Ошибка при загрузке записей. Проверьте подключение к серверу.</p>';
        }
    }

    // ====== Добавление новой записи питания ======
    if (nutritionForm) {
        nutritionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!nutritionForm.checkValidity()) {
                nutritionForm.classList.add('was-validated');
                return;
            }

            const nameInput = document.getElementById('foodName');
            const caloriesInput = document.getElementById('calories');
            const proteinInput = document.getElementById('protein');
            const fatInput = document.getElementById('fat');
            const carbsInput = document.getElementById('carbs');

            // Validation
            if (!nameInput.value.trim()) {
                alert('Пожалуйста, введите название блюда');
                return;
            }

            const calories = parseFloat(caloriesInput.value);
            if (!calories || calories < 1) {
                alert('Пожалуйста, введите калории (минимум 1).');
                return;
            }

            // Check if user is logged in
            if (!getToken()) {
                alert('Пожалуйста, войдите в систему для добавления записей.');
                window.location.href = 'login.html';
                return;
            }

            const newMeal = {
                name: nameInput.value.trim(),
                calories: calories,
                protein: parseFloat(proteinInput.value) || 0,
                fat: parseFloat(fatInput.value) || 0,
                carbs: parseFloat(carbsInput.value) || 0
            };

            try {
                const meal = await apiRequest(API_URL, {
                    method: 'POST',
                    body: JSON.stringify(newMeal)
                });

                if (!meal) return; // User was redirected to login

                nutritionForm.reset();
                nutritionForm.classList.remove('was-validated');
                loadNutritionEntries(); // обновляем список после добавления
            } catch (err) {
                console.error('Ошибка добавления записи:', err);
                alert('Ошибка при добавлении записи: ' + err.message);
            }
        });
    }

    // ====== Инициализация ======
    if (nutritionLog) loadNutritionEntries();

});

