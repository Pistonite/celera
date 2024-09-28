# Concepts
Celera is built upon the idea of Scenes, Layouts, and Widgets:

- An app has one or more Scenes, defined by the app and not changeable by the user.
- A Scene has one or more Layouts that can be dynamically changed.
- A Layout is a list of Widget IDs and their positions on the screen.
- A Widget is an ID and some data associated with it.

Furthermore, Scene-Layout and Layout-Widget are both many-to-many relationships.
Meaning, a Layout can be used in multiple Scenes, and a Widget can be used in multiple Layouts.
A Widget can even be used in the same Layout multiple times.

This testing app, for example, has 4 Widgets, 1 Scene and 1 Layout.

