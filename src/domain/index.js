'use strict';


var m = require('mithril');


var state = {
  appTitle: 'Conduit',
  selectedArticles: {
    isLoading: false,
    list: null,
    author: '',
    favorited: '',
    limit: 10,
    offset: 0,
    total: 0,
    type: {
      name: 'GLOBAL',
      label: 'Global Feed'
    },
  },
  articleListTypes: {
    GLOBAL: {
      name: 'GLOBAL',
      label: 'Global Feed'
    },
    USER_FAVORITED: {
      name: 'USER_FAVORITED',
      label: 'Your Feed'
    },
    USER_OWNED: {
      name: 'USER_OWNED',
      label: 'My Articles'
    }
  },
  articlesByTag: {},
  tags: {},
  selectedArticle: {
    data: null,
    isLoading: false
  },
  selectedArticleComments: {
    data: null,
    isLoading: false
  },
  isArticleCommentCreationBusy: false,
  userAuthorizationToken: null,
  isUserLoginBusy: false,
  userLoginErrors: null,
  isUserRegistrationBusy: false,
  userRegistrationErrors: null,
  isUserSettingsUpdateBusy: false,
  userUpdateSettingsErrors: null,
  isCreateArticleBusy: false,
  createArticleErrors: null,
  isDeleteArticleBusy: false,
  user: null,
  selectedUserProfile: {
    data: null,
    isLoading: false
  }
};


var API_BASE_URI = '//conduit.productionready.io/api';


function init() {
  actions.getLoggedInUser(window.localStorage.getItem('jwt'));
}


function getErrorMessageFromAPIErrorObject(e) {
  var response = null;

  try {
    response = JSON.parse(e.message).errors;
  } catch (error) {
    response = {
      'An unhandled error occurred': []
    };
  }

  return response;
}


function redirectToPreviousPageOrHome() {
  if (window.history.length > 0) {
    window.history.back();
  } else {
    m.route.set('/');
  }
}


function getArticles(payload) {
	/*
	TODO

	Filter by author:

	?author=jake

	Favorited by user:

	?favorited=jake

	Limit number of articles (default is 20):

	?limit=20

	Offset/skip number of articles (default is 0):

	?offset=0
	*/

  // if (!payload) {
  // 	payload = {
  // 		limit: 3
  // 	};
  // }

  var queryString = m.buildQueryString(payload);

  return m.request({
    method: 'GET',
    url: API_BASE_URI + '/articles?' + queryString
  })
    .then(function (response) {
      // return []; // Test empty response
      return response;
    });
}


function isValueNullOrUndefined(value) {
  return (value === null) || typeof value === 'undefined';
}


function getValueFromSuppliedOrOther(supplied, other) {
  return !isValueNullOrUndefined(supplied) ? supplied : other;
}


function setupSelectedArticlesStateForRequest(payload, selectedArticles) {
  var selectedArticles = {
    isLoading: true,
    list: null,
    total: 0,
    type: getValueFromSuppliedOrOther(payload.type, state.articleListTypes.type),
    limit: getValueFromSuppliedOrOther(payload.limit, state.articleListTypes.limit),
    offset: getValueFromSuppliedOrOther(payload.offset, state.articleListTypes.offset),
    author: getValueFromSuppliedOrOther(payload.author, state.articleListTypes.author),
    favorited: getValueFromSuppliedOrOther(payload.favorited, state.articleListTypes.favorited)
  };

  return selectedArticles;
}



