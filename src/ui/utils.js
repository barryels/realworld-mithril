var domain = require('./../domain');


var xssFilters = require('xss-filters');


function getMonthName(index, language, type) {
	var _language = language ? language.toLowerCase() : 'en';
	var _type = type ? type.toLowerCase() : 'long';
	var monthNames = {
		en: {
			long: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
		}
	};

	return monthNames[_language][_type][index];
}


function updateDocumentTitle(text) {
	document.title = text + ' — ' + domain.store.appTitle;
}


function formatDate(date) {
	// Could use Date.toLocaleString() in future, but currently mobile support is terrible

	try {
		var dateObject = new Date(date);
		return getMonthName(dateObject.getMonth()) + ' ' + dateObject.getDate() + ', ' + dateObject.getFullYear();
	} catch (e) {
		return date;
	}
}


function convertMarkdownToHTML(content) {
	var marked = require('marked');

	return marked(content);
}


function formatArticleCommentBodyText(content) {
	return convertMarkdownToHTML(xssFilters.inHTMLData(content));
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
	formatDate: formatDate,
	formatArticleCommentBodyText: formatArticleCommentBodyText,
	convertMarkdownToHTML: convertMarkdownToHTML,
	getLinkToUserProfile: getLinkToUserProfile,
	getUserImageOrDefault: getUserImageOrDefault
};
