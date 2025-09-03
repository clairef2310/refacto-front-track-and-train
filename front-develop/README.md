# .

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
# 📚 Release History (Pre–0.8.0)

⚠️ Starting from version **0.8.0**, versioning and changelog are managed automatically via GitHub Releases.  
For earlier versions (before 0.8.0), automation was not yet in place.  
The following table provides a summary of all pre–0.8.0 releases.

---

## 📜 Versions Overview

| Version | Date       | Description | Release Type   | Target Branch | Version Type | PR Author |
|---------|------------|-------------|----------------|---------------|--------------|-----------|
| 0.1.0   | 2025-06-03 | Project initialization <br> • Set up the application structure <br> • Added Vue Router and defined the overall architecture | Pre-production | develop | New features | @Baptiste-Ferrand |
| 0.2.0   | 2025-06-06 | Authentication setup <br> • Integrated Axios for HTTP requests <br> • Created utility to store JWT token in cookies | Pre-production | develop | New features | @Baptiste-Ferrand |
| 0.2.1   | 2025-06-07 | Fix – JWT management <br> • Fixed bug where JWT was not removed on logout <br> • Improved error handling for authentication network issues | Pre-production | develop | Bug fixes | @Baptiste-Ferrand |
| 0.3.0   | 2025-06-11 | Login and registration pages <br> • Added login page <br> • Added registration page <br> • Fully functional authentication via API | Pre-production | develop | New features | @Baptiste-Ferrand |
| 0.3.1   | 2025-06-12 | Fix – Registration form <br> • Fixed error message display issue on the “email” field | Pre-production | develop | Bug fixes | @Baptiste-Ferrand |
| 0.4.0   | 2025-06-17 | Notifications & user security <br> • Implemented business snackbar (Pinia) for errors, success, and info messages <br> • Protected sensitive routes <br> • Used snackbar for redirections <br> • Added centralized authorization system in store | Pre-production | develop | New features | @Baptiste-Ferrand |
| 0.4.1   | 2025-06-18 | Fix – Snackbar persistence <br> • Fixed bug where snackbar did not remain visible when changing pages | Pre-production | develop | Bug fixes | @Baptiste-Ferrand |
| 0.5.0   | 2025-06-23 | Advanced user spaces <br> • Admin page for managing users, data, and groups <br> • Admin route protection <br> • Profile page for personal info updates <br> • Coach pages for group/members management (coach permissions) | Pre-production | develop | New features | @Baptiste-Ferrand |
| 0.5.1   | 2025-06-24 | Fix – Group management <br> • Fixed bug preventing member removal in some cases <br> • Improved group display on coach page | Pre-production | develop | Bug fixes | @Baptiste-Ferrand |
| 0.5.2   | 2025-06-25 | Fix – Side effects in admin/coach <br> • Fixed bug where admins lost access to some features after update <br> • Fixed security issue where non-coach users could access coach pages | Pre-production | develop | Bug fixes | @Baptiste-Ferrand |
| 0.6.0   | 2025-07-01 | Diets & trainings for coaches, advanced client management <br> • Coaches can create diets & trainings for users <br> • Client profiles page to view diets/trainings (via groups page) | Pre-production | develop | New features | @Baptiste-Ferrand |
| 0.6.1   | 2025-07-02 | Fix – Adding/removing diets/trainings <br> • Fixed bug preventing addition or deletion of some trainings <br> • Improved program display on client profiles page | Pre-production | develop | Bug fixes | @Baptiste-Ferrand |
| 0.6.2   | 2025-07-03 | Fix – Coach page refresh <br> • Fixed bug where coach page did not update after creating a new program for a client | Pre-production | develop | Bug fixes | @Baptiste-Ferrand |
| 0.7.0   | 2025-07-15 | Coaches presentation & promotion <br> • Added landing page showing trainings, diets, and coaches linked to logged-in users <br> • Displayed list of available coaches for visitors not logged in | Pre-production | develop | New features | @Baptiste-Ferrand |
| 0.7.1   | 2025-07-16 | Fix – Coach cards display <br> • Fixed poorly optimized coach card displaying incorrect info | Pre-production | develop | Bug fixes | @Baptiste-Ferrand |
