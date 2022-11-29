import m from "mithril";

import AppHeader from "./../components/AppHeader";
import ScreenContent from "./../components/ScreenContent";
import AppFooter from "./../components/AppFooter";

const name = "LayoutDefault";

function view(vnode) {
  return m("div", { className: name }, [
    m(AppHeader),
    m(ScreenContent, {}, vnode.children),
    m(AppFooter),
  ]);
}

export default { view };
