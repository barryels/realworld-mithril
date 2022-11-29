import m from "mithril";

import Link from "./Link";

function view(vnode) {
  var totalPages = vnode.attrs.totalPages || 1;
  var currentPage = vnode.attrs.currentPage || 1;
  var pageList = Array.apply(null, Array(totalPages));

  return m(
    "nav",
    m(
      "ul.pagination",
      pageList.map(function (tag, i) {
        var activeClassName = "";

        if (currentPage === i + 1) {
          activeClassName = ".active";
        }

        return m(
          "li.page-item" + activeClassName,
          { key: i },
          m(
            Link,
            {
              className: "page-link",
              to: "",
              onclick: function (e) {
                e.preventDefault();
                vnode.attrs.fn_onItemClick(i + 1);
              },
            },
            String(i + 1)
          )
        );
      })
    )
  );
}

export default { view };
