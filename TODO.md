# Future Functionality / todo
1. post comments.
2. dashboardStats .
3. refresh tokens with server side tracking.
4. Fix UX problem for desktopNav(hard to navigate) and make navList more reusable.
5. Make SVG'S in to components.
6. make a loading component.
7. Fix so user info doesn't unmount on leaving admin area.
8. fix model validation if something is required or not on front end.
9. add tool tip? maybe better to use for header nav instead of expanding text and can be used for other things maybe.
10. Think about future heavy end point for GET all, (if i make comments possible and or have 500+ posts/deep dives).
11. Rename everything "research" related to "deepDive" since research is deep dives.
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

13. Extract helpers and other things that could be used form global scope out of components.
14. Redo Edit and Create modal for admin so preview and content is in better view, with a way to select texts for markdown instead of writing it by hand.
15. Fix keyboard navigation on some things, New Post doesn't have it, clickable titles doesn't get selected.
16. Make page pagination in to Server-Side pagination for true scalability with posts and deep dives.
17. ...