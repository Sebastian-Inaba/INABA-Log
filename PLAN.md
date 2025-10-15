# INABA-LOG

## Personal Blog

**Tech Stack:** MERN-Stack with TypeScript

### Features

* CRUD for blog posts and deep dives
* Categorize posts (UX case studies, coding projects, etc.)
* Categorize Deep dives (UX case studies, coding projects, etc.)
* Markdown support for posts

---

## Plan Status

- Backend setup

- Initial Frontend setup 

---

## INABA-LOG Project Plan

### Tech Stack (detailed)

**Frontend:**
- React
- React Router DOM
- Tailwind CSS
- Vite
- TypeScript
- Markdown support(not sure which to use yet)
- ESLint
- Axios
- Lenis

**Backend:**
- Node.js
- Express
- TypeScript
- Mongoose (MongoDB ORM)
- CORS
- dotenv 
- Nodemon 
- Supabase 
- Helmet 
- express-rate-limit 
- cookie-parser 
- multer 
- sharp 
- google-auth-library 

**Utilities:**
- Concurrently (run frontend + backend at the same time form root)
- ts-node (not sure, lol. Think its to make TypeScript work on a node server)
- Prettier (Terminal command for prettier code structure)

---

## Frontend (React + TypeScript + Tailwind)

### Header

* Title: INABA-LOG
* Navigation: Home , Posts, Deep dives (Research)
* Hamburger menu on mobile

### Footer

* Aside nav: Home (logo), Posts, Research
* Center highlight: Portfolio link with CTA
* Optional links: GitHub, LinkedIn, Instagram

### Pages

#### Home Page (<span style="color: #188038;">/</span>)

* Grid layout, 2 rows:

  * Top: Newest Post (full card) + Newest deep dive (compact card)
  * Bottom: 5 most recent posts
* Teasers: ResearchCompactCard, PostCompactCard

#### Posts Page (<span style="color: #188038;">/posts</span>)

* 2-column grid:

  * Center: search, filter with tags, date, etc with posts feed (PostCard) bellow
  * Right aside: highlighted posts
* Clicking a post opens modal/overlay

#### Research Page, deepdives (<span style="color: #188038;">/research</span>)

* Same 1-column layout as Posts

  * search, filter with tags, date, etc with deep dive feed 
* ResearchCard styled like research paper: title, author, abstract, metadata
* Clicking research entry opens modal/overlay

#### Admin Page (<span style="color: #188038;">/admin</span>)

* Secure login (admin only), Google account API (only my account)
* Custom Nav: select Posts or Research
* Custom List: shows all existing posts/research in compressed view with Edit/Delete actions
* Custom Editor: edit selected Post/Research (Markdown content, title, tags, featured, abstract if research)
* Custom Creator: create new Post/Research with type selector

---

## Components

### Common Components

* Navbar / Footer
* AsideNav (filters / topics / tags)
* ModalViewer (post/research detail)
* Another Aside highlight (for posts and deepdives)
* MarkdownRenderer

### Home Page Components

* PostCard (full, only the 5 most recent)
* ResearchCompactCard and PostCompactCard

### Posts Page Components

* PostCard (full, all of them)
* PostCompactCard (home teaser)

### Research Page Components

* ResearchCard (full, all of them)
* ResearchCompactCard (home teaser)

### Admin Components

* AdminNav (same as main aside nav but with type selector: Post/Research)
* AdminList (compressed list with Edit/Delete of both posts and deepdives)
* AdminEditor (edit existing entry)
* AdminCreator (create new entry with type selection, Markdown editor (maybe react hybrid))

---

## Backend (Express + TypeScript)

### API Routes

#### Posts
- `GET /api/posts` → list posts (filter by tag/date)
- `GET /api/posts/:id` → get single post by id
- `GET /api/posts/newest` → get newest post
- `GET /api/posts/latest-five` → get latest five posts
- `GET /api/posts/featured` → get featured post

#### Research
- `GET /api/research` → list research entries
- `GET /api/research/:id` → get single research entry
- `GET /api/research/newest` → get 2 newest deep dives (research)

