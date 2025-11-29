#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [ -f ".env" ]; then
  set -o allexport
  source .env
  set +o allexport
else
  echo "Missing supabase/.env — see example .env.example;"; exit 1
fi

SUPABASE_CLI="../node_modules/.bin/supabase"
DUMP_FILE="dump-data.sql"

echo "→ Dump from PROD;"
$SUPABASE_CLI db dump \
  --data-only \
  --db-url "postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres" \
  --file "./supabase/$DUMP_FILE"

echo "✓ Dump ready: $DUMP_FILE;"

echo "→ Upload dump to Local Supabase…;"
$SUPABASE_CLI db reset

echo "✓ Local DB updated"

rm -f "./$DUMP_FILE"
echo "✓ Dump file removed"