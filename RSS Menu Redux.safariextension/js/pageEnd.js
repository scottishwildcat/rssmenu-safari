/********************************************/
/* RSS Menu Extension - injected end script */
/* (c) Calum Benson 2013, 2014, 2015        */
/********************************************/

if (isTopLevel()){
	safari.self.addEventListener("message", messageListener, false); // Listen for events sent by global.html


	// TODO: Add a page closing script that fires a message to global.html to delete 
	// it from the cache? Navigate event doesn't seem to fire when typing a new URL or
	// selecting a bookmark, only when using the back/next buttons.
	
	var defaultStylesheet="custom.css";
	if (navigator.userAgent.indexOf("Mac OS X 10_10") < 0){
		defaultStylesheet = "10.9.css";
	}
	else {
		defaultStylesheet = "10.10.css";
	}
	var defaultStylesheetHref = safari.extension.baseURI+"css/popup-"+defaultStylesheet;
	
	$("<link/>", {
	   rel: "stylesheet",
	   type: "text/css",
	   href: defaultStylesheetHref,
	}).appendTo("head");

	findFeedsOnPage();
}

function xFrameOptions(url){
	// Attempt to discover value of url's 'X-Frame-Options' header. Possible values from the server are:
	//
	// 'DENY': The url cannot be displayed in a frame on any page.
	// 'SAMEORIGIN': The url can only be displayed in a frame on page from matching origin.
	// 'ALLOW-FROM <uri>': The url can only be displayed in a frame on a page from specified origin.
	//
	// In addition to those, function may return:
	// 'NOTSET': the X-Frame-Options header is not set for the given URL.
	// '404': the URL was not found
	// 'DIFFORIGIN' : the URL was inaccessible, likely due to different host, protocol or port

	var option = 'DENY';
	
	var xhr = $.ajax({
		type:"HEAD",
		url: url,
		async: false,
		timeout: 2000, //ms
				
		success: function(data, textStatus, jqXHR){
			option=jqXHR.getResponseHeader("X-Frame-Options");
			if (option===null){
				option="NOTSET";
			}
		},
		
		error: function(jqXHR, textStatus, errorThrown){
			switch (jqXHR.status) {
				case 0: 
					option='DIFFORIGIN'; // (Probably)
					break;
				case 404: 
					option='404';
					break;
				default: 
					option='DENY';
					break;
			}
		}	
	});

	return option.toUpperCase();
}
		
function messageListener(event){
	//Handle messages sent by global.html
	switch (event.name){
		case "showPopup": 
		
			var popup = $('#rssmenu-popup');
			if (isTopLevel()){
				if (popup !== []){
					popup.remove();
				}
				
				popup = $("<div>").addClass('rssmenu-popup').attr('id','rssmenu-popup');
				popup.append($("<div>").addClass('rssmenu-icon'));

				var popupContent = '<div class="rssmenu-url"><a id="select-url" href="{{href}}">{{href}}</a></div> \
					<div class="rssmenu-action"> \
						<div class="rssmenu-pushbuttons"> \
							<div class="rssmenu-button" id="appBtn">{{appbtn}}</div> \
							<div class="rssmenu-button" id="browserBtn">{{browserbtn}}</div> \
						</div> \
						<div class="rssmenu-closebtn" id="closeBtn"></div> \
					</div> \
				';

				var content ={};
				content.href=event.message.uri;
				content.appbtn="Open In Application";
				content.browserbtn="Open in Safari";
				
				popup.append(Mark.up(popupContent, content));
				
				$('body').prepend(popup);
				$("#rssmenu-popup").show();
			}
			break;

		default:
			clog('d','Unknown message from global.html: '+event.name);
			break;
	}
}

function findFeedsOnPage(){
	// Look for feeds identified in <head> per the RSS autodiscovery spec:
	// http://www.rssboard.org/rss-autodiscovery
	
	var foundFeeds = [];
	var f = {};
	
	$('link[rel="alternate"][type*="xml"]','head').each(function(index, link){
		var href = $(link).attr('href');
		var title = $(link).attr('title');
		var format = $(link).attr('type');
		
		if (href[0]==='/'){
			// Specified link is relative to base document root
			href = partUrl(document.baseURI).root + href;
		}
		
		if (href[0]==='..' || href.indexOf('://')===-1){
			// Specified link is relative to base document directory
			href = partUrl(document.baseURI).basedir + href;
		}
		
		if (title===undefined){
			// TODO: Pick title based on feed type
			title="Unnamed Feed"
		}
		
		f = new Feed(href, title, format, GROUP_NONE);
		foundFeeds.push(f);
		
	});
	
	//TODO: Only send message if foundFeeds != {} ?
	safari.self.tab.dispatchMessage("foundFeeds", {tabUrl:document.URL, feeds:foundFeeds});
}