#### Auth 
- `POST /api/upload` → upload file to Supabase storage (admin only)
- `DELETE /api/upload/:filename` → delete file from Supabase storage (admin only)
- `POST /api/research` → create research entry (admin only)
- `GET /api/research/:id` → get research by id (admin only)
- `PATCH /api/research/:id` → update research entry (admin only)
- `DELETE /api/research/:id` → delete research entry (admin only)
- `POST /api/posts` → create post (admin only)
- `GET /api/posts/:id` → get post by id (admin only)
- `PATCH /api/posts/:id` → update post (admin only)
- `DELETE /api/posts/:id` → delete post (admin only)
- `POST /api/admin/login` → login with Google (sets `inaba_admin` cookie)
- `POST /api/admin/logout` → logout (clears `inaba_admin` cookie)
- `GET /api/admin/me` → get current user info (checks `inaba_admin` cookie)

---

# Database Models

## Post Model

**Model Name:** Post  
**Description:** Stores blog post content and metadata

### Fields:
- `_id`: ObjectId (auto-generated)
- `title`: string (required)
- `slug`: string (required, unique)
- `author`: string (optional)
- `description`: string (optional)
- `content`: string (required, Markdown format)
- `category`: string (required)
- `tags`: string[] (optional, default: [])
- `featuredImage`: string (optional, Supabase storage URL)
- `featured`: boolean (optional, default: false)
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

## Research Model

**Model Name:** Research  
**Description:** Stores research/deep dive content with academic structure

### Fields:
- `_id`: ObjectId (auto-generated)
- `title`: string (required)
- `author`: string (required)
- `abstract`: string (required)
- `introduction`: string (optional)
- `method`: string (optional)
- `keyFindings`: string (optional)
- `credibility`: string (optional)
- `content`: string (required, Markdown format)
- `references`: string[] (optional, default: [])
- `tags`: string[] (optional, default: [])
- `featuredImage`: string (optional, Supabase storage URL)
- `pdfAttachment`: string[] (optional, default: [], PDF/document links)
- `featured`: boolean (optional, default: false)
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

## User Model

**Status:** Currently not implemented  
**Authentication:** Using Google OAuth for single admin authentication

---

## Config

### DB Configuration
- MongoDB connection setup with Mongoose
- Connection pooling optimization
- Indexing strategy for posts and research collections

### Environment Variables
- MONGODB_URI=
- NODE_ENV=development(set to production in live)
- SUPABASE_URL=
- SUPABASE_ANON_KEY=
- SUPABASE_SERVICE_ROLE_KEY=
- SUPABASE_BUCKET_POSTS_IMAGE=
- SUPABASE_BUCKET_RESEARCH_IMAGE=
- SUPABASE_BUCKET_RESEARCH_ATTACHMENTS=
- VITE_GOOGLE_CLIENT_ID= 
- GOOGLE_CLIENT_ID=
- ADMIN_EMAIL=
- FRONTEND_URL=http://localhost:5173 (Change this to domain url)
- VITE_BACKEND_URL=http://localhost:5000 (Change this to backend url)

### Supabase Configuration
- Supabase client initialization
- Storage bucket configuration
- File upload size limits
- Allowed file types configuration

---

## Controllers

### Post Controller
- `getPosts` (with filtering and pagination)
- `getPostById`

### Research Controller
- `getResearch` (with filtering and pagination)
- `getResearchById`

### Auth Controller
- `login`
- `getCurrentUser`
- `logout` (optional, probably just set google api login on a timer so logout automatically)

### Upload Controller
- `uploadFile` (to Supabase storage)
- `deleteFile` (from Supabase storage)
- `validateFileType`
- `generateSignedURLs` (for direct client access)

### Admin Controller
- `contentManagement`
- `createPost` (link, code snippet area)
- `updatePost` (link, code snippet area)
- `deletePost` (with associated file cleanup)
- `createResearch` (link, code snippet area)
- `updateResearch` (link, code snippet area)
- `deleteResearch` (with associated file cleanup)

---

## Middleware

### Auth Middleware
- Admin role validation
- Rate limiting for auth endpoints

### Error Middleware
- Global error handler
- Validation error formatting
- Supabase error handling

### File Upload Middleware
- Multer configuration for temp storage
- File size validation
- File type validation

### Logging Middleware
- Request logging
- Error logging
- Performance monitoring

---

## Utility Components for Animation (Frontend), not added yet

### Animation Wrappers
- `FadeInContainer` - for section fade-in animations
- `SlideInWrapper` - for directional slide animations
- `StaggeredList` - for staggered child animations

