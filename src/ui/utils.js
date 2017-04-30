var domain = require('./../domain');


function updateDocumentTitle(text) {
	document.title = text + ' — ' + domain.store.appTitle;
}


module.exports = {
	updateDocumentTitle: updateDocumentTitle
};
