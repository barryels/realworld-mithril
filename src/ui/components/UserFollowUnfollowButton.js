'use strict';


var m = require('mithril');


var UserFollowButton = require('./UserFollowButton');
var UserUnfollowButton = require('./UserUnfollowButton');


function getActionButton(isFollowing, username, loggedInUsername) {

  if (!loggedInUsername) {
    return m(UserFollowButton, { username: username, action: m.route.set.bind(null, '/register') });
  }

  if (username === loggedInUsername) {
    return null;
  }

  if (isFollowing === true) {
    return m(UserUnfollowButton, { username: username });
  }

  return m(UserFollowButton, { username: username });
}


function view(vnode) {
  return getActionButton(vnode.attrs.isFollowing, vnode.attrs.username, vnode.attrs.loggedInUsername);
};


module.exports = {
  view: view
};
