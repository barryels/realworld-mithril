'use strict';


var m = require('mithril');


var utils = require('./../utils');
var Link = require('./Link');


function view(vnode) {
  var currentUser = vnode.attrs.currentUser ? vnode.attrs.currentUser : {
    username: ''
  };

  var allLinks = {
    home: { route: '/', label: 'Home' },
    login: { route: '/login', label: 'Sign in' },
    register: { route: '/register', label: 'Sign up' },
    editor: { route: '/editor', label: '<i class="ion-compose"></i> New Article' },
    settings: { route: '/settings', label: '<i class="ion-gear-a"></i> Settings' },
    user: { route: '/@' + currentUser.username, label: '<img class="user-pic" src="' + utils.getUserImageOrDefault(currentUser) + '" /> ' + currentUser.username }
  };

  var linksForGuest = [
    allLinks.home,
    allLinks.login,
    allLinks.register
  ];

  var linksForMember = [
    allLinks.home,
    allLinks.editor,
    allLinks.settings,
    allLinks.user
  ];


  var linksToDisplay = linksForGuest;
  if (currentUser.username) {
    linksToDisplay = linksForMember;
  }

  return m('ul', { className: vnode.attrs.className },
    linksToDisplay.map(function (link) {
      var className = 'nav-link';

      if (m.route.get() === link.route) {
        className += ' active';
      }

      return m('li.nav-item', m(Link, { className: className, to: link.route }, m.trust(link.label)));
    })
  );

};


module.exports = {
  view: view
};
