const http = require('http');

const data = JSON.stringify({
    targetUrl: 'https://example.com',
    campaign: 'test-campaign'
});

const options = {
    hostname: 'localhost',
    port: 5001, // Assuming backend runs on 5001 as per server.js
    path: '/api/links',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Attempting to create a link...');

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    let responseBody = '';
    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        console.log('Response Body:', responseBody);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
