import m from "mithril";

function view(vnode) {
  return m("section", vnode.children);
}

export default { view };
