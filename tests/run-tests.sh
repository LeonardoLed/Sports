#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
node tests/database-service.test.js
node tests/week-database.test.js
node tests/week-source-audit.test.js
node tests/form-contract.test.js
node tests/data-source-audit.test.js
node tests/match-service-fallback.test.js
node tests/admin-auth.test.js
node tests/international-country.test.js
node tests/origin-persistence.test.js
python tests/seed-integrity.py
node --check assets/js/services/database-service.js
node --check assets/js/services/match-service.js
node --check assets/js/core/state.js
node --check assets/js/core/ui.js
node --check assets/js/pages/dashboard.js
node --check assets/js/pages/partidos.js
echo "PASS all tests"
