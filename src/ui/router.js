import m from "mithril";

import LayoutDefault from "./layouts/LayoutDefault";
import LayoutHome from "./layouts/LayoutHome";

import ScreenDummy from "./screens/ScreenDummy";
import ScreenHome from "./screens/ScreenHome";
// import ScreenArticle from "./screens/ScreenArticle";
// import ScreenUserLogin from "./screens/ScreenUserLogin";
// import ScreenUserRegister from "./screens/ScreenUserRegister";
// import ScreenUserProfile from "./screens/ScreenUserProfile";
// import ScreenUserSettings from "./screens/ScreenUserSettings";
// import ScreenUserFavorites from "./screens/ScreenUserFavorites";
// import ScreenEditor from "./screens/ScreenEditor";

var routes = {
  // "/": buildRoute(ScreenHome),
  // "/": { view: () => m("h1", "Hello 1") },
  // "/": { render: () => m("h1", "Hello 2") },
  // "/": <h1>Hello</h1>,
  // "/": buildRoute(m("h1", "Hello 3")),
  // "/": buildRoute({ view: () => m("h1", "Hello 4") }),
  // "/": buildRoute(ScreenDummy),
  // "/": buildRoute(m("h1", "Hello 5")),
  "/": buildRoute(ScreenHome),
  // "/": buildRoute(ScreenHome, LayoutHome),
  // "/article/:slug": buildRoute(ScreenArticle),
  // "/register": buildRoute(ScreenUserRegister),
  // "/login": buildRoute(ScreenUserLogin),
  // "/@:username": buildRoute(ScreenUserProfile),
  // "/@:username/favorites": buildRoute(ScreenUserFavorites),
  // "/settings": buildRoute(ScreenUserSettings),
  // "/editor": buildRoute(ScreenEditor),
  // "/editor/:slug": buildRoute(ScreenEditor),
};

function buildRoute(screen, layout) {
  layout = layout || LayoutDefault;
  console.log("buildRoute", "layout", layout);
  console.log("buildRoute", "screen", screen);

  return {
    render: function () {
      return m(layout, m(screen));
      // return m(layout, screen);
      // return m(layout, screen.view);
    },
  };
}

function init() {
  console.log("init()");
  // m.route.prefix("?");
  m.route(document.getElementById("app"), "/", routes);
}

export default { init };
