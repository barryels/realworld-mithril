import m from "mithril";

import ArticleMetaAndActions from "./ArticleMetaAndActions";

function view(vnode) {
  var title = vnode.attrs.article.data ? vnode.attrs.article.data.title : "...";

  return m("div", [
    m("h1", title),
    m(ArticleMetaAndActions, { article: vnode.attrs.article }),
  ]);
}

export default { view };
