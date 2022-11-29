import m from "mithril";

import domain from "./../../domain";
import { updateDocumentTitle } from "./../utils";
import Banner from "./../components/Banner";
import ArticleBanner from "./../components/ArticleBanner";
import ArticleContent from "./../components/ArticleContent";
import ArticleMetaAndActions from "./../components/ArticleMetaAndActions";
import Comments from "./../components/Comments";

var state = {
  slug: "",
};

function getArticle() {
  state.slug = m.route.param("slug");
  domain.actions.setSelectedArticle(state.slug);
  domain.actions.setSelectedArticleComments(state.slug);
  document.body.scrollTop = 0;
}

function oninit() {
  getArticle();
}

function onbeforeupdate() {
  if (state.slug !== m.route.param("slug")) {
    getArticle();
  }

  return true;
}

function onupdate() {
  if (domain.store.selectedArticle.data) {
    updateDocumentTitle(domain.store.selectedArticle.data.title);
  }
}

function view() {
  return m("div.article-page", [
    m(Banner, m(ArticleBanner, { article: domain.store.selectedArticle })),
    m("div.container", [
      m("div.row", [
        m(ArticleContent, { article: domain.store.selectedArticle }),
      ]),
      m("hr"),
      m("div.article-actions", [
        m(ArticleMetaAndActions, { article: domain.store.selectedArticle }),
      ]),
      m(
        "div.row",
        m(
          "div.col-xs-12.col-md-8.offset-md-2",
          m(Comments, {
            comments: domain.store.selectedArticleComments,
            currentUser: domain.store.user,
          })
        )
      ),
    ]),
  ]);
}

module.exports = {
  oninit: oninit,
  onbeforeupdate: onbeforeupdate,
  onupdate: onupdate,
  view: view,
};
