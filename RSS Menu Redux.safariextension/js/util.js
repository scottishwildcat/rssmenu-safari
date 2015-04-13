/********************************************/
/* RSS Menu Extension - utility functions   */
/* (c) Calum Benson 2013,2014,2015          */
/********************************************/

const TOOLBAR_BUTTON_ID = 'rssButton';
const TOOLBAR_MENU_ID = 'rssButtonMenu';
const EXTENSION_URI = 'com.scottishwildcat.feedmenu2';
const MENU_ID_PREFIX = "menu-";


/**********************/
/* Utility functions  */
/**********************/

const DEBUG=true;

function clog(level, msg){
	// If debug=true, log msg of given level to console. 
	// Message is preceded by the calling function name.
	// Level = l(og), d(ebug), w(arn) or e(rror).
	
	if (window.console){
		const msg = "RSSMenu:"+arguments.callee.caller.name+"() "+msg;
		
		if (DEBUG){
			switch (level){ 
				case 'l': console.log(msg); break;
				case 'd': console.debug(msg); break;
				case 'w': console.warn(msg); break;
				case 'e': console.error(msg); break;
				default: console.log(msg); break;
			}
		}
	}
}

function isTopLevel(){
	// Return true if called from top level window, false from iframe or other sub-window.
	return (window.top === window);
}

function partUrl(url){
	// Returns an object containing various parts of the url.
	// If url = http://blogs.blah.com/en/index.html, then:
	//
	// u.basedir = http://blogs.blah.com/en/ (including trailing slash)
	// u.root = http://blogs.blah.com (no trailing slash)
	
	var u = {};
	u.basedir = url.substr(0, url.lastIndexOf('/')+1);
	u.root = url.split('://')[0]+'://' + url.split('://')[1].split('/')[0];
	return u;
}

function absoluteUrl(url){
	// Returns the absolute path of a url, e.g.:
	// http://toplevel.com/en/../ie/./doc.html -> http://toplevel.com/ie/doc.html
	// Uses the handy DOM trick found at:
	// http://stackoverflow.com/questions/3943281/resolving-relative-urls-in-javascript
	
	var a=$('<a>').attr('href',url);
	return a[0].href;
}

function protocol(uri){
	//Return the protocol of given URI (http, https, feed, etc.)
	return uri.split(':')[0]
}

function canonize(url){
	//Return the canonical version of a feed url, namely
	// http://domain/path/feed.xml -> feed://domain/path/feed.xml
	// https://domain/path/feed.xml -> feed:https://domain/path/feed.xml
	
	if (protocol(url) === "http"){
		return url.replace(/^http/,'feed');
	}
	else if (protocol(url) === "https"){
		return "feed:"+url;
	}	
	return url;
}