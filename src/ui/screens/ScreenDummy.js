import m from "mithril";

function oninit() {
  console.log("ScreenDummy", "oninit");
}

function view() {
  console.log("ScreenDummy", "view");

  return m("div.home-page", [
    m(".container.page", [
      m(".row", [
        m(".col-md-9", [m("h1", "main")]),
        m(".col-md-3", [m(".sidebar", m("h1", "sidebar"))]),
      ]),
    ]),
  ]);
}

export default { oninit, view };
