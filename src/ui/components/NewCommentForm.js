var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var ListErrors = require('./ListErrors');


function view() {
	var currentUser = domain.store.user || {
		image: ''
	};

	return m('div', [
		m(ListErrors, { errors: domain.store.newCommentSubmissionErrors }),
		m('form.card comment-form',
			m('div.card-block',
				'FORM'
			),
			m('div.card-footer', [
				m('img.comment-author-img', { src: utils.getUserImageOrDefault(currentUser) })
			])
		)
	]);
};


module.exports = {
	view: view
};
