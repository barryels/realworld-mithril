import m from "mithril";

import TagList from "./TagList";

function view(vnode) {
  var tagsContent = m("div", "Loading Tags...");

  if (vnode.attrs.isLoading === false) {
    tagsContent = m(TagList, { list: vnode.attrs.list });
  }

  return m("div", [m("p", "Popular Tags"), tagsContent]);
}

export default { view };
