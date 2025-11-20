#!/usr/bin/env bash
#
# Bootstrap script for deploying the Synthetic ID Generator backend
# onto a fresh Debian/Ubuntu-based VDS. Edit the variables in the
# CONFIG section or pass them as environment variables before running.

set -euo pipefail

##############################################
# CONFIG (override by exporting before run)  #
##############################################
APP_USER="${APP_USER:-sidapp}"
APP_DIR="${APP_DIR:-/opt/synthetic-id}"
REPO_URL="${REPO_URL:-}"
REPO_BRANCH="${REPO_BRANCH:-main}"
NODE_MAJOR="${NODE_MAJOR:-20}"
DB_NAME="${DB_NAME:-sid_db}"
DB_USER="${DB_USER:-sid_user}"
DB_PASS="${DB_PASS:-ChangeMe123!}"
API_PORT="${API_PORT:-3000}"
SERVICE_NAME="${SERVICE_NAME:-synthetic-id-backend}"

##############################################

if [[ $EUID -ne 0 ]]; then
  echo "This script must be run as root (use sudo)." >&2
  exit 1
fi

echo "[1/9] Updating apt and installing base packages..."
apt-get update -y
apt-get install -y curl ca-certificates gnupg git build-essential

echo "[2/9] Installing Node.js ${NODE_MAJOR}.x..."
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1)" -ne "${NODE_MAJOR}" ]]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi

echo "[3/9] Installing PostgreSQL + Redis..."
apt-get install -y postgresql postgresql-contrib redis-server
systemctl enable --now postgresql
systemctl enable --now redis-server

echo "[4/9] Creating PostgreSQL role/database..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASS}';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 \
  || sudo -u postgres createdb -O "${DB_USER}" "${DB_NAME}"

echo "[5/9] Creating application user and directories..."
if ! id -u "${APP_USER}" >/dev/null 2>&1; then
  useradd --system --create-home --shell /bin/bash "${APP_USER}"
fi
mkdir -p "${APP_DIR}"
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

echo "[6/9] Preparing application sources..."
if [[ -n "${REPO_URL}" ]]; then
  if [[ -d "${APP_DIR}/.git" ]]; then
    sudo -u "${APP_USER}" git -C "${APP_DIR}" fetch --all
    sudo -u "${APP_USER}" git -C "${APP_DIR}" checkout "${REPO_BRANCH}"
    sudo -u "${APP_USER}" git -C "${APP_DIR}" pull origin "${REPO_BRANCH}"
  else
    sudo -u "${APP_USER}" git clone --branch "${REPO_BRANCH}" "${REPO_URL}" "${APP_DIR}"
  fi
else
  echo "  REPO_URL not provided — expecting sources already present in ${APP_DIR}"
fi

BACKEND_DIR="${APP_DIR}/backend"
if [[ ! -d "${BACKEND_DIR}" ]]; then
  echo "Backend directory ${BACKEND_DIR} not found. Update APP_DIR/REPO_URL." >&2
  exit 1
fi

echo "[7/9] Installing backend dependencies and building..."
sudo -u "${APP_USER}" bash -lc "cd '${BACKEND_DIR}' && npm ci && npm run build"

ENV_FILE="${BACKEND_DIR}/.env"
echo "[8/9] Generating .env at ${ENV_FILE}..."
cat <<EOF >"${ENV_FILE}"
NODE_ENV=production
PORT=${API_PORT}
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}
REDIS_URL=redis://127.0.0.1:6379
THROTTLE_LIMIT=100
EOF
chown "${APP_USER}:${APP_USER}" "${ENV_FILE}"
chmod 600 "${ENV_FILE}"

echo "[8b/9] Running database migrations..."
sudo -u "${APP_USER}" bash -lc "cd '${BACKEND_DIR}' && npm run db:migrate"

SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
echo "[9/9] Creating systemd service ${SERVICE_NAME}..."
cat <<EOF >"${SERVICE_FILE}"
[Unit]
Description=Synthetic ID Generator backend
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=${APP_USER}
WorkingDirectory=${BACKEND_DIR}
EnvironmentFile=${ENV_FILE}
ExecStart=$(command -v node) dist/main.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now "${SERVICE_NAME}.service"

echo ""
echo "Deployment complete!"
echo "Service status: systemctl status ${SERVICE_NAME}"
echo "Logs: journalctl -u ${SERVICE_NAME} -f"
echo "Remember to generate an API key: sudo -u ${APP_USER} bash -lc \"cd '${BACKEND_DIR}' && npm run key:create\""

