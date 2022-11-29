import domain from "./../domain";
import dateFormat from "dateformat";
import { marked } from "marked";

import xssFilters from "xss-filters";
export const dateFormatTypes = {
  DEFAULT: "mmmm d, yyyy",
  DEFAULT_WITH_TIME: "mmmm d, yyyy @ HH:MM:ss",
};

export function updateDocumentTitle(text) {
  document.title = text + " — " + domain.store.appTitle;
}

export function formatDate(dateString, format) {
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

export function convertMarkdownToHTML(content) {
  return marked(content);
}

export function formatArticleCommentBodyText(content) {
  return convertMarkdownToHTML(xssFilters.inSingleQuotedAttr(content));
}

export function getLinkToUserProfile(username) {
  return "/@" + username;
}

export function getUserImageOrDefault(user) {
  if (user && user.image) {
    return user.image;
  }

  return "https://static.productionready.io/images/smiley-cyrus.jpg";
}
