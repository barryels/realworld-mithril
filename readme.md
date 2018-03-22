# ![RealWorld Example App](logo.png)

> ### [Mithril](https://mithril.js.org/) codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld-example-apps) spec and API.


### [Demo](https://realworld-mithril.netlify.com/)&nbsp;&nbsp;&nbsp;&nbsp;[RealWorld](https://github.com/gothinkster/realworld)


This codebase was created to demonstrate a fully fledged fullstack application built with **[Mithril](https://mithril.js.org/)** including CRUD operations, authentication, routing, pagination, and more.

We've gone to great lengths to adhere to the **[Mithril](https://mithril.js.org/)** community styleguides & best practices.

For more information on how this works with other frontends/backends, head over to the [RealWorld](https://github.com/gothinkster/realworld) repo.


## How it works


### 10 000 Foot View

```

                    +---------------+
                    |               |
            +------->  Component X  +-------+
            |       |               |       |
            |       +---------------+       |
            |                               |
 [store.prop reference]               (function call)
            |                               |
            |    +--------------------+     |
            |    |                    |     |
            -----+       domain       <-----+
                 |                    |
                 |    Updates its     |
                 |   internal state   |
                 |   in response to   |
                 |      API data      |
                 |                    |
                 +----------^---------+
                            |
                            |
                            V
                    (External API(s))

```


`domain/index.js`

Handles app-level concerns and is UI agnostic. It handles communication with the external API (which should be abstracted away into a separate module for larger apps). It has a basic `store` data object which can be (relatively) easily replaced by Redux, mobX, etc. with/out Immutable data structures.
It has two public interfaces:
- `store` is a way to read values
- `actions` has a set of functions which can be called in order to mutate state


`ui/router.js`

[TODO Add detail]


`ui/components/*.js`

[TODO Add detail]


## Getting started

You can view a live demo over at [realworld-mithril.netlify.com](https://realworld-mithril.netlify.com/)

To get the frontend running locally:

- Clone this repo
- Run $ `npm install` to install all the required dependencies
- Run $ `npm start` to start the local server and JS build
