#!/bin/bash

# Navigate to the application directory
cd /var/www/gaiathon-hub

# Find all route.ts files and replace middleware with config
find src/app/api -name "route.ts" -type f -exec sed -i "s/export const middleware/export const config/g" {} \;

# List of specific files to check for middleware exports
FILES_TO_CHECK=(
  "src/app/api/admin/teams/route.ts"
  "src/app/api/admin/teams/[id]/route.ts"
  "src/app/api/admin/teams/[id]/status/route.ts"
  "src/app/api/admin/teams/[id]/members/route.ts"
  "src/app/api/admin/teams/[id]/members/[memberId]/route.ts"
  "src/app/api/admin/teams/export/route.ts"
  "src/app/api/admin/users/[userId]/role/route.ts"
  "src/app/api/admin/users/[userId]/status/route.ts"
  "src/app/api/admin/users/[userId]/team-role/route.ts"
  "src/app/api/admin/users/export/route.ts"
)

# Remove any middleware exports from these files
for file in "${FILES_TO_CHECK[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing file: $file"
    sed -i "/export.*middleware/d" "$file"
  fi
done

echo "All route files fixed successfully!"
