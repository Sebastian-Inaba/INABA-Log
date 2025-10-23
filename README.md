# INABA-Log (Blog)

**By Sebastian Inaba**

> A personal blog combining coding, research, and project updates.

---

## About This Project

INABA-Log is a **personal blog** designed to document coding projects, case studies, and my thoughts. It supports Markdown(haven't decided on library) for content creation, allowing clean posts and research entries. The project is built with a modern **MERN + TypeScript stack** and styled with **Tailwind CSS** for a responsive and interactive experience.

**Tech Stack:**
(for now)
* **Frontend:** React + TypeScript + Tailwind CSS
* **Backend:** Node.js + Express + TypeScript
* **Database:** MongoDB * Supabase
* **Other Tools:** react-router-dom, cookie-parser, prettier, axios react-markdown(maybe)

**Key Features:**

* Full **CRUD** for blog posts and research entries
* Categorize posts
* Markdown support for all posts and research
* Highlighted or featured posts
* Search and filtering
* Responsive design with Tailwind CSS
* Admin panel for secure content management

---

### Progress Updates

# Update

- Created a **Research Detail** page, allowing full deep dives to be viewed along with their content.  
- Added some items to the TODO list for future implementation.  
- Encountered one CSS issue(idea i tried to implement): the main content blocks do not yet extend to full width under the sidebar on desktop, leaving empty space beneath it. This will be fixed in a future update. Also the copy card boxes are different sizes 

* **TL;DR:**
Post page is now functional with post listings. But...  
- Scroll behavior has occasional jumps due to Lenis(i assume), not sure why.  
- Pagination page resets view to top on page 1 but not 2(why?).  
- Search/filter does not filter by categories yet.  

#### Full Design Example (might not be final product)

- The design is thought out to be simple to navigate with no big distraction from the users
- However I wanted a dark theme design with allot of different colors to highlight content
- Right now I'm playing around with a lot of different colors and they are a bit distracting

![Full Design Example](/READMEImages/FullViewExampleOfDesigns.png)

---

### Why This Project?

INABA-Log serves as a **development journal** and **my personal thoughts**, combining:

* A **blog** for thoughts, tutorials, and research insights.
* A **learning tool** where i can log my proses of web development.

---

## License

MIT License © Sebastian Inaba