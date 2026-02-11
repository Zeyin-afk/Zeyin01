// auth-utils.js
// Общие функции для аутентификации (login / register / logout)

// Определяем базовый URL API (локально и в продакшене)
function getApiBaseUrl() {
  // Если открыт как file:// — использовать localhost
  if (window.location.protocol === "file:") {
    return "http://localhost:3000";
  }
  // Если localhost в браузере — явно использовать порт 3000
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "http://localhost:3000";
  }
  // В остальных случаях — тот же origin (для деплоя)
  return window.location.origin;
}

const AUTH_API_BASE_URL = getApiBaseUrl();

// Вспомогательная функция отправки запроса на /api/users/*
async function authRequest(endpoint, body) {
  const url = `${AUTH_API_BASE_URL}/api/users/${endpoint}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error(
        "Сервер вернул некорректный ответ. Убедитесь, что сервер запущен."
      );
    }

    if (!response.ok) {
      let message = data.message || "Ошибка авторизации";
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        message = data.errors.join(", ");
      }
      throw new Error(message);
    }

    // Ожидаем, что backend вернёт { token, user: {...} }
    if (data.token) {
      localStorage.setItem("jwt_token", data.token);
    }
    if (data.user) {
      localStorage.setItem("user_email", data.user.email || "");
      localStorage.setItem("user_role", data.user.role || "user");
    }

    return data;
  } catch (error) {
    console.error("Auth request error:", error);
    if (
      error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError")
    ) {
      throw new Error(
        "Не удалось подключиться к серверу. Убедитесь, что сервер запущен на http://localhost:3000"
      );
    }
    throw error;
  }
}

// === Публичные функции, которые вызываются со страниц ===

// Вход пользователя
async function login(email, password) {
  if (!email || !password) {
    throw new Error("Email и пароль обязательны");
  }
  return await authRequest("login", { email, password });
}

// Регистрация пользователя
async function register(email, password) {
  if (!email || !password) {
    throw new Error("Email и пароль обязательны");
  }
  return await authRequest("register", { email, password });
}

// Выход
function logout(redirectToLogin = true) {
  localStorage.removeItem("jwt_token");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_role");

  if (redirectToLogin) {
    window.location.href = "login.html";
  }
}

// Проверка, авторизован ли пользователь
function isAuthenticated() {
  return !!localStorage.getItem("jwt_token");
}

