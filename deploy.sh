#!/bin/bash

# ============================================
# deploy.sh - eCopywriting.pl Deployment Script
# ============================================

set -e  # Zatrzymaj przy błędzie

# Kolory
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

APP_DIR="/home/ec2-user/ecopywriting"
BACKUP_DIR="/home/ec2-user/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  eCopywriting.pl - Deploy Script${NC}"
echo -e "${GREEN}========================================${NC}"

cd $APP_DIR

# 1. Backup obecnego builda (opcjonalnie)
echo -e "\n${YELLOW}[1/7] Tworzenie backupu...${NC}"
mkdir -p $BACKUP_DIR
if [ -d ".next" ]; then
    cp -r .next "$BACKUP_DIR/.next_$TIMESTAMP" 2>/dev/null || true
    echo -e "${GREEN}✓ Backup utworzony: .next_$TIMESTAMP${NC}"
else
    echo -e "${YELLOW}⚠ Brak folderu .next do backupu${NC}"
fi

# 2. Pobierz najnowszy kod z GitHub
echo -e "\n${YELLOW}[2/7] Pobieranie kodu z GitHub...${NC}"
git pull origin main
echo -e "${GREEN}✓ Kod pobrany${NC}"

# 3. Instalacja zależności frontend
echo -e "\n${YELLOW}[3/7] Instalacja zależności frontend...${NC}"
npm ci --production=false
echo -e "${GREEN}✓ Zależności frontend zainstalowane${NC}"

# 4. Instalacja zależności backend
echo -e "\n${YELLOW}[4/7] Instalacja zależności backend...${NC}"
cd backend
npm ci --production=false
cd ..
echo -e "${GREEN}✓ Zależności backend zainstalowane${NC}"

# 5. Build aplikacji Next.js
echo -e "\n${YELLOW}[5/7] Budowanie aplikacji Next.js...${NC}"
npm run build
echo -e "${GREEN}✓ Build zakończony${NC}"

# 6. Restart PM2
echo -e "\n${YELLOW}[6/7] Restartowanie aplikacji (PM2)...${NC}"
pm2 restart ecosystem.config.js --update-env
echo -e "${GREEN}✓ Aplikacja zrestartowana${NC}"

# 7. Sprawdzenie statusu
echo -e "\n${YELLOW}[7/7] Sprawdzanie statusu...${NC}"
sleep 3
pm2 status

# Cleanup starych backupów (zachowaj 5 ostatnich)
echo -e "\n${YELLOW}Czyszczenie starych backupów...${NC}"
cd $BACKUP_DIR
ls -dt .next_* 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null || true

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ Deploy zakończony pomyślnie!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Frontend: https://www.ecopywriting.pl"
echo -e "Logi:     pm2 logs"
echo -e "Status:   pm2 status"