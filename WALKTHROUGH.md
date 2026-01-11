# Wilowest React Migration Walkthrough

The migration of the Wilowest game logic to React has been completed. This document outlines the changes made and how to verify them.

## Changes Implemented

### 1. State Management (`GameContext.js`)
- Added `ADD_MONEY` action for atomic updates to `mainCompanyMoney`, preventing race conditions in the game loop.
- Added `SET_CANDIDATES` and `REMOVE_OFFICIAL` actions to manage RRHH state.
- Exposed `addMoney`, `setCandidates`, and `removeOfficial` helpers.

### 2. Company Management (`CompanyBox.js`)
- Implemented **Merge Functionality**:
  - Validates merge conditions (same type, same tier, 2 other companies available).
  - Merges 3 companies into one of the next tier.
  - Combines accumulated value and counter.
- Updated to use `addMoney` for safer income updates.
- Verified official bonuses are correctly calculated based on `hiredOfficials`.

### 3. Investigation Tree (`InvestigationTree.js`)
- Ported full logic from legacy JavaScript.
- Implemented visual tree structure with branches.
- Added purchase logic checking for both Money and Research Points.
- Integrated with global game state.
- Created dedicated styles in `src/styles/InvestigationTree.css`.

### 4. Human Resources (`RRHH.js`)
- Ported candidate generation and hiring logic.
- Implemented "Search Candidates" with a progress timer.
- Added Official management:
  - **Hiring**: Moves candidate to hired list.
  - **Assignment**: Assign officials to specific companies to boost their production.
  - **Training**: Increases official stats over time (5-minute cooldown).
  - **Firing**: Removes official from the company.
- Created dedicated styles in `src/styles/RRHH.css`.

## Verification Steps

### Company Logic
1. Create 3 companies of the same type (e.g., Petrolera).
2. Upgrade them if they are Tier 0 (require level 10 to merge).
3. Verify the "Merge" button appears when conditions are met.
4. Click "Merge" and verify:
   - 2 companies are removed.
   - 1 company becomes Tier 1.
   - Stats are combined.

### Investigation Tree
1. Navigate to "Technology".
2. Verify tree structure renders correctly.
3. Click a technology to open the purchase modal.
4. Verify "Investigar" button is enabled only if you have enough funds and points.
5. Purchase a tech and verify resource/production bonuses apply (this requires checking company output).

### RRHH
1. Navigate to "RRHH".
2. Click "Forzar Búsqueda" or wait for the timer.
3. Hire a candidate.
4. Assign the official to a company.
5. Go back to Home and check that the company now receives a production bonus (inspect `CompanyBox` output if possible, or verify visually if indicators exist).
6. Train an official and verify the timer starts locally and persists.

## Next Steps
- Remove legacy files (`index.js`, `rrhh.js`, `styles.css`, etc.) from the root directory once verification is complete to keep the project clean.
