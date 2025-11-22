#!/usr/bin/env bash
#
# Скрипт для исправления проблем с фронтендом
# Запускать на сервере: sudo bash scripts/fix_frontend.sh

set -euo pipefail

FRONTEND_PORT="${FRONTEND_PORT:-5173}"
FRONTEND_SERVICE_NAME="${FRONTEND_SERVICE_NAME:-synthetic-id-frontend}"
APP_USER="${APP_USER:-sidapp}"
APP_DIR="${APP_DIR:-/opt/synthetic-id}"
FRONTEND_DIR="${APP_DIR}/frontend"

if [[ $EUID -ne 0 ]]; then
  echo "This script must be run as root (use sudo)." >&2
  exit 1
fi

echo "=== Исправление проблем с фронтендом ==="
echo ""

# 1. Проверяем и исправляем systemd service
echo "1. Проверка systemd service..."
if [[ -f "/etc/systemd/system/${FRONTEND_SERVICE_NAME}.service" ]]; then
  # Проверяем, что serve слушает на 0.0.0.0
  if ! grep -q "tcp://0.0.0.0" "/etc/systemd/system/${FRONTEND_SERVICE_NAME}.service"; then
    echo "  ⚠️  Обновляю конфигурацию сервиса..."
    sed -i 's|-l [0-9]*|-l tcp://0.0.0.0:'"${FRONTEND_PORT}"'|g' "/etc/systemd/system/${FRONTEND_SERVICE_NAME}.service"
    systemctl daemon-reload
    echo "  ✅ Конфигурация обновлена"
  else
    echo "  ✅ Конфигурация правильная"
  fi
else
  echo "  ❌ Файл сервиса не найден. Создайте его вручную или перезапустите provision_vds.sh"
fi
echo ""

# 2. Открываем порт в firewall
echo "2. Настройка firewall..."
if command -v ufw >/dev/null 2>&1; then
  if ufw status | grep -q "${FRONTEND_PORT}"; then
    echo "  ✅ Порт уже открыт в ufw"
  else
    echo "  🔧 Открываю порт ${FRONTEND_PORT} в ufw..."
    ufw allow ${FRONTEND_PORT}/tcp
    echo "  ✅ Порт открыт"
  fi
elif command -v iptables >/dev/null 2>&1; then
  echo "  🔧 Проверяю iptables..."
  if iptables -C INPUT -p tcp --dport ${FRONTEND_PORT} -j ACCEPT 2>/dev/null; then
    echo "  ✅ Правило уже существует"
  else
    iptables -A INPUT -p tcp --dport ${FRONTEND_PORT} -j ACCEPT
    echo "  ✅ Правило добавлено"
    echo "  ⚠️  Не забудьте сохранить правила: sudo iptables-save > /etc/iptables/rules.v4"
  fi
else
  echo "  ℹ️  Firewall не найден (ufw/iptables)"
fi
echo ""

# 3. Перезапускаем сервис
echo "3. Перезапуск сервиса..."
systemctl restart "${FRONTEND_SERVICE_NAME}"
sleep 2
if systemctl is-active --quiet "${FRONTEND_SERVICE_NAME}"; then
  echo "  ✅ Сервис запущен"
else
  echo "  ❌ Сервис не запустился. Проверьте логи: journalctl -u ${FRONTEND_SERVICE_NAME} -n 50"
fi
echo ""

# 4. Проверяем, что порт слушается
echo "4. Проверка порта..."
sleep 1
if command -v ss >/dev/null 2>&1; then
  if ss -tlnp | grep -q ":${FRONTEND_PORT}"; then
    echo "  ✅ Порт ${FRONTEND_PORT} слушается"
    ss -tlnp | grep ":${FRONTEND_PORT}"
  else
    echo "  ❌ Порт ${FRONTEND_PORT} не слушается"
  fi
else
  if netstat -tlnp | grep -q ":${FRONTEND_PORT}"; then
    echo "  ✅ Порт ${FRONTEND_PORT} слушается"
  else
    echo "  ❌ Порт ${FRONTEND_PORT} не слушается"
  fi
fi
echo ""

# 5. Проверяем локальное подключение
echo "5. Проверка локального подключения..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:${FRONTEND_PORT} | grep -q "200\|404"; then
  echo "  ✅ Локальное подключение работает"
else
  echo "  ❌ Локальное подключение не работает"
  echo "  Проверьте логи: journalctl -u ${FRONTEND_SERVICE_NAME} -f"
fi
echo ""

EXTERNAL_IP=$(hostname -I | awk '{print $1}')
echo "=== Результат ==="
echo "Если все проверки пройдены, фронтенд должен быть доступен по адресу:"
echo "  http://${EXTERNAL_IP}:${FRONTEND_PORT}"
echo ""
echo "Если проблема остаётся:"
echo "  1. Проверьте Security Groups в панели управления облачного провайдера"
echo "  2. Убедитесь, что порт ${FRONTEND_PORT} открыт для входящих соединений"
echo "  3. Проверьте логи: journalctl -u ${FRONTEND_SERVICE_NAME} -f"
echo ""


