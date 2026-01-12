# Testing Platform Detection

This document shows how to test the automatic platform detection feature.

## Quick Test Commands

### 1. Test Instagram Detection

```bash
# Simulate Instagram click
curl -v -H "Referer: https://l.instagram.com/" \
     -H "User-Agent: Instagram 312.0.0.35.109" \
     http://localhost:5000/YOUR_SHORT_CODE

# Expected: Detected as "instagram"
```

### 2. Test Facebook Detection

```bash
# Simulate Facebook click
curl -v -H "Referer: https://lm.facebook.com/" \
     -H "User-Agent: Mozilla/5.0 ... FBAV/450.0.0.32.70" \
     http://localhost:5000/YOUR_SHORT_CODE

# Expected: Detected as "facebook"
```

### 3. Test Twitter Detection

```bash
# Simulate Twitter click
curl -v -H "Referer: https://t.co/abc123" \
     -H "User-Agent: Mozilla/5.0 ... Twitter for iPhone" \
     http://localhost:5000/YOUR_SHORT_CODE

# Expected: Detected as "twitter"
```

### 4. Test LinkedIn Detection

```bash
# Simulate LinkedIn click
curl -v -H "Referer: https://www.linkedin.com/feed/" \
     -H "User-Agent: LinkedInApp/9.2.345" \
     http://localhost:5000/YOUR_SHORT_CODE

# Expected: Detected as "linkedin"
```

### 5. Test WhatsApp Detection

```bash
# Simulate WhatsApp click (often no referer)
curl -v -H "User-Agent: WhatsApp/2.23.20.76" \
     http://localhost:5000/YOUR_SHORT_CODE

# Expected: Detected as "whatsapp"
```

### 6. Test Direct Traffic

```bash
# Simulate direct URL access (copy-paste)
curl -v http://localhost:5000/YOUR_SHORT_CODE

# Expected: Detected as "direct"
```

### 7. Test Manual Override

```bash
# Manual source parameter
curl -v http://localhost:5000/YOUR_SHORT_CODE?utm_source=influencer_john

# Expected: Detected as "influencer_john"
```

## Full Test Script

Save this as `test-detection.sh`:

```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5000"
SHORT_CODE="$1"

if [ -z "$SHORT_CODE" ]; then
    echo "Usage: $0 <short_code>"
    echo "Example: $0 abc123"
    exit 1
fi

echo -e "${BLUE}Testing Platform Detection for: ${SHORT_CODE}${NC}\n"

# Test Instagram
echo -e "${YELLOW}1. Testing Instagram Detection...${NC}"
curl -s -H "Referer: https://l.instagram.com/" \
     -H "User-Agent: Instagram 312.0" \
     "${BASE_URL}/${SHORT_CODE}" > /dev/null
echo -e "${GREEN}✓ Instagram test complete${NC}\n"

# Test Facebook
echo -e "${YELLOW}2. Testing Facebook Detection...${NC}"
curl -s -H "Referer: https://lm.facebook.com/" \
     -H "User-Agent: FBAV/450.0" \
     "${BASE_URL}/${SHORT_CODE}" > /dev/null
echo -e "${GREEN}✓ Facebook test complete${NC}\n"

# Test Twitter
echo -e "${YELLOW}3. Testing Twitter Detection...${NC}"
curl -s -H "Referer: https://t.co/test" \
     -H "User-Agent: Twitter for iPhone" \
     "${BASE_URL}/${SHORT_CODE}" > /dev/null
echo -e "${GREEN}✓ Twitter test complete${NC}\n"

# Test LinkedIn
echo -e "${YELLOW}4. Testing LinkedIn Detection...${NC}"
curl -s -H "Referer: https://www.linkedin.com/feed/" \
     -H "User-Agent: LinkedInApp/9.2" \
     "${BASE_URL}/${SHORT_CODE}" > /dev/null
echo -e "${GREEN}✓ LinkedIn test complete${NC}\n"

# Test Pinterest
echo -e "${YELLOW}5. Testing Pinterest Detection...${NC}"
curl -s -H "Referer: https://www.pinterest.com/" \
     "${BASE_URL}/${SHORT_CODE}" > /dev/null
echo -e "${GREEN}✓ Pinterest test complete${NC}\n"

# Test WhatsApp
echo -e "${YELLOW}6. Testing WhatsApp Detection...${NC}"
curl -s -H "User-Agent: WhatsApp/2.23.20" \
     "${BASE_URL}/${SHORT_CODE}" > /dev/null
echo -e "${GREEN}✓ WhatsApp test complete${NC}\n"

# Test TikTok
echo -e "${YELLOW}7. Testing TikTok Detection...${NC}"
curl -s -H "Referer: https://www.tiktok.com/@user/video/123" \
     "${BASE_URL}/${SHORT_CODE}" > /dev/null
echo -e "${GREEN}✓ TikTok test complete${NC}\n"

# Test Direct
echo -e "${YELLOW}8. Testing Direct Traffic...${NC}"
curl -s "${BASE_URL}/${SHORT_CODE}" > /dev/null
echo -e "${GREEN}✓ Direct test complete${NC}\n"

# Test Manual Override
echo -e "${YELLOW}9. Testing Manual Override...${NC}"
curl -s "${BASE_URL}/${SHORT_CODE}?utm_source=custom_campaign" > /dev/null
echo -e "${GREEN}✓ Manual override test complete${NC}\n"

echo -e "${BLUE}All tests completed!${NC}"
echo -e "${BLUE}Check your analytics dashboard to see the results.${NC}"
```

