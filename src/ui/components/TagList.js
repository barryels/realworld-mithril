import m from "mithril";

import Link from "./Link";

var styles = {
  OUTLINE: "OUTLINE",
};

function view(vnode) {
  var list = vnode.attrs.list ? vnode.attrs.list : [];
  var linkClassName = "tag-default tag-pill";

  if (vnode.attrs.style === styles.OUTLINE) {
    linkClassName += " tag-outline";
  }

  return m(
    "ul.tag-list",
    list.map(function (tag) {
      return m(
        "li",
        m(
          Link,
          {
            className: linkClassName,
            key: tag,
            to: "",
            onclick: function (e) {
              e.preventDefault();
            },
          },
          tag
        )
      );
    })
  );
}

export default { styles, view };
