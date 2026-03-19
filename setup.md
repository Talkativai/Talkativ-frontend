# Setup Guide 🛠️

Welcome to the Talkativ UI development team! This guide will walk you through getting the project running on your local machine.

## Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (Node Package Manager)
- A modern code editor (like VS Code)

## Installation Steps
1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-github-repo-url>
   cd talkativ-expert-ui
   ```

2. **Install local dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **View the application**:
   Open your browser and navigate to the local server URL provided in the terminal (usually `http://localhost:5173`).

## Project Structure Overview
- `/src/App.jsx`: The master component housing the entire frontend routing logic, UI views, and global styling variables (e.g., `T` color palette object).
- `/src/index.css`: Secondary global stylesheets and utility classes.
- `/public`: Static assets served directly to the root path.
- `vite.config.js`: Configuration bindings for the Vite build tool.

## Build for Production
To generate a minified and heavily optimized production build:
```bash
npm run build
```
Once complete, the built files will be located in the `/dist` directory. You can preview the optimized build locally using:
```bash
npm run preview
```

## Need Help?
If you encounter any issues during setup, try removing your `node_modules` folder and `package-lock.json` file, then rerun `npm install`.
