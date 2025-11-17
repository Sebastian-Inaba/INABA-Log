# Future Functionality / TODO

### **Quick Fixes / Small Improvements**

* [V] Fix UX problem for `desktopNav` (hard to navigate) and make `navList` more reusable.
* [V] Make SVGs into components.
* [ ] Make a loading component.
* [V] Fix so user info doesn't unmount on leaving admin area.
* [ ] Fix model validation if something is required or not on the front end.
* [ ] Add tooltip? (maybe better for header nav instead of expanding text; reusable elsewhere).
* [ ] Rename everything `"research"` related to `"deepDive"`.
* [ ] Add category to search filter.
* [ ] Add read time to posts. Subject, subject date, page length, language and pdf view not only download(new page?).

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
* [V] Remove all `memo` font maps and assign globally inside font CSS import.
* [ ] Make so content blocks on deep dives take up full width under the sidebar (tried before but failed)

---

### **Medium Effort / Structural Changes**

* [ ] Post comments functionality.
* [ ] Dashboard stats.
* [ ] Redo admin: preview + content in better view, selectable markdown text and mobile responsive.
* [ ] Make page pagination server-side for true scalability.
* [ ] Make page refresh maintain last scroll position.
* [ ] Fix WCAG accessibility.
* [ ] Fix page printing.
* [ ] Fix SEO.

---

### **Future Features / Scalability Considerations**

* [ ] Refresh tokens with server-side tracking.
* [ ] Consider heavy endpoints for `GET all` if 500+ posts / deep dives exist.
* [V] Add identity for branding. Logo, colors, fonts, mascot?, backdrops, etc.. Right now its all over the place.

## Prioritized Follow-Up (highest to lowest)

* [V] Fix UX problem for `desktopNav` (hard to navigate) and make `navList` more reusable.
* [ ] Fix model validation if something is required or not on the front end.
* [ ] Fix keyboard navigation on new post forms and clickable titles.
* [ ] Fix WCAG accessibility .
* [ ] Fix SEO.
* [ ] Refresh tokens with server-side tracking.
* [ ] Make page pagination server-side for true scalability.
* [ ] Consider heavy endpoints for `GET all` if 500+ posts / deep dives exist.
* [ ] Redo admin: preview + content in better view, selectable markdown text and mobile responsive.
* [ ] Make page refresh maintain last scroll position.
* [ ] Post comments functionality.
* [ ] Dashboard stats.
* [ ] Extract helpers and shared utilities from components to global scope.
* [V] Make SVGs into components.
* [ ] Make a loading component.
* [ ] Add tooltip? (maybe better for header nav instead of expanding text; reusable elsewhere).
* [ ] Add category to search filter.
* [ ] Add read time to posts.
* [ ] Rename everything `"research"` related to `"deepDive"`.
* [V] Remove all `memo` font maps and assign globally inside font CSS import.
* [V] Add identity for branding. Logo, colors, fonts, mascot?, backdrops, etc.. Right now its all over the place.
* [ ] Fix page printing.

### Quick add of new todo's
* [ ] Remove IOS bounce/over-drag on top of website(makes header hide uncontrollably).
* [ ] Add robot and sitemap.
* [ ] Add google analytics.
* [ ] Add singed url for get requests.
* [ ] Maybe add visualization for lists.
* [ ] Fix markdown rendering for special links.
