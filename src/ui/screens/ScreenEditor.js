'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var NewArticleForm = require('./../components/NewArticleForm');
var ListErrors = require('./../components/ListErrors');


function oninit() {
  utils.updateDocumentTitle('Editor');
}


function view() {
  return m('.container.page', [
    m('.row', [
      m('.col-md-10.offset-md-1.col-xs-12', [
        m(ListErrors, { errors: domain.store.createArticleErrors }),
        m(NewArticleForm, { isSubmitBusy: domain.store.isCreateArticleBusy, fn_submit: domain.actions.createArticle })
      ])
    ])
  ]);
};


module.exports = {
  oninit: oninit,
  view: view
};
