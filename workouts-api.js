// workouts-api.js

document.addEventListener('DOMContentLoaded', function() {

    const workoutsList = document.getElementById('workoutsList');
    const workoutForm = document.getElementById('addWorkoutForm');
    const noWorkoutsMessage = document.getElementById('noWorkoutsMessage');

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
    const API_URL = `${API_BASE_URL}/api/workouts`;

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

    // ====== Функция загрузки всех тренировок ======
    async function loadWorkouts() {
        if (!workoutsList) return;

        workoutsList.innerHTML = '';
        
        // Check if user is logged in
        if (!getToken()) {
            workoutsList.innerHTML = '<p class="text-muted">Пожалуйста, <a href="login.html">войдите</a> для просмотра тренировок.</p>';
            return;
        }
        
        try {
            const workouts = await apiRequest(API_URL);
            if (!workouts) return; // User was redirected to login

            if (workouts.length === 0) {
                if (noWorkoutsMessage) noWorkoutsMessage.style.display = 'block';
                return;
            } else {
                if (noWorkoutsMessage) noWorkoutsMessage.style.display = 'none';
            }

            workouts.forEach(workout => {
                const item = document.createElement('div');
                item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
                item.innerHTML = `
                    <div>
                        <h5 class="mb-1">${workout.name || 'Без названия'} — ${workout.type}</h5>
                        <p class="mb-1">Продолжительность: ${workout.duration} мин</p>
                        <small class="text-muted">${workout.createdAt ? 'Добавлено: ' + new Date(workout.createdAt).toLocaleDateString('ru-RU') : ''}</small>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-danger delete-btn-workout" data-id="${workout._id}">Удалить</button>
                `;
                const deleteBtn = item.querySelector('button');
                deleteBtn.addEventListener('click', async () => {
                    if (!getToken()) {
                        alert('Пожалуйста, войдите в систему для удаления тренировок.');
                        window.location.href = 'login.html';
                        return;
                    }
                    
                    if (!confirm('Вы уверены, что хотите удалить эту тренировку?')) {
                        return;
                    }
                    
                    try {
                        const result = await apiRequest(`${API_URL}/${workout._id}`, { 
                            method: 'DELETE' 
                        });
                        
                        if (!result) return; // User was redirected to login
                        
                        loadWorkouts(); // обновляем список
                    } catch (err) {
                        console.error('Ошибка удаления тренировки:', err);
                        alert('Ошибка при удалении тренировки: ' + err.message);
                    }
                });
                workoutsList.appendChild(item);
            });
        } catch (err) {
            console.error('Ошибка загрузки тренировок:', err);
            if (noWorkoutsMessage) {
                noWorkoutsMessage.textContent = 'Ошибка при загрузке тренировок. Проверьте подключение к серверу.';
                noWorkoutsMessage.style.display = 'block';
            }
        }
    }

    // ====== Добавление новой тренировки ======
    if (workoutForm) {
        workoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!workoutForm.checkValidity()) {
                workoutForm.classList.add('was-validated');
                return;
            }

            const nameInput = document.getElementById('workoutName');
            const typeInput = document.getElementById('workoutType');
            const durationInput = document.getElementById('workoutDuration');

            // Validation
            if (!nameInput.value.trim()) {
                alert('Пожалуйста, введите название тренировки');
                return;
            }

            if (parseInt(durationInput.value) <= 0) {
                alert('Продолжительность должна быть положительным числом!');
                return;
            }

            // Check if user is logged in
            if (!getToken()) {
                alert('Пожалуйста, войдите в систему для добавления тренировок.');
                window.location.href = 'login.html';
                return;
            }

            const newWorkout = {
                name: nameInput.value.trim(),
                type: typeInput.value,
                duration: parseInt(durationInput.value)
            };

            try {
                const workout = await apiRequest(API_URL, {
                    method: 'POST',
                    body: JSON.stringify(newWorkout)
                });

                if (!workout) return; // User was redirected to login

                workoutForm.reset();
                workoutForm.classList.remove('was-validated');
                loadWorkouts(); // обновляем список после добавления
            } catch (err) {
                console.error('Ошибка добавления тренировки:', err);
                alert('Ошибка при добавлении тренировки: ' + err.message);
            }
        });
    }

    // ====== Инициализация ======
    if (workoutsList) loadWorkouts();

});
