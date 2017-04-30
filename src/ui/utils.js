var domain = require('./../domain');


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


module.exports = {
	updateDocumentTitle: updateDocumentTitle,
	formatDate: formatDate,
	convertMarkdownToHTML: convertMarkdownToHTML
};
