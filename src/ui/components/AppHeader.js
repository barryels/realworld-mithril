'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var MainNav = require('./MainNav');
var Link = require('./Link');


function view() {
  return m('header',
    m('nav.navbar.navbar-light',
      m('.container',
        m(Link, { className: 'navbar-brand pull-xs-none pull-md-left', to: '/' }, 'conduit'),
        m(MainNav, { className: 'nav navbar-nav pull-xs-none pull-md-right text-xs-center', currentUser: domain.store.user })
      )
    )
  );
};


module.exports = {
  view: view
};
