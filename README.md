# Last War: Survival - Season 2 Polar Storm Territory Planner

An interactive map planning tool for coordinating alliance territory acquisition during Season 2 (Polar Storm) in Last War: Survival.

![Polar Storm Planner](https://img.shields.io/badge/Last%20War-Season%202-gold)
![React](https://img.shields.io/badge/React-18+-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Interactive 13x13 Territory Map** - Click tiles to assign them to alliances
- **Multi-Alliance Support** - Track territories for multiple alliances with custom colors and tags
- **Resource Optimizer** - Find optimal tiles to maximize Food, Iron, Coin, or other bonuses
- **Live Statistics** - Real-time tracking of bonuses, coal/hour, and rare soil/hour
- **Undo/Redo** - Full history support (up to 50 actions)
- **Screenshot Mode** - Clean view for sharing in Discord/Line
- **Auto-Save** - Automatically saves to browser localStorage
- **Export/Import** - Share plans with alliance leadership via JSON files
- **Resource Filtering** - Filter map by resource type to plan strategically

## Quick Start

### Option 1: Using Vite (Recommended)

```bash
# Create a new Vite project
npm create vite@latest lastwar-planner -- --template react

# Navigate to project
cd lastwar-planner

# Install dependencies
npm install

# Replace src/App.jsx with the planner component
# (Copy the contents of season2-map-v4.jsx into src/App.jsx)

# Start development server
npm run dev
```

Then open http://localhost:5173 in your browser.

### Option 2: Using Create React App

```bash
# Create a new React app
npx create-react-app lastwar-planner

# Navigate to project
cd lastwar-planner

# Replace src/App.js with the planner component
# (Copy the contents of season2-map-v4.jsx into src/App.js)

# Start development server
npm start
```

Then open http://localhost:3000 in your browser.

### Option 3: Single HTML File (No Build Required)

Create an `index.html` file with the following content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Polar Storm Territory Planner</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel" data-type="module">
        // Paste the entire contents of season2-map-v4.jsx here
        // (Remove the "export default" and change it to just the function)
        
        // Then add this at the end:
        // ReactDOM.createRoot(document.getElementById('root')).render(<Season2MapPlanner />);
    </script>
</body>
</html>
```

Open the HTML file directly in your browser.

## Detailed Setup (Vite)

### Step 1: Create Project

```bash
npm create vite@latest lastwar-planner -- --template react
cd lastwar-planner
npm install
```

### Step 2: Replace App Component

Delete the contents of `src/App.jsx` and `src/App.css`, then paste the entire contents of `season2-map-v4.jsx` into `src/App.jsx`.

### Step 3: Clean Up Default Files

You can remove these default files (optional):
- `src/App.css`
- `src/index.css` (or empty it)
- `public/vite.svg`
- `src/assets/react.svg`

### Step 4: Update main.jsx

Make sure `src/main.jsx` looks like this:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Step 5: Run

```bash
npm run dev
```

## Usage Guide

### Basic Territory Planning

1. **Select an Alliance** - Click an alliance in the left panel to make it active
2. **Assign Territories** - Click any tile on the map to assign it to the active alliance
3. **Remove Assignment** - Click an assigned tile again to remove it

### Managing Alliances

- Click **+** to add a new alliance
- Click **⚙** on any alliance to edit name, tag, color, or delete
- Each alliance has a unique color and 4-character tag

### Using the Resource Optimizer

1. Click **🎯 Optimizer** in the toolbar
2. Select which resource to maximize (Food, Iron, Coin, etc.)
3. Set how many tiles you want
4. Set maximum level your alliance can hold (based on temperature tech)
5. Click **Find Optimal Tiles** - they'll pulse on the map
6. Click **Apply** to assign them all at once

### Sharing Plans

**Export:**
1. Click **💾 Save/Load** in the toolbar
2. Click **Export to JSON File**
3. Share the downloaded file with your R4s

**Import:**
1. Click **💾 Save/Load** in the toolbar
2. Click **Import from JSON File**
3. Select the shared JSON file

**Screenshot:**
1. Click **📸 Screenshot** in the toolbar
2. Use your OS screenshot tool or browser extension
3. Share the clean map view in Discord/Line

### Keyboard Shortcuts

- The map auto-saves, so no save shortcut needed
- Use browser back/forward or the Undo/Redo buttons for history

## Map Data Reference

### Territory Levels

| Level | Temperature | Coal/Hour | Rare Soil/Hour |
|-------|-------------|-----------|----------------|
| 1     | -10°C       | 2,736     | 100            |
| 2     | -30°C       | 2,880     | 110            |
| 3     | -40°C       | 3,024     | 120            |
| 4     | -50°C       | 3,168     | 130            |
| 5     | -60°C       | 3,312     | 140            |
| 6     | -70°C       | 3,456     | 150            |

### Building Types

| Icon | Type          | Available Bonuses                    |
|------|---------------|--------------------------------------|
| ⛏️   | Dig Site      | Food, Iron, Coin (2-10%)             |
| 🏘️   | Village       | Food, Iron (5%)                      |
| 🏛️   | Town          | Coin, Gathering (5%)                 |
| 🏭   | Factory       | Food, Iron, Coin (10%)               |
| 🚂   | Train Station | Food, Iron, Coin, Gathering (15%)    |
| 🚀   | Launch Site   | Food, Iron, Coin, Gathering (20%)    |
| 🏰   | War Palace    | Healing, Construction, Research, Training (5-20%) |
| 👑   | Capitol       | March Speed (10%)                    |

## Data Storage

- **Auto-Save Location:** Browser localStorage (`lastwar-s2-planner-data`)
- **Export Format:** JSON file with version, alliances, assignments, metadata
- **Data Persists:** Until browser data is cleared or you click "Clear All Saved Data"

## Troubleshooting

### Map not loading?
- Make sure you're using a modern browser (Chrome, Firefox, Edge, Safari)
- Check browser console for errors (F12 → Console)

### Lost your data?
- Check if you exported a backup JSON file
- localStorage data persists unless manually cleared

### Fonts not loading?
- The app uses Google Fonts (Rajdhani, Orbitron)
- Requires internet connection for fonts to load
- Falls back to system fonts if unavailable

## Contributing

Feel free to fork and modify for your server's needs. Some ideas:
- Add more alliance relationship types (NAP, KOS, etc.)
- Implement real-time collaboration
- Add attack path visualization
- Create mobile-optimized layout

## Credits

Built for **Server 1642 - Nova Imperium / SuperNova Alliance**

## License

MIT License - Use freely for your alliance planning needs.
# season2-map
