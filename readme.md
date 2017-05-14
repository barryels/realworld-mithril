# ![RealWorld Example App](logo.png)

> ### [Mithril](https://mithril.js.org/) codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld-example-apps) spec and API.


### [Demo](TODO add production url)&nbsp;&nbsp;&nbsp;&nbsp;[RealWorld](https://github.com/gothinkster/realworld)


This codebase was created to demonstrate a fully fledged fullstack application built with **[Mithril](https://mithril.js.org/)** including CRUD operations, authentication, routing, pagination, and more.

We've gone to great lengths to adhere to the **[Mithril](https://mithril.js.org/)** community styleguides & best practices.

For more information on how this works with other frontends/backends, head over to the [RealWorld](https://github.com/gothinkster/realworld) repo.


## How it works


### 10 000 foot View

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
                 | internal state obj |
                 |   in response to   |
                 |      API data      |
                 |                    |
                 +----------^---------+
                            |
                            |
                            V
                    (External API(s))

```


`domain.js`

Handles app-level concerns and is UI agnostic. It handles communication with the external API (which should be abstracted away into a separate module for larger apps). One of its responsibilities is to abstract any API-level changes away from the rest of the app.. It has a basic `store` data object which can be (relatively) easily replaced by Redux, mobX, etc. with/out Immutable data structures.


`router.js`

[TODO Add detail]


`components/*.js`

[TODO Add detail]


## Getting started

You can view a live demo over at [TODO add production url]

To get the frontend running locally:

- Clone this repo
- Run $ `npm install` to install all the required dependencies
- Run $ `npm start` to start the local server and JS build
