#!/bin/bash

echo "=== Testing Fishing & Excursions CMS Integration ==="
echo ""

# Test 1: Check if backend is running
echo "1. Checking Laravel backend..."
if curl -s http://127.0.0.1:8000/api/v1/services/fishing > /dev/null 2>&1; then
    echo "   ✅ Laravel API is running"
else
    echo "   ❌ Laravel API is NOT running. Start with: cd dmar-backend && php artisan serve"
    exit 1
fi

# Test 2: Check fishing content
echo ""
echo "2. Testing Fishing Content API..."
FISHING_RESPONSE=$(curl -s http://127.0.0.1:8000/api/v1/services/fishing)
if echo "$FISHING_RESPONSE" | grep -q "Sport Fishing Adventures"; then
    echo "   ✅ Fishing content loaded successfully"
    echo "   Title: $(echo "$FISHING_RESPONSE" | grep -o '"hero_title":"[^"]*"' | cut -d'"' -f4)"
else
    echo "   ❌ Fishing content not found"
fi

# Test 3: Check excursions content
echo ""
echo "3. Testing Excursions Content API..."
EXCURSIONS_RESPONSE=$(curl -s http://127.0.0.1:8000/api/v1/services/excursions)
if echo "$EXCURSIONS_RESPONSE" | grep -q "Magical Excursions"; then
    echo "   ✅ Excursions content loaded successfully"
    echo "   Title: $(echo "$EXCURSIONS_RESPONSE" | grep -o '"hero_title":"[^"]*"' | cut -d'"' -f4)"
else
    echo "   ❌ Excursions content not found"
fi

# Test 4: Check diving content (should exist from previous work)
echo ""
echo "4. Testing Diving Content API..."
DIVING_RESPONSE=$(curl -s http://127.0.0.1:8000/api/v1/services/diving)
if echo "$DIVING_RESPONSE" | grep -q "Discover the Underwater World"; then
    echo "   ✅ Diving content loaded successfully"
else
    echo "   ℹ️  Diving content not yet configured (optional)"
fi

# Test 5: Package counts
echo ""
echo "5. Content Statistics..."
FISHING_PACKAGES=$(echo "$FISHING_RESPONSE" | grep -o '"packages":\[' | wc -l)
EXCURSIONS_FEATURES=$(echo "$EXCURSIONS_RESPONSE" | grep -o '"features":\[' | wc -l)
echo "   Fishing packages section: $([ $FISHING_PACKAGES -gt 0 ] && echo '✅ Found' || echo '❌ Missing')"
echo "   Excursions features section: $([ $EXCURSIONS_FEATURES -gt 0 ] && echo '✅ Found' || echo '❌ Missing')"

echo ""
echo "=== Next Steps ==="
echo ""
echo "1. Start Next.js frontend:"
echo "   cd /Users/mohamedshuaib/Downloads/dmar && pnpm dev"
echo ""
echo "2. Visit pages:"
echo "   http://localhost:3000/services/fishing"
echo "   http://localhost:3000/services/excursions"
echo ""
echo "3. Edit content in admin:"
echo "   http://localhost:8000/admin/service-contents"
echo ""
