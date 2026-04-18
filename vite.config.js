import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        calendar: resolve(__dirname, 'calendar.html'),
        planner: resolve(__dirname, 'planner.html'),
        assignments: resolve(__dirname, 'assignments.html'),
        grades: resolve(__dirname, 'grades.html'),
        semester1Timetable2026: resolve(__dirname, 'Semester1Timetable2026.html'),
        orbAllLogos: resolve(__dirname, 'orb-all-logos.html')
      }
    }
  }
});
