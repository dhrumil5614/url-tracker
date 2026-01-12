const { detectSource } = require('./utils/sourceDetector');

const runTests = () => {
    const testCases = [
        { referrer: 'https://www.instagram.com/p/B8qKqKq/', expected: 'instagram' },
        { referrer: 'https://l.facebook.com/', expected: 'facebook' },
        { referrer: 'https://m.facebook.com/', expected: 'facebook' },
        { referrer: 'https://t.co/xyz123', expected: 'twitter' },
        { referrer: 'https://www.linkedin.com/feed/', expected: 'linkedin' },
        { referrer: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', expected: 'youtube' },
        { referrer: 'https://api.whatsapp.com/', expected: 'whatsapp' },
        { referrer: 'https://wa.me/1234567890', expected: 'whatsapp' },
        { referrer: 'https://example.com/blog', expected: null },
        { referrer: '', expected: null },
        { referrer: undefined, expected: null },
        { referrer: null, expected: null },
    ];

    let passed = 0;
    let failed = 0;

    console.log('Running Source Detection Verification Tests...\n');

    testCases.forEach((test, index) => {
        const result = detectSource(test.referrer);
        const status = result === test.expected ? 'PASS' : 'FAIL';

        if (status === 'PASS') {
            passed++;
            console.log(`[${status}] Test #${index + 1}: Referrer "${test.referrer}" => Detected: "${result}"`);
        } else {
            failed++;
            console.error(`[${status}] Test #${index + 1}: Referrer "${test.referrer}" => Expected: "${test.expected}", Got: "${result}"`);
        }
    });

    console.log('\n----------------------------------------');
    console.log(`Total Tests: ${testCases.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log('----------------------------------------');

    if (failed > 0) {
        console.error('❌ Some tests failed.');
        process.exit(1);
    } else {
        console.log('✅ All tests passed.');
        process.exit(0);
    }
};

runTests();
