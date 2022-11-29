import m from "mithril";

function view(vnode) {
  const onclick = vnode.attrs.onclick ? vnode.attrs.onclick : null;

  return m(
    "a",
    {
      className: vnode.attrs.className,
      href: vnode.attrs.to,
      oncreate: m.route.link,
      onupdate: m.route.link,
      onclick: onclick,
    },
    vnode.children
  );
}

export default { view };
