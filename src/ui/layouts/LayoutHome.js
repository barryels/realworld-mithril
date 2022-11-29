import m from "mithril";

import AppHeader from "./../components/AppHeader";
import ScreenContent from "./../components/ScreenContent";

const name = "LayoutHome";

function view(vnode) {
  return m(
    "div",
    {
      className: name,
    },
    [m(AppHeader), m(ScreenContent, {}, vnode.children)]
  );
}

export default { view };
