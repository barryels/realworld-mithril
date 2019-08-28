'use strict';


var m = require('mithril');


var state = {
  fn_updateUserSettings: null,
  fn_logUserOut: null,
  formData: {}
};


function setInputValue(name, value) {
  state.formData[name] = value;
}


function onSubmitButtonClick(e) {
  e.preventDefault();

  state.fn_updateUserSettings(state.formData);
}


function onLogoutButtonClick(e) {
  e.preventDefault();

  state.fn_logUserOut();
}


function oninit(vnode) {
  setupFormData(vnode.attrs.currentUser);

  state.fn_updateUserSettings = vnode.attrs.fn_updateUserSettings;
  state.fn_logUserOut = vnode.attrs.fn_logUserOut;
}


function setupFormData(data) {
  var userData = data ? data : {
    bio: '',
    email: '',
    image: '',
    username: ''
  };

  state.formData = {
    bio: userData.bio,
    email: userData.email,
    image: userData.image,
    username: userData.username
  };
}


function onbeforeupdate(vnode, vnodeOld) {
  if (vnodeOld.attrs.currentUser !== vnode.attrs.currentUser) {
    setupFormData(vnode.attrs.currentUser);
  }

  return true;
}


function view(vnode) {

  return m('div', [
    m('form',
      m('fieldset',
        [
          m('fieldset.form-group',
            m('input.form-control', { oninput: m.withAttr('value', setInputValue.bind(null, 'image')), value: state.formData.image, type: 'text', autocomplete: 'off', placeholder: 'URL of profile picture', disabled: vnode.attrs.isUserSettingsUpdateBusy })
          ),
          m('fieldset.form-group',
            m('input.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'username')), value: state.formData.username, type: 'email', autocomplete: 'off', placeholder: 'Username', disabled: vnode.attrs.isUserSettingsUpdateBusy })
          ),
          m('fieldset.form-group',
            m('textarea.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'bio')), value: state.formData.bio, autocomplete: 'off', rows: '8', placeholder: 'Short bio about you', disabled: vnode.attrs.isUserSettingsUpdateBusy })
          ),
          m('fieldset.form-group',
            m('input.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'email')), value: state.formData.email, type: 'email', autocomplete: 'off', placeholder: 'Email', disabled: vnode.attrs.isUserSettingsUpdateBusy })
          ),
          m('fieldset.form-group',
            m('input.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'password')), value: state.formData.password, type: 'password', autocomplete: 'off', placeholder: 'Password', disabled: vnode.attrs.isUserSettingsUpdateBusy })
          ),
          m('button.btn.btn-lg.btn-primary.pull-xs-right', { onclick: onSubmitButtonClick, disabled: vnode.attrs.isUserSettingsUpdateBusy }, 'Update Settings')
        ]
      )
    ),
    m('hr'),
    m('button.btn.btn-outline-danger', { onclick: onLogoutButtonClick, disabled: vnode.attrs.isUserSettingsUpdateBusy }, 'Or click here to logout')
  ]);
};


module.exports = {
  oninit: oninit,
  onbeforeupdate: onbeforeupdate,
  view: view
};
