# INABA-Log (Blog)

**By Sebastian Inaba**

**Live at:** https://sebastian-inaba.github.io/INABA-Log/ — (WIP)

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

# Update : Site is live!

**It’s live!** The site is published on GitHub Pages for now: https://sebastian-inaba.github.io/INABA-Log/

This initial release is still light on content(none), but the core deployment and auth flow are working. During testing I ran into several issues CORS, URL redirects, service worker registration, a white flash during redirects, and auth persistence (was using `sessionStorage` which is not very good). I fixed these problems.

Next steps:
- Add posts and deep-dives
- Improve SEO and accessibility (WCAG)
- Implement server-side pagination and signed URLs
- Add analytics and other monitoring
- And a lot more

There’s still a lot to do, but this is a solid start.


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

<sub>
The **INABA-Log** logo and branding are protected under a separate license.  
See [LOGO-LICENSE](./LOGO-LICENSE) for details.  
</sub>