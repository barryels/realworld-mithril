import m from "mithril";

import utils from "./../utils";
import Link from "./Link";

function view(vnode) {
  var comment = vnode.attrs.comment;

  return m("div.card", [
    m(
      "div.card-block",
      m(
        "div.card-text",
        m.trust(utils.formatArticleCommentBodyText(comment.body))
      )
    ),
    m("div.card-footer", [
      m(
        Link,
        {
          className: "comment-author",
          to: utils.getLinkToUserProfile(comment.author.username),
        },
        m("img.comment-author-img", { src: comment.author.image })
      ),
      m("span", m.trust("&nbsp; ")),
      m(
        Link,
        {
          className: "comment-author",
          to: utils.getLinkToUserProfile(comment.author.username),
        },
        comment.author.username
      ),
      m(
        "span.date-posted",
        utils.formatDate(
          comment.createdAt,
          utils.dateFormatTypes.DEFAULT_WITH_TIME
        )
      ),
    ]),
  ]);
}

export default { view };