### Interactive Components
- `HoverScale` - scale transformation on hover
- `TiltCard` - 3D tilt effect on cards
- `GlowBorder` - neon glow effects for important elements

### Text Animations
- `TypewriterText` - typewriter effect component
- `AnimatedUnderline` - animated underline for links
- `TextReveal` - scroll-triggered text reveal

### Scroll Effects
- `ScrollProgress` - scroll progress indicator
- `ParallaxSection` - parallax background effects
- `ViewportTracker` - trigger animations when in viewport

### Page Transitions
- `RouteTransition` - smooth page transitions
- `LoadingStates` - animated loading components
- `AnimatedModal` - animated modal/overlay component

---

## Extra Functionality

- Markdown rendering( React-markdown, Quill, Draft.js, TinyMCE, CKEditor, React MDE )
- Modal detail views for posts & research
- Secure admin login (JWT, .env password, Google API)
- Deployment: not sure yet
- Accessibility: Keyboard navigation, screen reader support
- SEO: Meta-tags, code hierarchy, images
- Analytics: Google Analytics

---

## Design & Interaction Plan

### 1️⃣ Theme

* **Dark theme**: dark base colors
* **Accent colors**: vibrant colors (neon blue, violet, or mint green) for links, buttons, highlights,etc..(Ensure high contrast for readability)
* **Fonts**: Poppins, Lato, Roboto slab.

### 2️⃣ Animations

* **Row items (top row: New Post + Research)**: slide in from sides
* **Column/grid items (posts, research cards)**: slide in from below on scroll
* **Scroll-over effect**: recent posts container scrolls over top row
* **Implementation**: top row relative (stays visually in place), recent posts relative (slides over top row)
* **Optional Framer Motion**: y translation or fade-in for smoother feel
* **Typewriter animation**: tagline, featured post title, or quotes
* **Header behavior**: shrink/collapse on scroll down, reappear on scroll up

### 3️⃣ Hover & micro-interactions

* **Buttons**: scale slightly and color shift on hover
* **Cards**: elevate with shadow and slight tilt on hover
* **Links**: animated underline or glow effect
* **Research cards**: reveal metadata on hover with smooth fade-in

### 4️⃣ SVG / Custom backgrounds

* **Optional future enhancement**: subtle animated SVG backgrounds per page, could use wave patterns, gradients, geometric shapes

### 5️⃣ Extra polish / subtle effects

* **Parallax sections**: background elements move subtly on scroll
* **Lazy-loading animations**: animate cards only when they enter viewport
* **Dark-mode glow accents**: neon edges on important highlights
* **Smooth page transitions with route or loader**: fade or slide between routes
* **Breadcrumbs / small navigation hints**: likely unnecessary

### 6️⃣ Layout & animation mapping overview

* Homepage: 
    - top row slides in from sides (New Post + Research), 
    - recent posts container slides over top row, 
    - bottom grid slides in from below, 
    - tagline with typewriter effect somewhere
* Posts / Research pages: 
    - 3-column layout, 
    - left & right asides fade/slide in,
    - center cards slide from below, 
    - featured/highlighted posts with subtle hover effects and glow accents
* Header: 
    - shrinks/collapses on scroll down, reappears on scroll up

# Future Functionality (todo)
1. post comments
2. dashboardStats 
3. refresh tokens with server side tracking
4. Fix UX problem for desktopNav(hard to navigate) and make navList more reusable
5. Make SVG'S in to components
6. make a loading component
7. Fix so user info doesn't unmount on leaving admin area
8. fix model validation if something is required or not on front end
9. add tool tip? maybe better to use for header nav instead of expanding text and can be used for other things maybe
10. Think about future heavy end point for GET all, (if i make comments possible and or have 500+ posts/deep dives)
11. Rename everything "research" related to "deepDive" since research is deep dives
12. Add read time?, 

*Example:*

```ts
const getReadingTime = (post: Post) => {
    if (!post.content) return '3 min';
    const wordsPerMinute = 200;
    const wordCount = post.content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return ${minutes} min;
};
```

13. Extract helpers and other things that could be used form global scope out of components
14. Redo Edit and Create modal for admin so preview and content is in better view, with a way to select texts for markdown instead of writing it by hand.
15. Fix keyboard navigation on some things, New Post doesn't have it, clickable titles doesn't get selected.
16. ...