'use strict';


var m = require('mithril');


var state = {
  fn_registerUser: null,
  formData: {}
};


function setInputValue(name, value) {
  state.formData[name] = value;
}


function onRegisterButtonClick(e) {
  e.preventDefault();

  state.fn_registerUser(state.formData);
}


function oninit(vnode) {
  state.formData = {
    email: '',
    password: '',
    username: ''
  };

  state.fn_registerUser = vnode.attrs.fn_registerUser;
}



function view(vnode) {
  return m('form',
    m('fieldset',
      [
        m('fieldset.form-group',
          m('input.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'username')), value: state.formData.username, type: 'text', autocomplete: 'off', placeholder: 'Username', disabled: vnode.attrs.isUserRegistrationBusy })
        ),
        m('fieldset.form-group',
          m('input.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'email')), value: state.formData.email, type: 'email', autocomplete: 'off', placeholder: 'Email', disabled: vnode.attrs.isUserRegistrationBusy })
        ),
        m('fieldset.form-group',
          m('input.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'password')), value: state.formData.password, type: 'password', autocomplete: 'off', placeholder: 'Password', disabled: vnode.attrs.isUserRegistrationBusy })
        ),
        m('button.btn.btn-lg.btn-primary.pull-xs-right', { onclick: onRegisterButtonClick, disabled: vnode.attrs.isUserRegistrationBusy }, 'Sign up')
      ]
    )
  );
};


module.exports = {
  oninit: oninit,
  view: view
};
