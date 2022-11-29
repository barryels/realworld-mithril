import m from "mithril";

import UserFollowUnfollowButton from "./UserFollowUnfollowButton";

function view(vnode) {
  var selectedUser = vnode.attrs.selectedUser
    ? vnode.attrs.selectedUser
    : {
        bio: "",
        image: "",
        username: "",
      };

  var loggedInUser = vnode.attrs.loggedInUser
    ? vnode.attrs.loggedInUser
    : {
        username: "",
      };

  return m(
    ".user-info",
    m(".container", [
      m(".row", [
        m(".col-xs-12 col-md-10 offset-md-1", [
          m("img.user-img", { src: selectedUser.image }),
          m("h4", selectedUser.username || "..."),
          m("p", selectedUser.bio),
          m(UserFollowUnfollowButton, {
            isFollowing: selectedUser.following,
            username: selectedUser.username,
            loggedInUsername: loggedInUser.username,
          }),
        ]),
      ]),
    ])
  );
}

export default { view };
