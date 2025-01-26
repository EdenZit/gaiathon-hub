# Migration Plan

## Phase 1: Route Structure
1. Create new route groups
   - (auth) for authentication routes
   - (dashboard) for dashboard routes
   - (workspace) for team workspace routes

2. Standardize API routes
   - Move /api/team to /api/teams
   - Move /api/user to /api/users
   - Create /api/integrations

3. Update middleware
   - Add route group protection
   - Implement proper auth checks
   - Add API route protection

## Phase 2: Component Organization
1. Create new component structure
   - /components/common
   - /components/features
   - /components/layout
   - /components/ui

2. Move components
   - Migrate team-workspace to features/teams
   - Migrate ai-assistant to features/ai
   - Migrate eo-tools to features/tools

3. Update imports
   - Update all component imports
   - Fix any broken references

## Phase 3: Data Layer
1. Set up models
   - Create proper Mongoose models
   - Add schema validations
   - Add proper typing

2. Create service layer
   - Add team services
   - Add user services
   - Add integration services

3. Add type definitions
   - Add proper .d.ts files
   - Add API type definitions
   - Add model type definitions

## Phase 4: Docker Integration
1. Update Docker configuration
   - Add proper volume mounts
   - Update environment variables
   - Add development overrides

2. Add MongoDB Atlas connection
   - Add connection pooling
   - Add proper error handling
   - Add reconnection logic

## Migration Steps:

1. **Preparation**
   ```bash
   # Create backup branch
   git checkout -b feature/restructure
   
   # Create new directories
   mkdir -p src/app/(auth) src/app/(dashboard) src/app/(workspace)
   mkdir -p src/components/{common,features,layout,ui}
   mkdir -p src/lib/{api,db,services,utils}
   ```

2. **Route Migration**
   - Move auth routes to (auth) group
   - Move dashboard routes to (dashboard) group
   - Move team routes to (workspace) group

3. **Component Migration**
   - Move components to new structure
   - Update imports
   - Test functionality

4. **Data Layer Setup**
   - Set up models
   - Add services
   - Add types

5. **Testing**
   - Test all routes
   - Test component rendering
   - Test data flow
   - Test Docker setup

## Rollback Plan:
1. Commit each phase separately
2. Create restore points
3. Test each phase before proceeding 