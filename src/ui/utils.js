'use strict';


var domain = require('./../domain');


var xssFilters = require('xss-filters');
var dateFormatTypes = {
  DEFAULT: 'mmmm d, yyyy',
  DEFAULT_WITH_TIME: 'mmmm d, yyyy @ HH:MM:ss'
};


function updateDocumentTitle(text) {
  document.title = text + ' — ' + domain.store.appTitle;
}


function formatDate(dateString, format) {
  var dateFormat = require('dateformat');

  if (!format) {
    format = dateFormatTypes.DEFAULT;
  }

  try {
    var date = new Date(dateString);
    return dateFormat(date, format);
  } catch (e) {
    return dateString;
  }
}


function convertMarkdownToHTML(content) {
  var marked = require('marked');

  return marked(content);
}


function formatArticleCommentBodyText(content) {
  return convertMarkdownToHTML(xssFilters.inSingleQuotedAttr(content));
}


function getLinkToUserProfile(username) {
  return '/@' + username;
}


function getUserImageOrDefault(user) {
  if (user && (user.image)) {
    return user.image;
  }

  return 'https://static.productionready.io/images/smiley-cyrus.jpg';
}


module.exports = {
  updateDocumentTitle: updateDocumentTitle,
  dateFormats: dateFormatTypes,
  formatDate: formatDate,
  formatArticleCommentBodyText: formatArticleCommentBodyText,
  convertMarkdownToHTML: convertMarkdownToHTML,
  getLinkToUserProfile: getLinkToUserProfile,
  getUserImageOrDefault: getUserImageOrDefault
};
