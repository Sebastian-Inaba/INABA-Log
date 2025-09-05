# INABA-LOG

## Personal Blog

**Tech Stack:** MERN-Stack with TypeScript

### Features

* CRUD for blog posts and deep dives
* Categorize posts (UX case studies, coding projects, etc.)
* Categorize Deep dives (UX case studies, coding projects, etc.)
* Markdown support for posts

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

**Backend:**
- Node.js
- Express
- Mongoose
- CORS
- dotenv
- TypeScript
- Nodemon
- Supabase (image and pdf storage)

**Utilities:**
- Concurrently (run frontend + backend at the same time form root)
- ts-node (not sure, lol. Think its to make TypeScript work on a node server)
- Prettier (Terminal command for prettier code structure)

---

## Frontend (React + TypeScript + Tailwind)

### Header

* Title: INABA-LOG
* Navigation: Home (logo), Posts, Research
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

* 3-column grid:

  * Left aside nav: search, filter with tags, date, etc.
  * Center: posts feed (PostCard)
  * Right aside: highlighted posts
* Clicking a post opens modal/overlay

#### Research Page, deepdives (<span style="color: #188038;">/research</span>)

* Same 3-column layout as Posts

  * Left aside nav: search, filter with tags, date, etc.
  * Right aside: highlighted posts
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
- `GET /api/posts/:id` → get single post
- `POST /api/posts` → create post (admin only)
- `PUT /api/posts/:id` → update post (admin only)
- `DELETE /api/posts/:id` → delete post (admin only)

#### Research
- `GET /api/research` → list research entries
- `GET /api/research/:id` → get single research entry
- `POST /api/research` → create research entry (admin only)
- `PUT /api/research/:id` → update research entry (admin only)
- `DELETE /api/research/:id` → delete research entry (admin only)

#### Auth
- `POST /api/auth/login` → login admin
- `GET /api/auth/me` → get current admin info

#### Upload (Supabase Storage)
- `POST /api/upload` → upload file to Supabase storage (admin only)
- `DELETE /api/upload/:filename` → delete file from Supabase storage (admin only)

---

## Database Models

### Post Model
- **Model Name:** Post
- `_id`: ObjectId
- `title`: string
- `slug`: string
- `content`: string (Markdown)
- `category`: string (coding, UX, etc.)
- `tags`: string array
- `featuredImage`: string (Supabase storage URL)
- `attachments`: string array (Supabase storage URLs)
- `createdAt`: Date
- `updatedAt`: Date
- `featured`: boolean (optional)

### Research Model
- **Model Name:** Research
- `_id`: ObjectId
- `title`: string
- `author`: string
- `abstract`: string
- `content`: string (Markdown)
- `references`: string array (optional)
- `tags`: string array
- `featuredImage`: string (Supabase storage URL)
- `attachments`: string array (Supabase storage URLs)
- `createdAt`: Date
- `updatedAt`: Date
- `featured`: boolean (optional)

### User Model
- **Model Name:** User (Admin Only)
- `_id`: ObjectId
- `username`: string
- `passwordHash`: string
- `role`: string ("admin")

---

## Config

### DB Configuration
- MongoDB connection setup with Mongoose
- Connection pooling optimization
- Indexing strategy for posts and research collections

### Environment Variables
- `MONGODB_URI`
- `PORT`
- `JWT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_BUCKET`
- `NODE_ENV`

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
- `createPost` (with image handling, link, code snippet area)
- `updatePost` (with image handling, link, code snippet area)
- `deletePost` (with associated file cleanup)

### Research Controller
- `getResearch` (with filtering and pagination)
- `getResearchById`
- `createResearch` (with image handling, link, code snippet area)
- `updateResearch` (with image handling, link, code snippet area)
- `deleteResearch` (with associated file cleanup)

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
- `dashboardStats`(if i ever add any)
- `contentManagement`

---

## Middleware

### Auth Middleware
- JWT verification
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
