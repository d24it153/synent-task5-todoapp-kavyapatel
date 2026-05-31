# ZenTask // Premium Task Manager

ZenTask is a high-fidelity, visually stunning, and responsive task management web application built from scratch using raw HTML, CSS, and modern JavaScript. It features a premium **dark-glassmorphism theme**, vibrant ambient glowing background elements, dynamic SVG charts, inline text editing, and instant local storage persistence.

---

## Key Features

* **Glassmorphic Workspace**: A premium interface featuring 18px backdrop blurs, subtle card reflections, and clean typography layouts (Outfit and Inter from Google Fonts).
* **Ambient Glow Core**: Absolute-positioned color-spectrum orbs with soft radial blurs drift behind your workspace to create an immersive sense of depth.
* **SVG Daily Progress Ring**: Real-time progress calculations showing completion percentage using an elegant circular SVG stroke-dash offset tracker.
* **Time-Based Greeting Engine**: Dynamic greeting titles that shift based on your local time (e.g. morning `🌅`, afternoon `🚀`, evening `🌌`, night `💤`) to personalize your experience.
* **Inline Direct Editing**: Double-click any active task text (or click the edit icon) to change task names on the fly, saving automatically on blur or by pressing `Enter`.
* **Multi-Dimensional Navigation**:
  * Segmented buttons to filter tasks dynamically: **All**, **Active**, and **Completed**.
  * Instant **Live Search** indexing to filter task names as you type.
  * Filters tasks by category tags (**Work**, **Personal**, **Shopping**, **Health**).
  * Sorts lists dynamically by creation date (Newest first, Oldest first) or priorities (Low to High, High to Low).
* **Micro-Animations**: Smooth entry slide-ups when creating items, haptic-feeling checklist scale pops, and cascading slide-out sweeps upon deletions.
* **Persistence**: Synchronizes and restores states automatically using browser `localStorage` so tasks remain exactly as they were when refreshing the page.

---

## File Architecture

```text
├── index.html     # Semantic structure, progress dashboard, forms, and Lucide icons script
├── style.css      # CSS variables, glassmorphic card edges, dynamic animations, and responsive grids
├── app.js         # State variables, inline editors, list filter/sorting rules, and localStorage sync
└── .gitignore     # IGNORE paths for clean repository maintenance
```

---

## Quick Start & Installation

Because ZenTask is written entirely in vanilla web technologies, there are **no external dependencies or build processes required** to run it.

### Launch Directly
1. Download or clone this repository.
2. Locate the folder and double-click `index.html` to run it instantly in any modern web browser.

### Run via Local Web Server
If you'd like to serve the application locally over an HTTP address, run a simple Python server inside the folder:
```powershell
python -m http.server 3000
```
Then visit **[http://localhost:3000](http://localhost:3000)** in your browser of choice.

---

## Technologies Used

* **Structure**: HTML5 (Semantic Structure)
* **Design System**: Vanilla CSS3 (Custom variables, flexbox, CSS grids, keyframe animations)
* **Logic**: ES6+ JavaScript (State management, event closures, dynamic calculations)
* **Assets**: Lucide Icons (SVG Vectors via CDN)
