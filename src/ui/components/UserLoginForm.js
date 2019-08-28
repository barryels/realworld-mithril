'use strict';


var m = require('mithril');


var domain = require('./../../domain');


var state = {
  email: '',
  password: '',
  setEmail: function (v) { state.email = v; },
  setPassword: function (v) { state.password = v; }
};


function onLoginButtonClick(e) {
  e.preventDefault();

  domain.actions.attemptUserLogin(state.email, state.password);
}


function view(vnode) {
  return m('form',
    m('fieldset',
      [
        m('fieldset.form-group',
          m('input.form-control.form-control-lg', { oninput: m.withAttr('value', state.setEmail), value: state.email, type: 'email', autocomplete: 'off', placeholder: 'Email', disabled: vnode.attrs.isUserLoginBusy })
        ),
        m('fieldset.form-group',
          m('input.form-control.form-control-lg', { oninput: m.withAttr('value', state.setPassword), value: state.password, type: 'password', autocomplete: 'off', placeholder: 'Password', disabled: vnode.attrs.isUserLoginBusy })
        ),
        m('button.btn.btn-lg.btn-primary.pull-xs-right', { onclick: onLoginButtonClick, disabled: vnode.attrs.isUserLoginBusy }, 'Sign in')
      ]
    )
  );
};


module.exports = {
  view: view
};