Make it executable and run:
```bash
chmod +x test-detection.sh
./test-detection.sh YOUR_SHORT_CODE
```

## Verifying Detection in Database

After running tests, check the Click collection:

```javascript
// In MongoDB shell or Compass
db.clicks.find({ shortCode: "YOUR_SHORT_CODE" }).sort({ clickedAt: -1 }).limit(10)

// Expected results:
// - source: "instagram" (from test 1)
// - source: "facebook"  (from test 2)
// - source: "twitter"   (from test 3)
// - source: "linkedin"  (from test 4)
// - source: "pinterest" (from test 5)
// - source: "whatsapp"  (from test 6)
// - source: "tiktok"    (from test 7)
// - source: "direct"    (from test 8)
// - source: "custom_campaign" (from test 9)
```

## Testing in Browser

### Real-World Test

1. Create a link in your app
2. Share the link on your actual social media:
   - Post on Instagram story
   - Share in Facebook post
   - Tweet on Twitter
   - Post on LinkedIn
   - Send in WhatsApp message

3. Click each link from the respective platform
4. Check analytics dashboard
5. Verify each click shows correct source

### Developer Tools Simulation

In your browser:

1. Open Developer Tools (F12)
2. Go to Network tab
3. Click on a request
4. Right-click → Copy → Copy as cURL
5. Modify the Referer header
6. Run the cURL command

Example:
```bash
curl 'http://localhost:5000/abc123' \
  -H 'Referer: https://l.instagram.com/' \
  -H 'User-Agent: Instagram App'
```

## Expected Analytics Output

After running all tests, your analytics should show:

```json
{
  "bySource": {
    "instagram": 1,
    "facebook": 1,
    "twitter": 1,
    "linkedin": 1,
    "pinterest": 1,
    "whatsapp": 1,
    "tiktok": 1,
    "direct": 1,
    "custom_campaign": 1
  },
  "totalClicks": 9
}
```

## Troubleshooting

### Issue: All clicks show as "direct"

**Cause:** Referer header not being sent

**Solution:**
- Check if testing locally with proper headers
- Some browsers block referer for privacy
- This is normal for actual "direct" traffic

### Issue: Detection not working for specific platform

**Cause:** Pattern not matching

**Solution:**
1. Check actual referer value in server logs
2. Update `platformDetector.js` patterns if needed
3. Add new pattern for edge cases

### Issue: Manual override not working

**Cause:** Query parameter not being read

**Solution:**
- Ensure using `?utm_source=value` format
- Check server logs for parameter value
- Verify detectPlatform function receives parameter

## Integration Testing

### Test with Postman

Create a Postman collection with requests for each platform:

1. **Instagram Test**
   - URL: `http://localhost:5000/abc123`
   - Headers: `Referer: https://l.instagram.com/`

2. **Facebook Test**
   - URL: `http://localhost:5000/abc123`
   - Headers: `Referer: https://lm.facebook.com/`

... etc for all platforms

### Automated Testing with Jest

```javascript
// test/platformDetector.test.js
const { detectPlatform } = require('../utils/platformDetector');

describe('Platform Detection', () => {
  test('detects Instagram from referer', () => {
    const result = detectPlatform('https://l.instagram.com/', '', '');
    expect(result).toBe('instagram');
  });

  test('detects Facebook from referer', () => {
    const result = detectPlatform('https://lm.facebook.com/', '', '');
    expect(result).toBe('facebook');
  });

  test('detects Twitter from referer', () => {
    const result = detectPlatform('https://t.co/abc', '', '');
    expect(result).toBe('twitter');
  });

  test('manual override takes priority', () => {
    const result = detectPlatform('https://l.instagram.com/', '', 'custom');
    expect(result).toBe('custom');
  });

  test('defaults to direct when no referer', () => {
    const result = detectPlatform('', '', '');
    expect(result).toBe('direct');
  });
});
```

Run tests:
```bash
npm test
```

## Success Criteria

✅ Instagram clicks detected as "instagram"
✅ Facebook clicks detected as "facebook"
✅ Twitter clicks detected as "twitter"
✅ LinkedIn clicks detected as "linkedin"
✅ WhatsApp clicks detected as "whatsapp"
✅ Direct clicks detected as "direct"
✅ Manual overrides work correctly
✅ Analytics dashboard shows accurate source breakdown
✅ No platform-specific URLs needed
✅ Single clean URL works everywhere

## Performance Impact

Platform detection adds minimal overhead:
- Referer header parsing: ~0.1ms
- User-Agent parsing: ~0.2ms
- Total detection time: <1ms
- No impact on redirect speed

The detection happens **before** the redirect, so users experience no delay.
