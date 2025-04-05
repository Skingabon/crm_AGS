require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const subdomain = process.env.SUBDOMAIN;
const redirectUri = process.env.REDIRECT_URI;


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

    const response = await axios.post(
        `https://${CONFIG.SUBDOMAIN}.amocrm.ru/oauth2/access_token`,
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
});

app.listen(3000, () => console.log('Сервер запущен на http://localhost:3000/auth'));