# Project TODOs

## Web Service

### Features
- [ ] **Watchlist / Favorites**: Implement a feature for users to save movies, TV shows, and animes to a local list (using localStorage) or a backend-synced list.
- [ ] **Watch History**: specific tracking for watched episodes/movies to resume playback.
- [ ] **Pagination for A-Z Results**: Currently, A-Z results are limited by the initial fetch. Implement pagination to load more titles starting with the same letter.
- [ ] **Advanced Filtering**: Add more granular filters like Rating range, specific Studios (for Anime), or detailed genres.

### UI/UX
- [ ] **Mobile Responsiveness**: Further polish the player and grid layouts for smaller screens (mobile/tablet).
- [ ] **Theme Toggle**: Add a Light/Dark mode toggle (currently "Dark" by default).
- [ ] **Skeleton Loading**: Replace the spinner with Skeleton loaders for a smoother perceived performance during data fetching.
- [ ] **Error Boundaries**: Implement React Error Boundaries to gracefully handle crashes in specific components.

### Technical
- [ ] **SEO Optimization**: Add `next-seo` or dedicated metadata headers (OpenGraph, Twitter cards) for better social sharing.
- [ ] **PWA Support**: Convert the site into a Progressive Web App for installability.
- [ ] **Unit Tests**: Add tests for critical helpers and components using Jest/React Testing Library.

---

## API Service

### Features
- [ ] **More Providers**: Integrate additional streaming providers beyond VidSrc and VidLink for better availability.
- [ ] **User Accounts**: Implement authentication (JWT/OAuth) to support cloud-synced watchlists and history.
- [ ] **Recommendations Engine**: Build a smarter recommendation system based on user's viewing habits rather than just "Trending".

### Technical
- [ ] **Caching Strategy**: Implement Redis or a more robust caching layer to reduce API hits to TMDB/Jikan.
- [ ] **Rate Limiting**: Add global rate limiting to protect the API from abuse.
- [ ] **Logging**: Integrate a logging service (e.g., Winston/Morgan) for better observability.
- [x] **Validation**: Strengthen DTO validation for all search and filter parameters.
- [x] **API Documentation**: Auto-generate Swagger/OpenAPI documentation for the endpoints.

### Bug Fixes / Refactoring
- [x] **Standardize Types**: Ensure strict type sharing between frontend and backend where possible (or use a monorepo structure with a shared package).
- [x] **Error Handling**: Standardize error responses across all modules (Movies, TV, Animes).
