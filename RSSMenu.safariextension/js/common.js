/** Injected Script for Safari RSS Feed Extension **/
/** © 2012-13 Calum Benson                        **/
/** Licence: None - public domain                 **/    

var debug=true;
function clog(level, msg){
	
	var msg = "RSSMenu:"+arguments.callee.caller.name+"() "+msg;
	
	if (debug){
		switch (level){ 
			case 'l': console.log(msg); break;
			case 'd': console.debug(msg); break;
			case 'w': console.warn(msg); break;
			default: console.log(msg); break;
		}
	}
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
