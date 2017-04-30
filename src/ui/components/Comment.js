var m = require('mithril');


var utils = require('./../utils');
var Link = require('./Link');


function view(vnode) {
	var comment = vnode.attrs.comment;

	return m('div.card', [
		m('div.card-block',
			m('p.card-text', comment.body)
		),
		m('div.card-footer', [
			m(Link, { className: 'comment-author', to: utils.getLinkToUserProfile(comment.author.username) },
				m('img.comment-author-img', { src: comment.author.image })
			),
			m('span', m.trust('&nbsp; ')),
			m(Link, { className: 'comment-author', to: utils.getLinkToUserProfile(comment.author.username) },
				comment.author.username
			),
			m('span.date-posted', utils.formatDate(comment.createdAt))
		])

		/*
		<div class="card-footer">
			<a class="comment-author" ui-sref="app.profile.main({ username: $ctrl.data.author.username })" href="#/@thingybingy">
			  <img ng-src="https://static.productionready.io/images/smiley-cyrus.jpg" class="comment-author-img" src="https://static.productionready.io/images/smiley-cyrus.jpg">
			</a>
			&nbsp;
			<a class="comment-author ng-binding" ui-sref="app.profile.main({ username: $ctrl.data.author.username })" ng-bind="::$ctrl.data.author.username" href="#/@thingybingy">thingybingy</a>
			<span class="date-posted ng-binding" ng-bind="::$ctrl.data.createdAt | date: 'longDate' ">April 26, 2017</span>
			<span class="mod-options ng-hide" ng-show="$ctrl.canModify">
			  <i class="ion-trash-a" ng-click="$ctrl.deleteCb()"></i>
			</span>
		  </div>
		*/
	]);
};


module.exports = {
	view: view
};
