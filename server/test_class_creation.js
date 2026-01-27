const http = require('http');

const makeRequest = (options, data) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject({ statusCode: res.statusCode, ...parsed });
                    }
                } catch (e) {
                    reject({ statusCode: res.statusCode, message: body });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
};

const runTest = async () => {
    try {
        console.log('1. Registering/Logging in test teacher...');

        let token;
        const loginData = {
            email: 'api_http_teacher@example.com',
            password: 'password123'
        };

        try {
            const loginRes = await makeRequest({
                hostname: 'localhost',
                port: 5000,
                path: '/api/auth/login',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }, loginData);
            token = loginRes.token;
            console.log('   Login successful.');
        } catch (e) {
            console.log('   Login failed, trying registration...');
            const registerData = {
                name: 'HTTP Test Teacher',
                email: 'api_http_teacher@example.com',
                password: 'password123',
                role: 'teacher'
            };
            const registerRes = await makeRequest({
                hostname: 'localhost',
                port: 5000,
                path: '/api/auth/register',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }, registerData);
            token = registerRes.token;
            console.log('   Registration successful.');
        }

        console.log('2. Creating Video Class...');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const classData = {
            title: 'HTTP API Test Class',
            description: 'Created via node http',
            videoUrl: 'https://meet.google.com/http-test',
            scheduledTime: tomorrow.toISOString(),
            duration: 45,
            meetingType: 'live'
        };

        const createRes = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/classes',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }, classData);

        console.log('✅ Class created successfully!', createRes.data.title);
        console.log('   ID:', createRes.data._id);

    } catch (err) {
        console.error('❌ Test Failed:', err);
    }
};

runTest();
