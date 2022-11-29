import m from "mithril";

function view(vnode) {
  var content = [
    m("h1.logo-font", "conduit"),
    m("p", "A place to share your knowledge."),
  ];

  if (vnode.children.length > 0) {
    content = vnode.children;
  }

  return m(".banner", m(".container", content));
}

export default { view };
