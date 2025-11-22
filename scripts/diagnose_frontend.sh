#!/usr/bin/env bash
#
# Скрипт диагностики проблем с фронтендом
# Запускать на сервере: sudo bash scripts/diagnose_frontend.sh

set -euo pipefail

FRONTEND_PORT="${FRONTEND_PORT:-5173}"
FRONTEND_SERVICE_NAME="${FRONTEND_SERVICE_NAME:-synthetic-id-frontend}"

echo "=== Диагностика фронтенда ==="
echo ""

echo "1. Проверка статуса сервиса:"
systemctl status "${FRONTEND_SERVICE_NAME}" --no-pager -l || echo "  ❌ Сервис не найден или не запущен"
echo ""

echo "2. Проверка последних логов:"
journalctl -u "${FRONTEND_SERVICE_NAME}" -n 20 --no-pager || echo "  ❌ Логи недоступны"
echo ""

echo "3. Проверка, слушается ли порт ${FRONTEND_PORT}:"
if command -v ss >/dev/null 2>&1; then
  ss -tlnp | grep ":${FRONTEND_PORT}" || echo "  ❌ Порт ${FRONTEND_PORT} не слушается"
else
  netstat -tlnp | grep ":${FRONTEND_PORT}" || echo "  ❌ Порт ${FRONTEND_PORT} не слушается"
fi
echo ""

echo "4. Проверка firewall (ufw):"
if command -v ufw >/dev/null 2>&1; then
  ufw status | grep "${FRONTEND_PORT}" || echo "  ⚠️  Порт ${FRONTEND_PORT} не найден в правилах ufw"
else
  echo "  ℹ️  ufw не установлен"
fi
echo ""

echo "5. Проверка firewall (iptables):"
if command -v iptables >/dev/null 2>&1; then
  iptables -L INPUT -n | grep "${FRONTEND_PORT}" || echo "  ⚠️  Порт ${FRONTEND_PORT} не найден в правилах iptables"
else
  echo "  ℹ️  iptables не установлен"
fi
echo ""

echo "6. Проверка локального подключения:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:${FRONTEND_PORT} | grep -q "200\|404"; then
  echo "  ✅ Локальное подключение работает"
else
  echo "  ❌ Локальное подключение не работает"
fi
echo ""

echo "7. Проверка внешнего IP:"
EXTERNAL_IP=$(hostname -I | awk '{print $1}')
echo "  IP адрес: ${EXTERNAL_IP}"
echo ""

echo "8. Проверка конфигурации systemd service:"
if [[ -f "/etc/systemd/system/${FRONTEND_SERVICE_NAME}.service" ]]; then
  echo "  ✅ Файл сервиса существует"
  echo "  Содержимое ExecStart:"
  grep "ExecStart" "/etc/systemd/system/${FRONTEND_SERVICE_NAME}.service" || echo "  ❌ ExecStart не найден"
else
  echo "  ❌ Файл сервиса не найден"
fi
echo ""

echo "=== Рекомендации ==="
echo ""
echo "Если порт не слушается:"
echo "  1. Проверьте логи: journalctl -u ${FRONTEND_SERVICE_NAME} -f"
echo "  2. Перезапустите сервис: sudo systemctl restart ${FRONTEND_SERVICE_NAME}"
echo ""
echo "Если firewall блокирует:"
echo "  1. Откройте порт: sudo ufw allow ${FRONTEND_PORT}/tcp"
echo "  2. Или для iptables: sudo iptables -A INPUT -p tcp --dport ${FRONTEND_PORT} -j ACCEPT"
echo ""
echo "Если проблема в облачном провайдере:"
echo "  1. Проверьте Security Groups / Firewall Rules в панели управления"
echo "  2. Убедитесь, что порт ${FRONTEND_PORT} открыт для входящих соединений"
echo ""


