require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const subdomain = process.env.SUBDOMAIN;
const redirectUri = process.env.REDIRECT_URI;
// Логирование переменных окружения для отладки
console.log('CLIENT_ID:', clientId);
console.log('CLIENT_SECRET:', clientSecret);
console.log('SUBDOMAIN:', subdomain);
console.log('REDIRECT_URI:', redirectUri);

// Шаг 1: Перенаправляем пользователя в amoCRM
app.get('/auth', (req, res) => {
    res.redirect(
        `https://${subdomain}.amocrm.ru/oauth2/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code`
    );
});

// Шаг 2: Получаем токены
app.get('/callback', async (req, res) => {
    const { code } = req.query;

    try {
        const response = await axios.post(
            `https://${subdomain}.amocrm.ru/oauth2/access_token`,
            {
                client_id: clientId,
                client_secret: clientSecret,
                code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri
            }
        );

        // Вот ваши токены! (сохраните их)
        console.log('Access Token:', response.data.access_token);
        console.log('Refresh Token:', response.data.refresh_token);

        res.send('Авторизация успешна! Токены в консоли сервера.');
    } catch (error) {
        console.error('Ошибка при получении токенов:', error.response ? error.response.data : error.message);
        res.status(500).send('Ошибка при авторизации.');
    }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}/auth`));

