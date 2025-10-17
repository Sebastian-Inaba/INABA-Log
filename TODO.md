# Future Functionality / TODO

### **Quick Fixes / Small Improvements**

* [ ] Fix UX problem for `desktopNav` (hard to navigate) and make `navList` more reusable.
* [ ] Make SVGs into components.
* [ ] Make a loading component.
* [V] Fix so user info doesn't unmount on leaving admin area.
* [ ] Fix model validation if something is required or not on the front end.
* [ ] Add tooltip? (maybe better for header nav instead of expanding text; reusable elsewhere).
* [ ] Rename everything `"research"` related to `"deepDive"`.
* [ ] Add read time to posts.

  ```ts
  const getReadingTime = (post: Post) => {
      if (!post.content) return '3 min';
      const wordsPerMinute = 200;
      const wordCount = post.content.split(/\s+/).length;
      const minutes = Math.ceil(wordCount / wordsPerMinute);
      return `${minutes} min`;
  };
  ```
* [ ] Extract helpers and shared utilities from components to global scope.
* [ ] Fix keyboard navigation on new post forms and clickable titles.
* [ ] Remove all `memo` font maps and assign globally inside font CSS import.

---

### **Medium Effort / Structural Changes**

* [ ] Post comments functionality.
* [ ] Dashboard stats.
* [ ] Redo Edit and Create modal for admin: preview + content in better view, selectable markdown text.
* [ ] Make page pagination server-side for true scalability.
* [ ] Make page refresh maintain last scroll position.

---

### **Future Features / Scalability Considerations**

* [ ] Refresh tokens with server-side tracking.
* [ ] Consider heavy endpoints for `GET all` if 500+ posts / deep dives exist.
* [ ] Add identity for branding. Logo, colors, fonts, mascot?, backdrops, etc.. Right now its all over the place

### **Quick add of new todo's**

* Empty