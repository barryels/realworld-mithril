import m from "mithril";

import domain from "./../../domain";
import utils from "./../utils";
import Banner from "./../components/Banner";

var state = {
  username: "",
};

function getUserProfile() {
  state.username = m.route.param("username");
  domain.actions.getUserProfile(state.username);
  document.body.scrollTop = 0;
}

function oninit() {
  getUserProfile();
}

function onbeforeupdate() {
  if (state.username !== m.route.param("username")) {
    getUserProfile();
  }

  return true;
}

function onupdate() {
  utils.updateDocumentTitle("Articles favourited by " + state.username);
}

function view() {
  return m("div", [m(Banner), m("h1", "ScreenUserFavorites")]);
}

export default {
  onbeforeupdate,
  oninit,
  onupdate,
  view,
};
