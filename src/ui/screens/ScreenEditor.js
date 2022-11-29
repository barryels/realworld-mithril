import m from "mithril";

import domain from "./../../domain";
import utils from "./../utils";
import NewArticleForm from "./../components/NewArticleForm";
import ListErrors from "./../components/ListErrors";

function oninit() {
  utils.updateDocumentTitle("Editor");
}

function view() {
  return m(".container.page", [
    m(".row", [
      m(".col-md-10.offset-md-1.col-xs-12", [
        m(ListErrors, { errors: domain.store.createArticleErrors }),
        m(NewArticleForm, {
          isSubmitBusy: domain.store.isCreateArticleBusy,
          fn_submit: domain.actions.createArticle,
        }),
      ]),
    ]),
  ]);
}

export default {
  oninit,
  view,
};
