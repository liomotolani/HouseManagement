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

The idea was to build a single home dashboard that keeps everything together without requiring user accounts, passwords, or app store downloads. 

Everything runs directly in the web browser, saving data immediately on the device so housemates can start organizing right away.

## How It Works

The system connects the main parts of running a shared home into simple steps:

1. **Managing Chores:** A user checks off a chore they finished. HavenHub marks the task completed, adds to that person's streak, and plays a short chime. The rest of the house can see who completed what.
2. **Splitting Bills:** A user logs an expense, such as the electric bill or internet payment, and chooses who paid it. HavenHub automatically divides the total evenly among housemates and updates everyone's balance so people know who owes money or is owed money.
3. **Tracking Supplies:** A user updates how many items are left in the pantry or fridge. If an item drops to its minimum level, HavenHub automatically adds it to the shared grocery checklist.
4. **Appliance Maintenance:** A user checks the maintenance list to see countdowns for tasks like changing the air filter. When the task is done, clicking one button resets the date and sets the next due date based on the service schedule.
5. **Noticeboard & Contacts:** Housemates can pin colored sticky notes for announcements and access emergency numbers for plumbers or the landlord with one click.

## Decisions I Made

**Decision:** Built with pure HTML, CSS, and vanilla JavaScript instead of frameworks like React or Tailwind.  
**Why:** I wanted a lightweight project that loads instantly, has zero build steps, and does not depend on third-party libraries.  
**Trade-off:** Writing all styles, modals, tabs, and data logic by hand required more initial setup than using prebuilt packages.

**Decision:** Used browser local storage instead of an online database or user accounts.  
**Why:** It keeps all household information completely private on the user's machine and lets someone use the app immediately without signing up.  
**Trade-off:** Data stays on that specific device and browser. Housemates cannot view or update the dashboard simultaneously from their own separate phones without manually sharing backup files.

**Decision:** Linked pantry stock levels directly to the grocery shopping list.  
**Why:** When items like cooking oil or laundry detergent run out, people often forget to write them down. Automating this removes a step for the household.  
**Trade-off:** If a user sets a minimum threshold too high, items can show up on the grocery list sooner than needed.

**Decision:** Included realistic sample household data on the first visit.  
**Why:** An empty screen makes it difficult to see how chore streaks, spending charts, and split balances work. Sample data gives immediate context.  
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

* **Status:** Working local prototype.
* **Technology:** HTML5, CSS3, Vanilla JavaScript (zero external dependencies).
* **Storage:** Browser `localStorage` with JSON export and import for backups.
