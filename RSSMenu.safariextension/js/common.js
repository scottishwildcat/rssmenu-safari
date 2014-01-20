/** Injected Script for Safari RSS Feed Extension **/
/** © 2012-14 Calum Benson                        **/
/** Licence: None - public domain                 **/    

var debug=true;
function clog(level, msg){
	
	const msg = "RSSMenu:"+arguments.callee.caller.name+"() "+msg;
	
	if (debug){
		switch (level){ 
			case 'l': console.log(msg); break;
			case 'd': console.debug(msg); break;
			case 'w': console.warn(msg); break;
			default: console.log(msg); break;
		}
	}
}

function isTopLevel(){
	return (window.top === window);
}

function protocol(url){
	// Return the URI protocol of the given url, up to but not including the colon.
	// Likely return values are 'http', 'https', 'feed'.
	return url.split(':')[0];
}

function httpToFeed(url){
	// Convert given http or https URL to canonical feed format.
	// If URL is in a different format, return it unchanged.

	if (protocol(url) == "http")
		return url.replace(/^http/,'feed');
		
	if (protocol(url) == "https")
		return "feed:"+url;
		
	return url;
}

function selectText(element) {
	// Change text selection to the contents of the element with given id.
    var doc = document;
    var text = doc.getElementById(element);    

    if (doc.body.createTextRange) { // ms
        var range = doc.body.createTextRange();
        range.moveToElementText(text);
        range.select();
    } else if (window.getSelection) { // moz, opera, webkit
        var selection = window.getSelection();            
        var range = doc.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}
