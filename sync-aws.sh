#!/bin/bash

# Konfiguracja
EC2_HOST="ec2-user@13.60.252.156"
LOCAL_DIR="/d/ecopywriting_pl_website"  # Format dla Git Bash w Windows
REMOTE_DIR="/home/ec2-user/ecopywriting"
SSH_KEY="/d/Piszemy.com.pl/client/moja-aplikacja-key-pair.pem"  # Format dla Git Bash w Windows

# Lista plików do synchronizacji
FILES_TO_SYNC=(
"src/components/auth/RegisterForm.tsx"
)

# Funkcja do synchronizacji pojedynczego pliku
sync_file() {
    local file=$1
    echo "Synchronizuję $file..."
    scp -i "$SSH_KEY" "$LOCAL_DIR/$file" "$EC2_HOST:$REMOTE_DIR/$file"
}

# Funkcja do synchronizacji wszystkich plików
sync_all() {
    for file in "${FILES_TO_SYNC[@]}"; do
        sync_file "$file"
    done
    echo "Synchronizacja zakończona!"
}

# Funkcja do synchronizacji pojedynczego pliku po nazwie
sync_specific() {
    local file_to_sync=$1
    if [[ " ${FILES_TO_SYNC[@]} " =~ " ${file_to_sync} " ]]; then
        sync_file "$file_to_sync"
    else
        echo "Plik $file_to_sync nie znajduje się na liście plików do synchronizacji!"
    fi
}

# Obsługa argumentów
case "$1" in
    "all")
        sync_all
        ;;
    *)
        if [ -n "$1" ]; then
            sync_specific "$1"
        else
            echo "Użycie:"
            echo "  $0 all - synchronizuje wszystkie pliki"
            echo "  $0 nazwa_pliku - synchronizuje pojedynczy plik"
        fi
        ;;
esac