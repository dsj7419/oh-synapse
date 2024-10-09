# OH-Synapse: Once Human Game Companion

OH-Synapse is a web-based companion tool for the Synapse warband (guild) in the online game *Once Human*. This app provides players with tools for managing in-game recipes, customizing UI themes, role-based admin tools, and a comprehensive RSS feed system. Designed for the *Once Human* gaming community, the platform offers powerful features built on modern web technologies, delivering a dynamic user experience.

## Features

- **Dynamic Theme Customization**: Customize site themes with real-time updates using sliders, color pickers, and more.
- **Interactive Smoke Background**: Playground-customizable animated smoke effect with a spotolight overlay on home page.
- **WebGL Text Animation**: Playground-customizable particle-based text that reacts to mouse movements for logo and home page.

  _Thank you to [Aryan Kathawale](https://github.com/kiritocode1) for the inspiration and original code shared on the T3 Discord. His project [sst-shop](https://github.com/kiritocode1/sst-shop) provided the foundation for this feature's development._

- **Recipe Management**: Full CRUD operations for managing in-game recipes, including filtering by type, rarity, and location as an animated flip-book.
- **RSS Feed System**: Aggregates content from YouTube, Twitter, and generic RSS feeds, displayed via a scrolling ticker and dedicated rss page.
- **Admin Tools**: Manage users, roles, recipes, rss feeds, and a detailed audit-logger.
- **Discord Integration**: Login and role-based access via Discord, powered by NextAuth.js.

---

## Technology Stack

- **Languages**: TypeScript (primary), CSS (Tailwind), HTML, JavaScript (legacy).
- **Frontend**: 
  - Next.js: Server-side rendering, static site generation.
  - Radix UI: Consistent UI components for theme customization.
  - Tailwind CSS: Rapid UI development.
- **Backend**:
  - Prisma: ORM connecting the PostgreSQL database to the app.
  - TRPC: Type-safe API calls.
  - NextAuth.js: Discord-based authentication and role management.
- **Database**: PostgreSQL for managing user data, recipes, themes, roles, and RSS feeds.
- **Deployment**:
  - Hosted on Railway (App & PostgreSQL).
  - GitHub for version control.
  - Docker for containerization.

---

## Codebase Structure

- `/src/components`: Houses reusable UI components such as `PlaygroundPreview`, `InteractiveSmokeBackground`, `WebGLTextAnimation`, `FeedBox`, and `RssTicker`.
- `/src/app`: Contains pages for:
  - **Home Page**: Main site content.
  - **Admin Page**: Manages recipes, RSS feeds, bonus stats, and user roles.
  - **Playground**: Real-time site customization through sliders and color pickers.
  - **InteractiveSmokeBackground**: Provides an interactive smoke effect for dynamic visuals.
  - **WebGLTextAnimation**: Renders interactive, particle-based text.
- **Context Management**:
  - **ThemeContext**: Handles global theme settings for real-time updates across the site.
- **TRPC Integration**: Provides type-safe APIs for managing themes, recipes, RSS feeds, and more.

---

## Key Features

### 1. Dynamic Theme Customization
- **PlaygroundControls.tsx**: Provides real-time customization for UI elements (colors, fonts, layouts, etc.).
- **Save Theme Mutation**: Allows users to save theme settings with feedback on success or failure.

### 2. Interactive Smoke Background
- Adds dynamic smoke effects and spotlights with complete color/intensity/particle control through the playground.

### 3. WebGL Text Animation
- Renders interactive particle-based text that reacts to mouse movements, customizable via the Playground.

### 4. RSS Feed System
- Aggregates content from external sources like YouTube, Twitter, and RSS feeds.
- Admin management for feeds via `/admin/rss-settings`.
- Public display of feeds on `/rss`, with a scrolling ticker for selected items.

### 5. Role-Based UI Customization
- Admins, moderators, and content managers can adjust site themes based on their roles.

### 6. Recipe Management
- Full CRUD operations for in-game recipes.
- **RecipeFilters Component**: Allows filtering by type, rarity, found status, and location.

### 7. Admin Tools
- Manage content and users with role-based access.

### 8. Discord Integration
- Authentication and role-based access via Discord.

### 9. Copy Theme Button
- Copy current theme settings in JSON or CSS format via the Clipboard API.

---

## Recent Updates and Refactoring

- **PlaygroundControls Refactor**: Integrated `ColorPicker`, `FontPicker`, `LayoutPicker`, `RadiusPicker`, and other theme components.
- **RecipeFilters Component**: Added filtering for recipes based on various criteria.
- **Interactive Smoke Background**: Added a dynamic smoke background with interactive spotlights.
- **WebGL Text Animation**: Added particle-based text rendering with mouse interaction.
- **RSS Feed System**: Integrated feed aggregation from YouTube, Twitter, and RSS feeds with admin management, public display, and a scrolling ticker.

---

## Testing Setup

- **Frontend Tests**: Unit tests for core components like `RecipeBasicInfo`, `RecipeForm`, `FeedBox`, and `RssTicker`.
- **Backend Tests**: Service tests for `RssFeedService`, `AdminService`, and `UserService`.
- **Integration Tests**: API endpoints for feeds, recipes, and admin features.

---

## Future Development


## To-Do List

- **Mobile Responsiveness** 
  - Implement responsive design for all components.
  - Adjust layouts for smaller screens.
  - Optimize performance for mobile devices.

- ~~**Auth Page Enhancement**~~
  - ~~Redesign the login/signup page for better user experience.~~

- **Recipe Card Redesign** 
  - Reduce image size while maintaining visual appeal.
  - Enhance card layout for better information display.

- **Twitter Feed Caching** 
  - Implement server-side caching for Twitter feeds.
  - Create a fallback mechanism for slow-loading content.

- **User Profile Page** 
  - Design and implement a user profile page.
  - Add functionality for users to edit their profiles.

- **Memetics Feature** 
  - Design the data structure for memetics.
  - Implement memetics creation and sharing functionality.
  - Develop a system for collaborative editing of memetics.

- **Admin Memetics Management Page**
  - Create an admin interface for monitoring and managing memetics.
  - Implement CRUD operations for memetics.

- **Security Enhancements**
  - Conduct a security audit of the entire application.
  - Implement additional security measures (e.g., rate limiting, input validation).
  - Obfuscate sensitive parts of the client-side code.

- **Package Updates**
  - Review and update all packages to their latest stable versions.
  - Ensure compatibility and resolve any conflicts.

- **Code Refactoring and Optimization** 
  - Identify and refactor any code that doesn't adhere to SOLID principles.
  - Optimize performance bottlenecks.
  - Improve code reusability and maintainability.

---

## Explore OH-Synapse

Visit the live site here: [OH-Synapse](https://synapse.up.railway.app/)

---

## About Synapse Warband

Synapse Warband is led by Glitchiz, a YouTuber and official partner of the game "Once Human". The warband provides in-depth guides, gameplay strategies, and community-driven content for *Once Human* players.

Check out Glitchiz's YouTube channel for more content: [Glitchiz on YouTube](https://www.youtube.com/@Glitchiz)

---

## Contributing

This project is focused on serving the Synapse Warband, but we welcome suggestions and ideas for future development. Feel free to open issues or contact the team if you have any feedback.

For more updates and game-related content, follow Glitchiz on [YouTube](https://www.youtube.com/@Glitchiz).
