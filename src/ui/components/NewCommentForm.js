'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');


var state = {
  formData: {
    articleSlug: '',
    body: ''
  }
};


function setInputValue(name, value) {
  state.formData[name] = value;
}


function isFormSubmissionBusy() {
  return domain.store.isArticleCommentCreationBusy;
}

function isFormSubmitDisabled() {
  return state.formData.body === '' || domain.store.selectedArticle.data === null || isFormSubmissionBusy() === true;
}


function onFormSubmit(e) {
  e.preventDefault();

  setInputValue('articleSlug', domain.store.selectedArticle.data.slug);
  domain.actions.createArticleComment(state.formData);
  setInputValue('body', '');
}


function view() {
  return m('div', [
    m('form.card comment-form', { disabled: isFormSubmissionBusy(), onsubmit: onFormSubmit },
      m('div.card-block',
        m('textarea.form-control', { oninput: m.withAttr('value', setInputValue.bind(null, 'body')), value: state.formData.body, autocomplete: 'off', disabled: isFormSubmissionBusy(), rows: '3', placeholder: 'Write a comment...' })
      ),
      m('div.card-footer', [
        m('img.comment-author-img', { src: utils.getUserImageOrDefault(domain.store.user) }),
        m('button.btn.btn-sm.btn-primary', { type: 'submit', disabled: isFormSubmitDisabled() }, 'Post Comment')
      ])
    )
  ]);
};


module.exports = {
  view: view
};
