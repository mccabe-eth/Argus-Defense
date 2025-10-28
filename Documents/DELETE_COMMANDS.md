# Commands to Delete

This document lists package.json commands that may be candidates for removal to simplify the project.

## Root package.json

### Account Management Commands (Consider Removing)
- `account`: Alias for backend account command, redundant with backend:account
- `account:generate`: Specific account management, rarely needed in day-to-day development
- `account:import`: One-time setup command, not needed frequently
- `account:reveal-pk`: Security-sensitive command that shouldn't be commonly used

### Build & Testing Commands (Consider Removing)
- `fork`: Mainnet forking feature, only needed for specific testing scenarios
- `compile`: Redundant with deploy which compiles automatically
- `format`: Code formatting, typically handled by editor or pre-commit hooks
- `generate`: Alias for account:generate, duplicate functionality
- `lint`: Usually run in CI/CD, not needed as top-level command
- `test`: Alias for backend:test, redundant

### Backend Namespace Commands (Keep for Organization)
These are duplicates but provide organization:
- `backend:account`
- `backend:chain`
- `backend:check-types`
- `backend:clean`
- `backend:compile`
- `backend:deploy`
- `backend:flatten`
- `backend:fork`
- `backend:format`
- `backend:generate`
- `backend:hardhat-verify`
- `backend:lint`
- `backend:lint-staged`
- `backend:test`
- `backend:verify`

### Frontend Namespace Commands (Consider Consolidating)
- `next:build`: Rarely called directly, used via deploy scripts
- `next:check-types`: Type checking, usually handled by editor
- `next:format`: Code formatting, handled by editor
- `next:lint`: Linting, usually run in CI/CD
- `next:serve`: Production server, not used in development

### Vercel Commands (Remove if Not Using Vercel)
- `vercel`: Vercel deployment, only needed if deploying to Vercel
- `vercel:login`: One-time setup
- `vercel:yolo`: Emergency deployment, shouldn't be standard workflow

### Git Hook Commands (Keep)
- `postinstall`: Installs git hooks, essential
- `precommit`: Git hook, essential for code quality

### IPFS Commands (Keep if Using IPFS)
- `ipfs`: IPFS deployment
- `build:ipfs`: Build for IPFS
- `deploy:ipfs`: Deploy to IPFS

## backend/package.json

### Account Commands (Consider Removing from Shortcuts)
- `account`: Used for debugging wallet state, needed occasionally
- `account:generate`: One-time setup
- `account:import`: One-time setup
- `account:reveal-pk`: Security-sensitive, rarely needed

### Hardhat Commands (Keep Core Ones)
- `clean`: Cleanup command, occasionally useful
- `flatten`: Contract flattening for verification, occasionally needed
- `hardhat-verify`: Manual verification, usually automated
- `check-types`: Type checking, handled by editor

### Development Commands (Keep)
- `chain`: Essential for local development
- `deploy`: Essential for contract deployment
- `compile`: Needed for contract changes
- `test`: Essential for testing

### Code Quality Commands (Consider Removing)
- `format`: Handled by editor/pre-commit
- `lint`: Handled by CI/CD
- `lint-staged`: Handled by git hooks

### Other Commands (Keep)
- `api`: Runs API server directly
- `api:dev`: Development mode with nodemon
- `websocket`: WebSocket server for OpenMHZ integration

## frontend/package.json

### Build Commands (Keep Essential Ones)
- `build`: Standard Next.js build, keep
- `build:ipfs`: IPFS-specific build, keep if using IPFS
- `deploy:ipfs`: IPFS deployment, keep if using IPFS
- `ipfs`: Complex IPFS upload, keep if using IPFS

### Development Commands (Keep)
- `dev`: Essential for development
- `start`: Alias for dev, keep for consistency
- `serve`: Production server, occasionally useful

### Code Quality Commands (Consider Removing)
- `format`: Handled by editor
- `lint`: Handled by CI/CD
- `check-types`: Handled by editor

### Vercel Commands (Remove if Not Using)
- `vercel`: Only if deploying to Vercel
- `vercel:login`: One-time setup
- `vercel:yolo`: Emergency deployment

## Recommendation Summary

**High Priority to Remove:**
1. All `account:*` commands (except from backend where they're defined)
2. Duplicate aliases (`account`, `generate`, `test`, etc.)
3. Code quality commands if handled by editor/CI (`format`, `lint`, `check-types`)
4. `compile` (redundant with deploy)
5. `fork` (specialized use case)
6. Vercel commands if not using Vercel platform

**Keep:**
1. Core development commands (`chain`, `deploy`, `register:streams`, `dev:full`)
2. Server commands (`p2p:start`, `api`, `websocket`)
3. Diagnostic commands (`p2p:diagnose`, `p2p:test`)
4. Git hooks (`postinstall`, `precommit`)
5. IPFS commands if using IPFS deployment

**Consider:**
1. Keep `backend:*` and `next:*` namespaced commands for explicit workspace targeting
2. Remove top-level aliases that duplicate namespaced commands
