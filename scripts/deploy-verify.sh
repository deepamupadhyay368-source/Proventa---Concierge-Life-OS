#!/bin/bash
set -e

echo "=========================================="
echo "  PROVENTA PRODUCTION DEPLOYMENT CHECK    "
echo "=========================================="

TARGET_URL=${1:-"http://localhost:3000"}

echo "Checking Target: $TARGET_URL"

# 1. Health API Check
echo -n "Checking /api/health... "
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL/api/health")
if [ "$HEALTH_STATUS" -eq 200 ]; then
    echo "✓ PASS (HTTP 200)"
else
    echo "✗ FAIL (HTTP $HEALTH_STATUS)"
    exit 1
fi

# 2. Public Wave 1 Page Check
echo -n "Checking /wave1 (Cohort 1 Admissions)... "
WAVE1_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL/wave1")
if [ "$WAVE1_STATUS" -eq 200 ]; then
    echo "✓ PASS (HTTP 200)"
else
    echo "✗ FAIL (HTTP $WAVE1_STATUS)"
    exit 1
fi

# 3. Gateway Integrations Health Check
echo -n "Checking /api/admin/gateway-integrations... "
GATEWAY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL/api/admin/gateway-integrations")
if [ "$GATEWAY_STATUS" -eq 200 ] || [ "$GATEWAY_STATUS" -eq 401 ]; then
    echo "✓ PASS (Online & Protected)"
else
    echo "✗ FAIL (HTTP $GATEWAY_STATUS)"
    exit 1
fi

echo "=========================================="
echo "✓ ALL PRODUCTION HEALTH CHECKS PASSED     "
echo "=========================================="

