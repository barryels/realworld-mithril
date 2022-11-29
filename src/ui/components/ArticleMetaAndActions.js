import m from "mithril";

import ArticleMeta from "./ArticleMeta";
import ArticleActions from "./ArticleActions";

function view(vnode) {
  return [
    m(ArticleMeta, {
      article: vnode.attrs.article,
      style: "display:inline-block; ",
    }),
    m(ArticleActions, { article: vnode.attrs.article }),
  ];
}

export default { view };
