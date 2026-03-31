# Timetable Web App

## Overview
This project is a web-based timetable and productivity suite designed to help students manage their schedules, assignments, analytics, and planning. It is built using HTML, CSS, and JavaScript, with Firebase integration for backend services. The app is modular, with separate pages and scripts for each major feature.

## Features
- **Dashboard**: Central hub for navigation and quick stats.
- **Timetable**: Interactive semester timetable for course scheduling.
- **Assignments**: Assignment tracker with due dates and completion status.
- **Planner**: Personal planner for tasks and events.
- **Analytics**: Visual analytics for productivity and time management.
- **Timer**: Pomodoro-style timer for focused work sessions.
- **Mobile Workflow**: Responsive design and mobile-specific enhancements.

## File Structure
- **HTML Pages**: Each feature has its own HTML file (e.g., `dashboard.html`, `planner.html`, `analytics.html`, etc.).
- **CSS**: Located in the `css/` directory. Each feature has a dedicated stylesheet, plus `shared.css` for common styles.
- **JavaScript**: Located in the `js/` directory. Each feature has a dedicated script. `firebase-config.js` handles Firebase setup.
- **Icons**: SVG and PNG assets in the `icons/` directory.
- **Test Files**: JavaScript test specs for navigation and planner logic.
- **Backups**: `.bak` files are backups of key HTML pages.

## Key Technologies
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase (for authentication, database, and hosting)
- **Testing**: JavaScript test files (manual or automated, depending on setup)

## Getting Started
1. **Clone the repository**
2. **Install dependencies** (if any; most dependencies are CDN-based)
3. **Firebase Setup**:
   - Create a Firebase project
   - Add your Firebase config to `js/firebase-config.js`
   - Enable required Firebase services (Firestore, Auth, Hosting)
4. **Open `index.html` in your browser**
5. **Navigate using the dashboard or direct links**

## Development Notes
- **Modularity**: Each feature is isolated in its own HTML, CSS, and JS files for maintainability.
- **Shared Styles**: Use `css/shared.css` for global styles.
- **Mobile Support**: `js/mobile-workflow.js` and responsive CSS ensure usability on phones/tablets.
- **Testing**: Test files are provided for navigation and planner logic. Screenshots are in `test-screenshots/`.
- **Backups**: `.bak` files are safe to ignore unless you need to restore a previous version.

## How to Help
- **Feature Development**: Pick a feature (e.g., analytics, planner) and improve UI/UX, add new functionality, or refactor code.
- **Bug Fixes**: Check test files and user flows for issues.
- **Testing**: Expand or automate tests for better coverage.
- **Firebase**: Help with security rules, performance, or advanced integrations.
- **Documentation**: Improve this README or add inline code comments.

## Contact
If you have questions or want to discuss architecture, please reach out via the repo or open an issue.

---
*This README is intended for a senior developer onboarding to the project. For any missing details, please check the codebase or ask the project owner.*
