'use strict';


var m = require('mithril');


function view() {
  return m('footer',
    m('.container', [
      m('a.logo-font', { href: '/' }, 'conduit'),
      m('span.attribution',
        m.trust('An interactive learning project from <a href="https://thinkster.io">Thinkster</a>. Code &amp; design licensed under MIT.')
      )
    ])
  );
};


module.exports = {
  view: view
};
