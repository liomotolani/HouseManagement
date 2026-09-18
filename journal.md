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
