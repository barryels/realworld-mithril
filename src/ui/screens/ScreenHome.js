import m from "mithril";

import domain from "./../../domain";
import { updateDocumentTitle } from "./../utils";
import Banner from "./../components/Banner";
import ArticleList from "./../components/ArticleList";
// import FeedToggle from "./../components/FeedToggle";
import PopularTagList from "./../components/PopularTagList";

function onTagItemClick(tag) {
  domain.actions.getArticlesByTag(tag);
}

function oninit() {
  updateDocumentTitle("Home");
  domain.actions.getTags();
}

function view() {
  var banner = m(Banner);

  if (domain.store.user) {
    banner = null;
  }

  return m("div.home-page", [
    banner,
    m(".container.page", [
      m(".row", [
        m(".col-md-9", [
          // m(FeedToggle, {
          //   currentType: domain.store.selectedArticles.type,
          //   username: domain.store.user ? domain.store.user.username : "",
          //   linkTypes: [
          //     domain.store.articleListTypes.USER_FAVORITED,
          //     domain.store.articleListTypes.GLOBAL,
          //     domain.store.articleListTypes.USER_OWNED,
          //   ],
          // }),
          m(ArticleList, { limit: 10 }),
        ]),
        m(".col-md-3", [
          m(
            ".sidebar",
            m(PopularTagList, {
              fn_onTagItemClick: onTagItemClick,
              isLoading: domain.store.tags.isLoading,
              list: domain.store.tags.list,
            })
          ),
        ]),
      ]),
    ]),
  ]);
}

export default { oninit, view };
