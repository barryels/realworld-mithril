import m from "mithril";

import domain from "./../../domain";
import utils from "./../utils";
import ListErrors from "./../components/ListErrors";
import UserSettingsForm from "./../components/UserSettingsForm";

function oninit() {
  utils.updateDocumentTitle("Settings");
}

function view() {
  return m(".container.page", [
    m(".row", [
      m(".col-md-6.offset-md-3.col-xs-12", [
        m("h1.text-xs-center", "Your Settings"),
        m(ListErrors, { errors: domain.store.userUpdateSettingsErrors }),
        m(UserSettingsForm, {
          currentUser: domain.store.user,
          isUserSettingsUpdateBusy: domain.store.isUserSettingsUpdateBusy,
          fn_updateUserSettings: domain.actions.updateUserSettings,
          fn_logUserOut: domain.actions.logUserOut,
        }),
      ]),
    ]),
  ]);
}

export default {
  oninit,
  view,
};
