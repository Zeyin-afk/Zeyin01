document.addEventListener('DOMContentLoaded', function() {

    // 1. КОНСТАНТЫ И ИНИЦИАЛИЗАЦИЯ
    const workoutForm = document.getElementById('addWorkoutForm');
    const workoutsList = document.getElementById('workoutsList');
    const noWorkoutsMessage = document.getElementById('noWorkoutsMessage');
    
    const nutritionForm = document.getElementById('nutritionCalcForm');
    const nutritionLog = document.getElementById('nutritionLog');
    
    const contactForm = document.getElementById('contactForm');
    const quoteElement = document.getElementById('quotePlaceholder'); 

    // Элементы статистики на progress.html
    const totalWorkoutsEl = document.getElementById('totalWorkouts');
    const totalDurationEl = document.getElementById('totalDuration');
    const avgCaloriesEl = document.getElementById('avgCalories');


    // 2. ЛОГИКА ТРЕНИРОВОК (Журнал)
    // NOTE: Workout functionality is now handled by workouts-api.js which connects to MongoDB
    // This section is commented out to avoid conflicts with the API-based implementation
    
    // Workout operations are now handled in workouts-api.js which uses MongoDB via Express API
    
    // 3. ЛОГИКА ПИТАНИЯ (Журнал)
    
    function loadNutrition() {
        if (!nutritionLog) return;

        const meals = JSON.parse(localStorage.getItem('meals')) || [];
        nutritionLog.innerHTML = ''; 

        if (meals.length === 0) {
            nutritionLog.innerHTML = '<p class="text-muted">Сохраненные записи появятся здесь.</p>';
            return;
        }

        for (let index = 0; index < meals.length; index++) {
            const meal = meals[index];

            const item = document.createElement('div');
            item.className = 'list-group-item d-flex justify-content-between align-items-center';
            item.innerHTML = `
                <div>
                    <h5 class="mb-1">${meal.name} <small class="text-muted">(${meal.date})</small></h5>
                    <p class="mb-1"><strong>${meal.calories}</strong> ккал | Б: ${meal.protein}г | Ж: ${meal.fat}г | У: ${meal.carbs}г</p>
                </div>
                <button type="button" class="btn btn-sm btn-outline-danger delete-btn-meal" data-index="${index}">Удалить</button>
            `;
            nutritionLog.appendChild(item);
        }
    }

    // Обработчик отправки формы питания
    if (nutritionForm) {
        loadNutrition(); 

        nutritionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();

            if (!nutritionForm.checkValidity()) {
                nutritionForm.classList.add('was-validated');
                return;
            }

            const calories = parseFloat(document.getElementById('calories').value) || 0;
            const protein = parseFloat(document.getElementById('protein').value) || 0;
            const fat = parseFloat(document.getElementById('fat').value) || 0;
            const carbs = parseFloat(document.getElementById('carbs').value) || 0;

            const estimatedCalories = (protein * 4) + (fat * 9) + (carbs * 4);
            const deviation = Math.abs(calories - estimatedCalories);

            if (deviation > (calories * 0.3) && (protein + fat + carbs) > 0) {
                 alert('Внимание: Введенные КБЖУ сильно расходятся с общими калориями. Проверьте данные!');
            }
            
            const newMeal = {
                name: document.getElementById('foodName').value,
                calories: calories,
                protein: protein,
                fat: fat,
                carbs: carbs,
                date: new Date().toLocaleDateString('ru-RU')
            };

            let meals = JSON.parse(localStorage.getItem('meals')) || [];
            meals.push(newMeal);
            localStorage.setItem('meals', JSON.stringify(meals)); 

            nutritionForm.reset();
            nutritionForm.classList.remove('was-validated');
            loadNutrition(); 
            updateProgressStats();
        });
    }

    // Обработчик удаления приема пищи
    if (nutritionLog) {
        nutritionLog.addEventListener('click', function(e) {
            if (e.target.classList.contains('delete-btn-meal')) {   
                const indexToDelete = parseInt(e.target.dataset.index);
                let meals = JSON.parse(localStorage.getItem('meals')) || [];
                
                meals.splice(indexToDelete, 1);
                localStorage.setItem('meals', JSON.stringify(meals));

                loadNutrition();
                updateProgressStats(); 
            }
        });
    }


    // 4. ЛОГИКА ДЛЯ КОНТАКТНОЙ ФОРМЫ (О Нас)
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const messageAlert = document.getElementById('contactMessageAlert');
            
            contactForm.reset();
            if (messageAlert) {
                messageAlert.style.display = 'block';
                // setTimeout - просто выполняет код через указанное время
                setTimeout(function() {
                    messageAlert.style.display = 'none';
                }, 3000);
            }
        });
    }
    
    // 5. ЛОГИКА ПРОГРЕССА (progress.html)

    async function updateProgressStats() {
        // Get API base URL
        const API_BASE_URL = window.location.origin.includes('localhost') 
            ? 'http://localhost:3000' 
            : window.location.origin;
        
        // Get token
        const token = localStorage.getItem('jwt_token');
        
        // Fetch workouts from MongoDB API
        let workouts = [];
        try {
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(`${API_BASE_URL}/api/workouts`, { headers });
            if (response.ok) {
                workouts = await response.json();
            }
        } catch (err) {
            console.error('Error fetching workouts for stats:', err);
        }
        
        // Fetch meals from MongoDB API
        let meals = [];
        try {
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(`${API_BASE_URL}/api/meals`, { headers });
            if (response.ok) {
                meals = await response.json();
            }
        } catch (err) {
            console.error('Error fetching meals for stats:', err);
        }
        
        let totalDuration = 0;
        let totalCalories = 0;

        // Расчет общей продолжительности
        for (let i = 0; i < workouts.length; i++) {
            totalDuration = totalDuration + workouts[i].duration; // sum = sum + w.duration
        }

        // Расчет общей калорийности
        for (let i = 0; i < meals.length; i++) {
            totalCalories = totalCalories + meals[i].calories; // sum = sum + m.calories
        }

        // Общее количество тренировок - это просто длина массива
        const totalWorkouts = workouts.length;
        
        // Расчет средней калорийности (простое деление)
        let avgCalories = 0;
        if (meals.length > 0) { // Проверяем, что не делим на ноль
            avgCalories = Math.round(totalCalories / meals.length);
        }
        
        // Обновление карточек
        if (totalWorkoutsEl) {
            totalWorkoutsEl.textContent = totalWorkouts;
        }
        if (totalDurationEl) {
            totalDurationEl.textContent = `${totalDuration} мин`;
        }
        if (avgCaloriesEl) {
            avgCaloriesEl.textContent = `${avgCalories} ккал`;
        }
    }

    // Запускаем расчет статистики при загрузке страницы Прогресс
    if (totalWorkoutsEl) { 
        updateProgressStats();
    }


    // 6. ЛОГИКА API (Мотивационная Цитата)
    if (quoteElement) {
        fetch('https://api.quotable.io/random')
            .then(response => {
                if (!response.ok) throw new Error('API request failed');
                return response.json();
            })
            .then(data => {
                quoteElement.innerHTML = `
                    <p class="lead fw-bold text-center mb-0">«${data.content}»</p>
                    <p class="text-center"> — ${data.author}</p>
                `;
            })
            .catch(error => {
                console.error('Ошибка при получении цитаты:', error);
                quoteElement.innerHTML = `<p class="lead text-center text-muted">«В здоровом теле – здоровый дух!»</p>`;
            });
    }

});