async function sendToAmoCRM(user, main, lead, contact) {
    const accessToken = await amoAuthorize(user, main.subdomain);
    let idLead = await amoFindLead(accessToken, main.subdomain, contact.phone);
    
    if (idLead) {
        await amoAddNote(accessToken, main, lead, idLead);
    } else {
        const contactInfo = await amoFindContact(accessToken, main.subdomain, contact.phone);
        let idContact = contactInfo?.idContact;
        
        if (idContact) {
            idLead = await amoAddLead(accessToken, main, lead, idContact);
            if (lead.notes) {
                await amoAddNote(accessToken, main, lead, idLead);
            }
        } else {
            idContact = await amoAddContact(accessToken, main, contact);
            idLead = await amoAddLead(accessToken, main, lead, idContact);
            if (lead.notes) {
                await amoAddNote(accessToken, main, lead, idLead);
            }
        }
    }
}

async function amoAuthorize(user, subdomain) {
    const url = `https://${subdomain}.amocrm.ru/oauth2/access_token`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    
    if (!response.ok) throw new Error(`Ошибка авторизации: ${response.status}`);
    const data = await response.json();
    return data.access_token;
}

async function amoFindLead(accessToken, subdomain, phone) {
    const url = `https://${subdomain}.amocrm.ru/api/v2/leads?filter%5Bactive%5D=1&query=${phone}`;
    return makeGetRequest(url, accessToken);
}

async function amoFindContact(accessToken, subdomain, phone) {
    const url = `https://${subdomain}.amocrm.ru/api/v2/contacts/?query=${phone}`;
    return makeGetRequest(url, accessToken);
}

async function amoAddContact(accessToken, main, contact) {
    const url = `https://${main.subdomain}.amocrm.ru/api/v2/contacts`;
    const contactData = {
        add: [{
            name: contact.name,
            responsible_user_id: main.res_user_id,
            custom_fields: [
                { id: contact.phone_f, values: [{ value: contact.phone, enum: "WORK" }] },
                { id: contact.email_f, values: [{ value: contact.email, enum: "WORK" }] }
            ]
        }]
    };
    return makePostRequest(url, accessToken, contactData);
}

async function amoAddLead(accessToken, main, lead, idContact) {
    const url = `https://${main.subdomain}.amocrm.ru/api/v2/leads`;
    const leadData = {
        add: [{
            name: lead.name,
            created_at: Math.floor(Date.now() / 1000),
            pipeline_id: lead.pipeline_id,
            status_id: lead.status_id,
            tags: lead.tags,
            contacts_id: idContact,
            responsible_user_id: main.res_user_id
        }]
    };
    return makePostRequest(url, accessToken, leadData);
}

async function amoAddNote(accessToken, main, lead, idLead) {
    const url = `https://${main.subdomain}.amocrm.ru/api/v2/notes`;
    const noteData = {
        add: [{
            element_id: idLead,
            element_type: 2,
            note_type: 4,
            text: lead.notes
        }]
    };
    return makePostRequest(url, accessToken, noteData);
}

async function makeGetRequest(url, accessToken) {
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!response.ok) throw new Error(`Ошибка запроса: ${response.status}`);
    const data = await response.json();
    return data?._embedded?.items[0] || null;
}

async function makePostRequest(url, accessToken, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Ошибка запроса: ${response.status}`);
    const responseData = await response.json();
    return responseData?._embedded?.items[0]?.id || null;
}
