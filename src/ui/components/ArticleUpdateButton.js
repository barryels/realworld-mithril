import m from "mithril";

function view(vnode) {
  return [
    m(
      "span",
      m(
        "button.btn.btn-outline-secondary.btn-sm",
        { onclick: vnode.attrs.action },
        [m("i.ion-edit"), m("span", " Edit Article")]
      )
    ),
  ];
}

export default { view };
