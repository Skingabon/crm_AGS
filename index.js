const express = require('express');
const axios = require('axios');
const app = express();

const CONFIG = {
    CLIENT_ID: 'ваш_client_id', // Берётся из настроек интеграции
    CLIENT_SECRET: 'ваш_client_secret',
    SUBDOMAIN: 'ваш_поддомен',
    REDIRECT_URI: 'http://localhost:3000/callback' // Укажите этот же URL в настройках интеграции
};

// Шаг 1: Перенаправляем пользователя в amoCRM
app.get('/auth', (req, res) => {
    res.redirect(
        `https://${CONFIG.SUBDOMAIN}.amocrm.ru/oauth2/authorize?` +
        `client_id=${CONFIG.CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(CONFIG.REDIRECT_URI)}&` +
        `response_type=code`
    );
});

// Шаг 2: Получаем токены
app.get('/callback', async (req, res) => {
    const { code } = req.query;

    const response = await axios.post(
        `https://${CONFIG.SUBDOMAIN}.amocrm.ru/oauth2/access_token`,
        {
            client_id: CONFIG.CLIENT_ID,
            client_secret: CONFIG.CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: CONFIG.REDIRECT_URI
        }
    );

    // Вот ваши токены! (сохраните их)
    console.log('Access Token:', response.data.access_token);
    console.log('Refresh Token:', response.data.refresh_token);

    res.send('Авторизация успешна! Токены в консоли сервера.');
});

app.listen(3000, () => console.log('Сервер запущен на http://localhost:3000/auth'));