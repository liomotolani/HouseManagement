# HavenHub

HavenHub is a simple web-based home management system that helps housemates organize chores, split bills, track groceries, and manage household upkeep in one place.

## The Problem

Living with roommates often leads to confusion about everyday household responsibilities. 

Chores are written on sticky notes that get ignored. Utility bills arrive at different times and get lost in group chats. People forget who bought household essentials like dish soap or paper towels, and nobody remembers when an appliance was last serviced. 

When these tasks are scattered across different apps and text messages, things get missed and it is easy for housemates to feel frustrated.

## Who It Is For

This project is for roommates and housemates who share living spaces, everyday chores, and joint household expenses. 

They would use it daily to check off tasks, log shared utility bills, check grocery needs before shopping, and leave notes for the house.

## The Idea

The idea was to build a single home dashboard that keeps everything together with optional sign-in, no app store downloads, and no external servers. 

Everything runs directly in the web browser, saving data immediately on the device so housemates can start organizing right away. A first-time visitor can explore with pre-filled sample data, create their own account, or jump in with a 1-click demo persona (Alex, Maya, or Jordan) to see how isolated household dashboards work.

## How It Works

The system connects the main parts of running a shared home into simple steps:

0. **Signing In:** A user creates a free account (name, household name, email, password) or signs in. HavenHub keeps each household's data strictly isolated in its own browser storage slot, so one user can never see or edit another user's chores, bills, pantry, or notes.
1. **Managing Chores:** A user checks off a chore they finished. HavenHub marks the task completed, adds to that person's streak, and plays a short chime. The rest of the house can see who completed what.
2. **Splitting Bills:** A user logs an expense, such as the electric bill or internet payment, and chooses who paid it. HavenHub automatically divides the total evenly among housemates and updates everyone's balance so people know who owes money or is owed money.
3. **Tracking Supplies:** A user updates how many items are left in the pantry or fridge. If an item drops to its minimum level, HavenHub automatically adds it to the shared grocery checklist.
4. **Appliance Maintenance:** A user checks the maintenance list to see countdowns for tasks like changing the air filter. When the task is done, clicking one button resets the date and sets the next due date based on the service schedule.
5. **Noticeboard & Contacts:** Housemates can pin colored sticky notes for announcements and access emergency numbers for plumbers or the landlord with one click.
6. **Deleting an Account:** A user can permanently delete their account from the profile dropdown or the Settings "Danger Zone". The app asks them to type `DELETE` to confirm, then wipes the account and all of its private data (chore streaks, split bills, pantry inventory, appliance logs, and notes) and signs them out.

## Decisions I Made

**Decision:** Built with pure HTML, CSS, and vanilla JavaScript instead of frameworks like React or Tailwind.  
**Why:** I wanted a lightweight project that loads instantly, has zero build steps, and does not depend on third-party libraries.  
**Trade-off:** Writing all styles, modals, tabs, and data logic by hand required more initial setup than using prebuilt packages.

**Decision:** Added an optional sign-up / sign-in system with user-scoped local storage keys (`havenhub_user_data_${userId}`) instead of a single shared storage key.  
**Why:** It guarantees strict client-side data isolation so that users cannot see or modify each other's dashboards, chores, expenses, or pantry inventory, while still requiring no server or build step.  
**Trade-off:** Isolation is per-browser, not per-device across the internet, so a household still cannot collaborate live from separate machines.

**Decision:** Required typing `DELETE` (with a live-validated button) to delete an account, rather than a single confirm dialog.  
**Why:** Account deletion is irreversible and wipes an entire household's private data, so it needs a stronger guard than the single-click confirm used for chores, expenses, and pantry items.  
**Trade-off:** It is one extra step, but the irreversible nature of the action justifies it.

**Decision:** Linked pantry stock levels directly to the grocery shopping list.  
**Why:** When items like cooking oil or laundry detergent run out, people often forget to write them down. Automating this removes a step for the household.  
**Trade-off:** If a user sets a minimum threshold too high, items can show up on the grocery list sooner than needed.

**Decision:** Included realistic sample household data on the first visit, plus 1-click demo personas (Alex, Maya, Jordan) that can be restored if deleted.  
**Why:** An empty screen makes it difficult to see how chore streaks, spending charts, and split balances work. Sample data gives immediate context, and the restore link lets testers bring the demo accounts back.  
**Trade-off:** A user has to remove or replace sample entries when they want to start fresh with their own home data.

## What I Learned

Modern vanilla HTML, CSS, and JavaScript combined with local storage can easily handle a complete, interactive, multi-module app without React or Tailwind. 

Browser standards today have enough built-in capability—such as CSS grid, CSS variables, and the Web Audio API—to create a responsive and reliable product with zero external dependencies.

## What Is Still Unfinished

* **Multi-device sync:** Because data is stored in the browser's local storage, there is no real-time sync between different housemates' phones or laptops.
* **Long-term real-world use:** The features work in testing, but the app has not yet been used over multiple months in an active household to see how well the split calculations hold up over time.
* **Custom split ratios:** Currently, the bill split divides costs equally among all members. It does not yet support unequal splits for rooms of different sizes.

## What I Would Improve Next

* Add an optional peer-to-peer or lightweight sync option so roommates can make updates from their own devices.
* Allow custom split percentages for rent and utilities.
* Add receipt attachments or payment link shortcuts to make settling balances faster.

## Final Notes

* **Status:** Working local prototype with multi-user sign-in and full per-account delete.
* **Technology:** HTML5, CSS3, Vanilla JavaScript (zero external dependencies; Google Fonts only for typography).
* **Storage:** Browser `localStorage` with per-user scoped keys, JSON export/import for backups, and a factory reset to sample data.
* **Delete coverage:** Chores, expenses, pantry items, grocery items, appliances, residents, emergency contacts, noticeboard notes, and entire accounts can all be removed; account deletion requires typing `DELETE` to confirm.
