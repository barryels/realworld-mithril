import m from "mithril";

import domain from "./../../domain";
import utils from "./../utils";
import Link from "./../components/Link";
import UserLoginForm from "./../components/UserLoginForm";
import ListErrors from "./../components/ListErrors";

function redirectIfUserLoggedIn() {
  if (domain.store.user) {
    domain.actions.redirectAfterUserLoginSuccess();
  }
}

function oninit() {
  utils.updateDocumentTitle("Sign in");

  redirectIfUserLoggedIn();
}

function onupdate() {
  redirectIfUserLoggedIn();
}

function view() {
  return m("div", [
    m(".container.page", [
      m(".row", [
        m(".col-md-6.offset-md-3.col-xs-12", [
          m("h1.text-xs-center", "Sign in"),
          m(
            "p.text-xs-center",
            m(Link, { to: "/register" }, "Need an account?")
          ),
          m(ListErrors, { errors: domain.store.userLoginErrors }),
          m(UserLoginForm, { isUserLoginBusy: domain.store.isUserLoginBusy }),
        ]),
      ]),
    ]),
  ]);
}

export default {
  oninit,
  onupdate,
  view,
};
