const express = require('express');
const axios = require('axios');
const app = express();
require('dotenv').config()

const CONFIG = {
    CLIENT_ID: process.env.CLIENT_ID, // Берётся из настроек интеграции
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    SUBDOMAIN: process.env.SUBDOMAIN,
    REDIRECT_URI: 'http://localhost:3000/callback' // Укажите этот же URL в настройках интеграции
};

// Шаг 1: Перенаправляем пользователя в amoCRM
app.get('/auth', async (req, res) => {
    const response = await axios.get('https://agse.amocrm.ru/api/v4/leads/25022431', {
        headers: {
            'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjcwNDVlODBjZGI4NDNkZmI3ZWRiMzk3NjM1MjVhZjcxYmVhN2QyMzIxMTAzY2M5MjVlY2Y1NzBhM2NkM2Y0ZjUxMTI5NDMzZTViZTNiMDhhIn0.eyJhdWQiOiJlNjM5NDM0Ny1jMDVlLTQzOTEtOWM4Mi1mYzUxOGRiYmE4MjciLCJqdGkiOiI3MDQ1ZTgwY2RiODQzZGZiN2VkYjM5NzYzNTI1YWY3MWJlYTdkMjMyMTEwM2NjOTI1ZWNmNTcwYTNjZDNmNGY1MTEyOTQzM2U1YmUzYjA4YSIsImlhdCI6MTc0Mzg1NDAyMywibmJmIjoxNzQzODU0MDIzLCJleHAiOjE3OTg2NzUyMDAsInN1YiI6IjExNjc5OTkwIiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjE4OTEzMTExLCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiNzg4ZjYxZmEtY2RhMS00N2IwLWI2YjQtMThhYjBkYTRjZTAxIiwiYXBpX2RvbWFpbiI6ImFwaS1iLmFtb2NybS5ydSJ9.nqjiNvRY0_6vNBmj6Zw3_sSNogiptjJdAKI3e8UPgrp68nGzjGBRRARPAFo5A36u-YKr4pkXwquOy_W2yatV9pAlj4-rjXvqOJmzVvRpT75-mN4C1LQODHvfe5B7m_sHQ1FbSsCmluu6oAZjGDWelnt1aX3ouxFO4mtNPXNFg46nJjbYF7GY3zFDIbhxpuKhOHBCuDneUjPs8k9Rj9eus_umglItNA8NDJUExZazbuJB748I-W4klbgO9KJ_n6JiycVDfPBw4D7FxeOdvMrEQ6i_kkiy4jfs5YrC3pmNqfOgU14EUcDGzuAZcormQx-F0wOR4Dz0cVfmcB33iF4bEw'
        }
    })
    console.log(response.data)
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
