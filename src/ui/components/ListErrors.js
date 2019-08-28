'use strict';


var m = require('mithril');


function view(vnode) {
  var errors = vnode.attrs.errors;

  if (errors) {
    return m('ul.error-messages',
      Object.keys(errors).map(function (errorKey) {
        return m('li', { key: errorKey }, errorKey + ' ' + errors[errorKey]);
      })
    );
  }


  return null;
};


module.exports = {
  view: view
};
