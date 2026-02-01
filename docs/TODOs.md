# Project TODOs

## Web Service

### Features
- [ ] **Watchlist / Favorites**: Implement a feature for users to save movies, TV shows, and animes to a local list (using localStorage) or a backend-synced list.
- [ ] **Watch History**: specific tracking for watched episodes/movies to resume playback.
- [x] **Pagination for A-Z Results**: Currently, A-Z results are limited by the initial fetch. Implement pagination to load more titles starting with the same letter.
- [ ] **Advanced Filtering**: Add more granular filters like Rating range, specific Studios (for Anime), or detailed genres.

### UI/UX
- [x] **Mobile Responsiveness**: Implemented responsive grids, hamburger menu, compact cards, and optimized player/discover layouts for mobile.
- [x] **Theme Toggle**: Added Light/Dark mode toggle with localStorage persistence in header (desktop) and mobile menu.
- [ ] **Skeleton Loading**: Replace the spinner with Skeleton loaders for a smoother perceived performance during data fetching.
- [x] **Error Boundaries**: Implement React Error Boundaries to gracefully handle crashes in specific components.

### Technical
- [ ] **SEO Optimization**: Add `next-seo` or dedicated metadata headers (OpenGraph, Twitter cards) for better social sharing.
- [x] **PWA Support**: Convert the site into a Progressive Web App for installability.
- [ ] **Unit Tests**: Add tests for critical helpers and components using Jest/React Testing Library.

---

## API Service

### Features
- [ ] **More Providers**: Integrate additional streaming providers beyond VidSrc and VidLink for better availability.
- [ ] **User Accounts**: Implement authentication (JWT/OAuth) to support cloud-synced watchlists and history.
- [ ] **Recommendations Engine**: Build a smarter recommendation system based on user's viewing habits rather than just "Trending" (use LLM).

### Technical
- [ ] **Caching Strategy**: Implement Redis or a more robust caching layer to reduce API hits to TMDB/Jikan.
- [ ] **Rate Limiting**: Add global rate limiting to protect the API from abuse.
- [ ] **Logging**: Integrate a logging service (e.g., Winston/Morgan) for better observability.
- [x] **Validation**: Strengthen DTO validation for all search and filter parameters.
- [x] **API Documentation**: Auto-generate Swagger/OpenAPI documentation for the endpoints.

### Bug Fixes / Refactoring
- [x] **Standardize Types**: Ensure strict type sharing between frontend and backend where possible (or use a monorepo structure with a shared package).
- [x] **Error Handling**: Standardize error responses across all modules (Movies, TV, Animes).



# Docs 

https://github.com/AdvithGopinath/LetMeWatch/issues/4

https://www.reddit.com/r/learnprogramming/comments/1esy7m7/is_there_an_apisome_kind_of_site_where_i_can/

https://github.com/public-apis/public-apis

https://myanimelist.net/apiconfig/references/api/v2#section/Versioning

https://myanimelist.net/apiconfig/create

https://danbooru.donmai.us/wiki_pages/help:api

https://jikan.moe/#how-it-works

https://github.com/firrthecreator/myanimelist-wrapper

https://github.com/jikan-me/jikan

https://hummingbird-me.github.io/api-docs/#section/Authentication/Obtaining-an-Access-Token

https://github.com/aalykiot/vidstream

https://www.reddit.com/r/StremioAddons/comments/1gu2qt5/best_stremio_addons_for_anime_with_real_debrid/

https://www.reddit.com/r/Addons4Kodi/comments/1bfsr2c/celebrating_my_favorite_addon_dubbed_anime_addon/

https://www.reddit.com/r/animeapp/comments/1fbv5ww/my_anime_app_collection/

https://www.miruro.com/

9anime (AniWave) Scrapers

https://www.reddit.com/r/MyAnimeList/comments/1mr1nih/myanimelist_vs_simkl_vs_anilist_vs_imdb_best/

https://guides.viren070.me/stremio/addons/anime-kitsu


this is how gogo anime does search:

https://gogoanime.by/?s=naruto

https://gogoanime.by/?s=naruto+shippuuden

https://gogoanime.by/?s=Sousou+no+Frieren+2nd+Season


add a feature where users can ask AI to generate movie playlists for them. The button the would use Gemini's logo(with a text saying Ask AI..) can be placed in the header and once the user clicks on it a text box pops with placholder text "What type of movies do you like?", the user decribes the type of playlists they want or the type of movies they like and that infomartion is been used by an agent to generate a recomendation playlist which is save in the databse and also sent to the user.

when in black theme the Ask Ai... button should be white or red from the theme colors.

Manual Verification
Click "Ask AI..." in header.
Type: "I like space horror movies like Alien".
Verify that the resulting playlist contains relevant titles.
Click a result and verify it leads to the correct detail page.

add another feature where users can share their watchlists with their friends and also see their friends watchlists. 

add another feature called popcorn where users can watch a movie or a show with their friends in real time. 