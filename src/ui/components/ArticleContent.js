import m from "mithril";

import utils from "./../utils";
import TagList from "./TagList";

function view(vnode) {
  var article = vnode.attrs.article.data;
  var content = m("div", "...");

  if (article) {
    content = [
      m("div.col-xs-12", [
        m("div", m.trust(utils.convertMarkdownToHTML(article.body))),
        m(TagList, { list: article.tagList, style: TagList.styles.OUTLINE }),
      ]),
    ];
  }

  return m("div.article-content", content);
}

export default { view };
