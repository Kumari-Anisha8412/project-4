# 📝 TaskMaster PRO — Smart Daily Planner

A high-performance, modern, and aesthetic task management web application built with clean semantic **HTML5**, modern **CSS3** (custom design system & CSS variables), and vanilla **JavaScript (ES6+)**.

---

## ✨ Features & Highlights

- 🎨 **Modern Design System & Aesthetics**:
  - Curated color palette with custom HSL tokens.
  - Smooth micro-interactions, card lift animations, and sleek transition effects.
  - Custom SVG icons (zero external icon library dependencies, works 100% offline).
  - Modern typography powered by Google Fonts (*Outfit* and *Plus Jakarta Sans*).

- 🌓 **Dynamic Theme Engine**:
  - Instant Light Mode / Dark Mode toggle.
  - Automatic system preference detection (`prefers-color-scheme`).
  - Persists preference in `localStorage`.

- 📊 **Real-time Analytics & Progress**:
  - Live summary cards: **Total Tasks**, **Pending**, **Completed**, and **Efficiency Rate**.
  - Animated dynamic progress bar showing current completion percentage.

- ⚡ **Task Management (Full CRUD)**:
  - Create, view, edit (with pre-filled fields & cancel option), and delete tasks.
  - Priority levels: **🔥 High**, **⚡ Medium**, **🌱 Low** with distinct visual badges.
  - Categorization: **Work**, **Study**, **Personal**, **Health**, **Finance**, and **Other**.
  - Intelligent Due Date tracking: automatically identifies **"Due Today"**, **"Tomorrow"**, and **"Overdue"** tasks.

- 🔍 **Live Search, Filter & Sort**:
  - Real-time search by task description or category.
  - Quick status tabs: **All**, **Pending**, **Completed**, and **Today**.
  - Category dropdown filter.
  - Multi-criteria sorting: Newest, Oldest, Highest Priority, Due Date, or Alphabetical (A-Z).

- 🛡️ **Premium UX Overhaul (No Native Alerts)**:
  - Custom animated **Toast Notifications** (Success, Info, Warning, Error).
  - Custom glassmorphic **Confirmation Modal** for destructive actions (replaces intrusive browser `confirm()`).

- 📦 **Data Portability & Bulk Operations**:
  - **Export to JSON**: One-click full backup of your tasks.
  - **Import from JSON**: Easily restore or migrate tasks from another machine.
  - Bulk actions: **Mark All Done** and **Clear Completed**.
  - Backward compatible: Automatically migrates previous tasks saved under `myTasks`.

- ⌨️ **Keyboard Shortcuts**:
  - `Ctrl + K` or `Cmd + K`: Quick focus on the search bar.
  - `Escape`: Cancel active task edit or close modal.
  - `Enter`: Submit task.

---

## 📁 Project Structure

```
Task 4/
├── index.html        # Semantic HTML5 markup with accessible controls & modals
├── style.css         # Modern CSS tokens, dark/light themes, animations & layout
├── script.js         # Modular ES6+ logic, LocalStorage sync & event handling
├── Script.js         # Backward compatibility shim
└── README.md         # Project documentation and guide
```

---

## 🚀 Getting Started

1. Simply open [`index.html`](file:///c:/Users/hp/OneDrive/Desktop/Task%204/index.html) in any modern web browser (Chrome, Edge, Firefox, Safari).
2. No dependencies, npm install, or build steps required!

---

## 🛠️ Built With

- **HTML5** — Semantic, accessible elements (ARIA tags, SVG icons).
- **CSS3** — Custom properties (CSS variables), Flexbox, CSS Grid, Glassmorphism, Micro-animations.
- **JavaScript (ES6+)** — Modular IIFE pattern, LocalStorage API, FileReader API, Blob/DataURI download.
