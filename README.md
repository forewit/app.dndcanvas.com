# RPCanvas
### TODO
- [X] draw selection bounding box
- [ ] resizing entities
- [X] drag-n-drop select box
- [X] fix inertia bug (keeps inertia when stopped)
- [ ] create **Pen** entity
- [ ] button -> to switch tools
- [X] fix issue with zoom / transform scale() with iOS and firefox

### [Optimizations](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- [ ] draw inactive layers offscreen
- [ ] scale using css transforms instead of canvas scaling
- [ ] stick to integer canvas transforms
- [ ] update notes only if the canvas is moved
- [ ] skip render loop if nothing is happening
- [ ] skip rendering an entity if it's not visible