import m from "mithril";

import domain from "./../../domain";
import utils from "./../utils";
import Link from "./../components/Link";
import ListErrors from "./../components/ListErrors";
import UserRegistrationForm from "./../components/UserRegistrationForm";

function oninit() {
  utils.updateDocumentTitle("Sign up");
}

function onupdate() {
  if (domain.store.user) {
    domain.actions.redirectAfterUserRegistrationSuccess();
  }
}

function view() {
  return m("div", [
    m(".container.page", [
      m(".row", [
        m(".col-md-6.offset-md-3.col-xs-12", [
          m("h1.text-xs-center", "Sign up"),
          m("p.text-xs-center", m(Link, { to: "/login" }, "Have an account?")),
          m(ListErrors, { errors: domain.store.userRegistrationErrors }),
          m(UserRegistrationForm, {
            isUserRegistrationBusy: domain.store.isUserRegistrationBusy,
            fn_registerUser: domain.actions.registerNewUser,
          }),
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