var actions = {

  setCurrentlyActiveArticles: function (payload) {
    var request = {};
    payload = payload || {};

    state.selectedArticles = setupSelectedArticlesStateForRequest(payload);

    request.limit = state.selectedArticles.limit;
    request.offset = state.selectedArticles.offset;
    request.author = state.selectedArticles.author;
    request.favorited = state.selectedArticles.favorited;

    console.info('domain.setCurrentlyActiveArticles()', payload, request);

    return getArticles(request)
      .then(function (response) {
        state.selectedArticles.list = response.articles;
        state.selectedArticles.total = response.articlesCount;
        state.selectedArticles.isLoading = false;
      });
  },


  getArticlesByTag: function (tag) {
    return getArticles({ tag: tag })
      .then(function (response) {
        state.articlesByTag.tag = tag;
        state.articlesByTag.list = response.articles;
      });
  },


  setSelectedArticle: function (slug) {
    state.selectedArticle.data = null;
    state.selectedArticle.isLoading = true;

    return m.request({
      method: 'GET',
      url: API_BASE_URI + '/articles/' + slug
    })
      .then(function (response) {
        state.selectedArticle.data = response.article;
      })
      .then(function () {
        state.selectedArticle.isLoading = false;
      });
  },


  setSelectedArticleComments: function (slug) {
    state.selectedArticleComments.data = null;
    state.selectedArticleComments.isLoading = true;

    return m.request({
      method: 'GET',
      url: API_BASE_URI + '/articles/' + slug + '/comments'
    })
      .then(function (response) {
        state.selectedArticleComments.data = response.comments;
      })
      .then(function () {
        state.selectedArticleComments.isLoading = true;
      });
  },


  createArticle: function (payload) {
    state.isCreateArticleBusy = true;
    state.createArticleErrors = null;

    // Format tagList before sending to API
    var tagList = payload.tagList
      .split(',')
      .join('-|-')
      .split(' ')
      .join('-|-')
      .split('-|-')
      .filter(function (tag) {
        return tag !== '';
      });

    m.request({
      method: 'POST',
      url: API_BASE_URI + '/articles',
      headers: {
        'Authorization': 'Token ' + state.user.token
      },
      data: {
        article: {
          title: payload.title,
          description: payload.description,
          body: payload.body,
          tagList: tagList
        }
      }
    })
      .then(function (response) {
        state.createArticleErrors = null;
        state.newArticle = response.article;
        m.route.set('/article/' + state.newArticle.slug);
      })
      .catch(function (e) {
        state.createArticleErrors = getErrorMessageFromAPIErrorObject(e);
      })
      .then(function () {
        state.isCreateArticleBusy = false;
      });
  },


  deleteArticle: function (slug) {
    state.isDeleteArticleBusy = true;
    m.redraw(); // This shouldn't be necessary

    m.request({
      method: 'DELETE',
      url: API_BASE_URI + '/articles/' + slug,
      headers: {
        'Authorization': 'Token ' + state.user.token
      }
    })
      .then(function (response) {
        console.info(response);
        state.isDeleteArticleBusy = false;
        // if (response) {
        redirectToPreviousPageOrHome();
        // }
      })
      .catch(function (e) {
        state.isDeleteArticleBusy = false;
        console.warn(getErrorMessageFromAPIErrorObject(e));
      });
  },


  createArticleComment: function (payload) {
    state.isArticleCommentCreationBusy = true;

    m.request({
      method: 'POST',
      url: API_BASE_URI + '/articles/' + payload.articleSlug + '/comments',
      headers: {
        'Authorization': 'Token ' + state.user.token
      },
      data: {
        comment: {
          body: payload.body
        }
      }
    })
      .then(function () {
        state.isArticleCommentCreationBusy = false;
      })
      .then(function () {
        actions.setSelectedArticleComments(payload.articleSlug);
      });
  },


  goToArticleEditScreen: function (articleSlug) {
    m.route.set('/editor/' + articleSlug);
  },


  registerNewUser: function (payload) {
    state.isUserRegistrationBusy = true;
    state.userRegistrationErrors = null;

    m.request({
      method: 'POST',
      url: API_BASE_URI + '/users',
      data: {
        user: {
          email: payload.email,
          password: payload.password,
          username: payload.username
        }
      }
    })
      .then(function (response) {
        state.userRegistrationErrors = null;
        state.user = response.user;
        window.localStorage.setItem('jwt', state.user.token);
      })
      .catch(function (e) {
        state.userRegistrationErrors = getErrorMessageFromAPIErrorObject(e);
      })
      .then(function () {
        state.isUserRegistrationBusy = false;
      });
  },


  attemptUserLogin: function (email, password) {
    window.localStorage.setItem('jwt', null);
    state.user = null;
    state.isUserLoginBusy = true;
    state.userLoginErrors = null;

    m.request({
      method: 'POST',
      url: API_BASE_URI + '/users/login',
      data: {
        user: {
          email: email,
          password: password
        }
      }
    })
      .then(function (response) {
        state.userLoginErrors = null;
        state.user = response.user;
        window.localStorage.setItem('jwt', state.user.token);
      })
      .catch(function (e) {
        state.userLoginErrors = getErrorMessageFromAPIErrorObject(e);
      })
      .then(function () {
        state.isUserLoginBusy = false;
      });
  },


  redirectAfterUserLoginSuccess: function () {
    redirectToPreviousPageOrHome();
  },


  redirectAfterUserRegistrationSuccess: function () {
    redirectToPreviousPageOrHome();
  },


  getLoggedInUser: function (token) {
    var userToken = state.user ? state.user.token : '';

    if (token) {
      userToken = token;
    }

    m.request({
      method: 'GET',
      url: API_BASE_URI + '/user',
      headers: {
        'Authorization': 'Token ' + userToken
      }
    })
      .then(function (response) {
        state.user = response.user;
      })
      .catch(function (e) {
        console.warn('domain.getLoggedInUser()', e, getErrorMessageFromAPIErrorObject(e));
      });
  },


  updateUserSettings: function (payload) {
    state.isUserSettingsUpdateBusy = true;
    state.userUpdateSettingsErrors = null;

    if (!payload.password) {
      delete payload.password;
    }

    m.request({
      method: 'PUT',
      url: API_BASE_URI + '/user',
      headers: {
        'Authorization': 'Token ' + state.user.token
      },
      data: {
        user: payload
      }
    })
      .then(function (response) {
        state.user = response.user;
      })
      .catch(function (e) {
        state.userUpdateSettingsErrors = getErrorMessageFromAPIErrorObject(e);
      })
      .then(function () {
        state.isUserSettingsUpdateBusy = false;
      });
  },


  getUserProfile: function (username) {
    state.selectedUserProfile.isLoading = true;
    state.selectedUserProfile.data = null;

    m.request({
      method: 'GET',
      url: API_BASE_URI + '/profiles/' + username
    })
      .then(function (response) {
        state.selectedUserProfile.data = response.profile;
      })
      .then(function () {
        state.selectedUserProfile.isLoading = false;
      });
  },


  followUser: function (username) {
    return alert('followUser() -> ' + username);
    m.request({
      method: 'POST',
      url: API_BASE_URI + '/profiles/' + username + '/follow',
      headers: {
        'Authorization': 'Token ' + state.user.token
      },
    })
      .then(function () {
        // TODO
      });
  },


  unfollowUser: function (username) {
    return alert('unfollowUser() -> ' + username);
    m.request({
      method: 'DELETE',
      url: API_BASE_URI + '/profiles/' + username + '/follow',
      headers: {
        'Authorization': 'Token ' + state.user.token
      },
    })
      .then(function () {
        // TODO
      });
  },


  logUserOut: function () {
    state.user = null;
    window.localStorage.setItem('jwt', null);
    m.route.set('/');
  },


  getTags: function () {
    state.tags.isLoading = true;

    m.request({
      method: 'GET',
      url: API_BASE_URI + '/tags',
    })
      .then(function (response) {
        state.tags.list = response.tags;
      })
      .then(function () {
        state.tags.isLoading = false;
      });
  }

};


module.exports = {
  init: init,
  store: state,
  actions: actions
};
