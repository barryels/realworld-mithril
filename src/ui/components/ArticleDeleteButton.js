import m from "mithril";

function view(vnode) {
  return [
    m(
      "span",
      m(
        "button.btn.btn-outline-danger.btn-sm",
        { onclick: vnode.attrs.action },
        [m("i.ion-trash-a"), m("span", " Delete Article")]
      )
    ),
  ];
}

export default { view };
