# Project journal

This file is a chronological record of what was built, key decisions, what changed, and what is still being figured out for HavenHub.

## September 18, 2026

### What I worked on

* Planned and built the initial version of HavenHub, a browser-based home management tool.
* Created five core modules: a chore tracker with completion streaks, an expense splitter for rent and utilities, a pantry inventory that links to a grocery list, an appliance maintenance log with service countdowns, and a household noticeboard with emergency contacts.
* Added light and dark display modes.
* Added pre-filled sample data so the app can be used and understood immediately on first load.
* Started a local web server to test the app and checked the code for errors.

### What I decided

**Decision:** Built the entire app using plain HTML, CSS, and JavaScript with no frameworks or libraries (no Tailwind, no React).  
**Why:** I wanted a lightweight tool that runs in any browser without needing build tools, downloads, or package managers.

**Decision:** Stored all data in the browser's local storage instead of a cloud database.  
**Why:** It keeps household data private on the user's computer and lets people start using the tool immediately without creating an account.

**Decision:** Connected the pantry inventory directly to the grocery list so items automatically appear when stock runs low.  
**Why:** People often forget to write down basic supplies like dish soap or cooking oil when they run out, so automating that step prevents forgotten items.

**Decision:** Populated the app with realistic sample data on first visit.  
**Why:** A blank dashboard makes it hard to see how bill splits, chore streaks, and spending charts work together.

### What changed

* I planned to run automated browser tests to capture video recordings of the app, but the automated browser tool failed to install its driver. I shifted to verifying the app manually using the local web server.

### What I learned

* Modern vanilla HTML, CSS, and JavaScript with browser local storage can handle a complete, interactive, multi-module app without React or Tailwind. Standard browser features are more than enough for responsive layouts, simple sound effects, and local data persistence.

### What I'm figuring out

* I am still figuring out how roommates can use the app together from separate phones or laptops, since browser local storage only stays on one device.
* I am not sure yet whether equal bill splits are flexible enough for real households, or if I will need to support custom split percentages for roommates who have different room sizes.
* I still need to test whether auto-adding pantry items to the grocery list clutters the list when stock levels are not configured carefully.

## September 28, 2026

### What I worked on

* Added a complete Sign Up and Sign In authentication system (`js/auth.js` and `css/auth.css`).
* Implemented multi-user data isolation in `js/storage.js` using user-scoped storage keys (`havenhub_user_data_${userId}`).
* Each user now has their own private dashboard, chores, expenses, pantry inventory, appliance maintenance schedule, and noticeboard.
* Added pre-seeded demo accounts (Alex Rivera - Oakwood Haven, Maya Chen - Skyline Loft, Jordan Taylor - Pinecrest Studio) with 1-click test buttons.
* Added a floating user profile dropdown in the top header with account switching, household status, and sign out options.
* Added a personalized dashboard welcome banner that displays the logged-in user's name, household name, and resident role.

### What I decided

**Decision:** Implemented user-scoped local storage keys (`havenhub_user_data_${userId}`) rather than a single shared storage key.  
**Why:** Guarantees strict client-side data isolation so that users cannot see or modify each other's dashboards, chores, expenses, or pantry inventory.

**Decision:** Created 1-click quick-login demo accounts for Alex, Maya, and Jordan alongside full sign-up for new users.  
**Why:** Enables instant testing of cross-user dashboard isolation without having to manually register multiple accounts each time.

## October 7, 2026

### What I worked on

* Audited every delete/remove action across the app and found the account-deletion feature was incomplete: the `promptDeleteAccount` function was called in three places (profile dropdown, Settings "Danger Zone", and the account-switcher list) but was never defined, so clicking "Delete Account" threw a `ReferenceError`.
* Implemented `window.promptDeleteAccount(userId)` in `js/app.js` — opens a danger-confirmation modal that lists exactly what will be erased and requires typing `DELETE` before the button activates.
* Implemented `window.handleConfirmAccountDelete(userId, wasActive)` which calls the existing `AuthManager.deleteAccount()` and `HouseholdStorage.deleteUserData()`, then signs the user out if it was the active account or refreshes the UI if it was another account.
* Fixed two other undefined helpers: `handleRestoreDemoAccounts` (wires the "Restore Default Demo Accounts" link to `AuthManager.restoreDemoAccounts()`) and `renderAuthDemoGrid` (dynamically renders the 1-click demo login chips and toggles the restore link based on which demo accounts still exist).
* Verified the full delete chain end to end: UI button → confirmation modal → auth deletion → storage wipe → session cleanup → re-render. Confirmed all `window.*` calls now have matching definitions and all JS files pass `node --check`.

### What I decided

**Decision:** Required typing `DELETE` (with a live-validated button) instead of a simple `confirm()` for account deletion.  
**Why:** Account deletion is irreversible and wipes an entire household's data, so it deserves a stronger guard than the single-click confirm used for chores, expenses, and pantry items.

**Decision:** Reused the existing `AuthManager.deleteAccount()` and `HouseholdStorage.deleteUserData()` backend rather than adding new storage logic.  
**Why:** The data-isolation and cleanup logic was already correct; only the UI wiring was missing, so the fix stayed small and avoided duplicating deletion rules.

### What I learned

* A feature can look "done" in the markup (buttons present, backend methods present) yet still be broken if the bridging function is never defined. Grepping every `window.X(` call against every `window.X =` definition is a fast way to catch these gaps in a no-framework codebase.

### What I'm figuring out

* Whether account deletion should also offer a "keep the household data but remove me" option for shared homes, versus the current full wipe of the deleted user's scoped storage.
