#!/bin/bash

# Script to manage images between development and production environments
# Usage: ./manage-images.sh [backup|restore|sync-to-prod|sync-from-prod]

set -e

IMAGE_DIR="./public/images"
BACKUP_DIR="./image-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

backup_images() {
  echo "Backing up images to $BACKUP_DIR/images_$TIMESTAMP.tar.gz"
  tar -czf "$BACKUP_DIR/images_$TIMESTAMP.tar.gz" -C "./public" images
  echo "Backup complete!"
}

restore_images() {
  if [ -z "$1" ]; then
    # List available backups
    echo "Available backups:"
    ls -lt "$BACKUP_DIR" | grep "images_" | awk '{print $9}'
    echo "Usage: ./manage-images.sh restore [backup_filename]"
    exit 1
  fi
  
  BACKUP_FILE="$BACKUP_DIR/$1"
  if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
  fi
  
  echo "Restoring images from $BACKUP_FILE"
  rm -rf "$IMAGE_DIR"
  tar -xzf "$BACKUP_FILE" -C "./public"
  echo "Restore complete!"
}

sync_to_production() {
  if [ -z "$1" ]; then
    echo "Usage: ./manage-images.sh sync-to-prod [production_server]"
    exit 1
  fi
  
  PROD_SERVER="$1"
  echo "Syncing images to production server: $PROD_SERVER"
  
  # First backup current images
  backup_images
  
  # Sync to production using rsync
  rsync -avz --delete "$IMAGE_DIR/" "$PROD_SERVER:/app/public/images/"
  echo "Sync to production complete!"
}

sync_from_production() {
  if [ -z "$1" ]; then
    echo "Usage: ./manage-images.sh sync-from-prod [production_server]"
    exit 1
  fi
  
  PROD_SERVER="$1"
  echo "Syncing images from production server: $PROD_SERVER"
  
  # First backup current images
  backup_images
  
  # Sync from production using rsync
  rsync -avz "$PROD_SERVER:/app/public/images/" "$IMAGE_DIR/"
  echo "Sync from production complete!"
}

case "$1" in
  backup)
    backup_images
    ;;
  restore)
    restore_images "$2"
    ;;
  sync-to-prod)
    sync_to_production "$2"
    ;;
  sync-from-prod)
    sync_from_production "$2"
    ;;
  *)
    echo "Usage: $0 [backup|restore|sync-to-prod|sync-from-prod]"
    exit 1
    ;;
esac

exit 0 