import m from "mithril";

import domain from "./../../domain";
import MainNav from "./MainNav";
import Link from "./Link";

function view() {
  return m(
    "header",
    m(
      "nav.navbar.navbar-light",
      m(
        ".container",
        m(
          Link,
          { className: "navbar-brand pull-xs-none pull-md-left", to: "/" },
          "conduit"
        ),
        m(MainNav, {
          className: "nav navbar-nav pull-xs-none pull-md-right text-xs-center",
          currentUser: domain.store.user,
        })
      )
    )
  );
}

export default { view };
