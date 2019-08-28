'use strict';


var m = require('mithril');


var state = {
  fn_submit: null,
  formData: {}
};


function setInputValue(name, value) {
  state.formData[name] = value;
}


function onSubmitButtonClick(e) {
  e.preventDefault();

  state.fn_submit(state.formData);
}


function oninit(vnode) {
  setupFormData(vnode.attrs.article);

  state.fn_submit = vnode.attrs.fn_submit;
}


function setupFormData(data) {
  var articleData = data ? data : {
    title: '',
    description: '',
    body: '',
    tagList: ''
  };

  state.formData = {
    title: articleData.title,
    description: articleData.description,
    body: articleData.body,
    tagList: articleData.tagList
  };
}


function onbeforeupdate(vnode, vnodeOld) {
  if (vnodeOld.attrs.article !== vnode.attrs.article) {
    setupFormData(vnode.attrs.article);
  }

  return true;
}


function view(vnode) {

  return m('form',
    m('fieldset',
      [
        m('fieldset.form-group',
          m('input.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'title')), value: state.formData.title, type: 'text', autocomplete: 'off', placeholder: 'Article Title', disabled: vnode.attrs.isSubmitBusy })
        ),
        m('fieldset.form-group',
          m('input.form-control', { oninput: m.withAttr('value', setInputValue.bind(null, 'description')), value: state.formData.description, type: 'text', autocomplete: 'off', placeholder: 'What\'s this article about?', disabled: vnode.attrs.isSubmitBusy })
        ),
        m('fieldset.form-group',
          m('textarea.form-control', { oninput: m.withAttr('value', setInputValue.bind(null, 'body')), value: state.formData.body, autocomplete: 'off', rows: '8', placeholder: 'Write your article (in markdown)', disabled: vnode.attrs.isSubmitBusy })
        ),
        m('fieldset.form-group',
          m('input.form-control', { oninput: m.withAttr('value', setInputValue.bind(null, 'tagList')), value: state.formData.tagList, type: 'text', autocomplete: 'off', placeholder: 'Enter tags', disabled: vnode.attrs.isSubmitBusy })
        ),
        m('button.btn.btn-lg.btn-primary.pull-xs-right', { onclick: onSubmitButtonClick, disabled: vnode.attrs.isSubmitBusy }, 'Publish Article')
      ]
    )
  );
};


module.exports = {
  oninit: oninit,
  onbeforeupdate: onbeforeupdate,
  view: view
};
