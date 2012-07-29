/** End Script for Safari RSS Feed Extension **/
/** © 2012 Calum Benson                      **/
/** Licence: None - public domain            **/      

//"use strict";

var uri_scheme = 'feed';
safari.self.tab.dispatchMessage("getExtensionSetting", "uri_scheme");

safari.self.addEventListener("message", msgHandler, false); // Listen for events sent by global.html

findFeedsOnPage(); // Run when any page has finished loading


/*
 * Helper functions
 */

function openFeedInApp(url){
	// We open a feed in the default app by adding an invisible iframe to the page
	// whose src is the feed URL.
	
	var appiframe = document.getElementById('appiframe');		
	if (appiframe === null){
		// We haven't already created the iframe for this page, so do it now.
		appiframe = document.createElement('IFRAME');
		appiframe.width = 0+'px';
		appiframe.height = 0+'px';
		appiframe.setAttribute('id','appiframe');
		document.body.appendChild(appiframe);
	}	
	
	var uri_menu = document.getElementById("uri");	
	if (uri_menu != null){
		// Protocol switcher menu is visible, so use its value
		if (uri_menu.options[uri_menu.selectedIndex].value == "feed"){
			url="feed:"+url;
		}
	}
	else{
		// Protocol switcher menu not visible, use the global preference value
		if (uri_scheme == "feed"){
			url="feed:"+url;
		}
	}
	
	appiframe.src = url;
}

function splitUrl(url){
// Return the protocol and pathname of the given URI, which is
// expected to be an http, https or feed URI.
	var split = new Object();
	
	//TODO: Horrid bit of code, clean it up later.
	var uri_type = url.substr(0,5);
	
	if (uri_type == "http:" || uri_type == "feed:") {
		split.protocol = url.substr(0,4); 
		split.pathname = url.substr(7);
	}
	
	if (uri_type == "https") {
		split.protocol="https"; 
		split.pathname = url.substr(8);
	}
	
	return split;
}

function openFeedInReader(url){
	// Pass feed url to Google Reader in a new tab/window (according to browser prefs).
	window.open('http://www.google.com/reader/view/feed/'+encodeURIComponent(url), '_blank');
}

function showPopup (url,content, allowSwitch){
	// Show a popup banner at the top of the web page.
	// url = the url of the RSS feed for which the banner is being shown.
	// content = action buttons or 'loading in default app' message, depending on current preferences.
	// allowSwitch = true if protocol switch menu should be shown, false if not

	var popup = document.getElementById('rssmenu-popup'); // Will be 'null' if no existing popup being shown.
		
	if (window.top === window) {
		// Don't show the popup in any iframes on the page
		
		if (popup !== null){
			// If there's already a popup, hide it now.
			// TODO: Should really kill any existing hide timeout associated with it as well.
			popup.parentElement.removeChild(popup);
		}

		var surl = splitUrl(url);
		
		// Create popup container		
		popup = document.createElement('div');
		popup.className = 'rssmenu-popup';
		popup.setAttribute('id','rssmenu-popup');
		popup.style.opacity = '0';
		
		// Create URL area
		var rssmenu_url = document.createElement('div');
		rssmenu_url.setAttribute('id','rssmenu-url');
		rssmenu_url.className = 'rssmenu-url';

		// Create action area, content passed in as function param
		var rssmenu_action = document.createElement('div');
		rssmenu_action.className = 'rssmenu-action';
		rssmenu_action.innerHTML = content;

		// Create RSS icon
		var rss_img = document.createElement('img');
		rss_img.src = safari.extension.baseURI +"rss-color.png";
		
		// Create clickable URL, passed in as function param
		var rssmenu_feedurl = document.createElement('a');
		rssmenu_feedurl.setAttribute('id','clickable_url');
		rssmenu_feedurl.href = url;
		rssmenu_feedurl.innerHTML = (allowSwitch === false ? uri_scheme+"://" : '') + surl.pathname;
		
		// Put it all together in the right order...
		document.body.insertBefore(popup, document.body.firstChild); // Popup
		popup.insertBefore(rssmenu_action, null); // Action area
		popup.insertBefore(rssmenu_url, rssmenu_action); // URL area
		rssmenu_url.insertBefore(rssmenu_feedurl, null); // Clickable URL
		rssmenu_url.insertBefore(rss_img, rssmenu_feedurl); // RSS icon

		if (allowSwitch === true){
			// Create http/feed selector menu
			var uri_menu = document.createElement('select');
			uri_menu.setAttribute('id','uri');
			uri_menu.innerHTML  ='<option value="feed">feed://</option>';
			uri_menu.innerHTML +='<option value="http">'+surl.protocol+'://</option>';
			uri_menu.selectedIndex = (uri_scheme == "feed" ? 0 : 1);
			rssmenu_url.insertBefore(uri_menu, document.getElementById('clickable_url'));
		}
				
		// Make the popup fade in. If we don't wrap the opacity change in a timeout, the fade 
		// doesn't happen...
		setTimeout(function(){popup.style.opacity='1';},0);
	}
	return popup;
}

function closePopup(){
	// Close the popup that's used to 'always ask' or indicate 'now loading in default app'.
	var popup = document.getElementById('rssmenu-popup');
	
	if (popup !== null){
		// If we don't wrap the opacity change in a timeout, the fade transition
		// doesn't happen...
		setTimeout(function(){popup.style.opacity='0';},0);
		
		// Don't remove the div immediately, or it will cut the fadeout short
		setTimeout(function(){popup.parentElement.removeChild(popup);},1000);
	}
}

function msgHandler(event){
	// Messages we currently expect from the global page are:
	// "showFeedPopup": menu item selected, show popup banner.
	// "feedActionChanged": user changed default action setting.
	var url = event.message[0]; // URL of feed to view
	var action = event.message[1];
	var timeout = event.message[2]; // Timeout (ms) before "adding feed" message disappears
	var popupContent = "";
	
	if (event.name == "showFeedPopup"){
								
		if (action == 'defaultapp'){
		
			// Use popup to show a transient message that the feed will load in
			// the default app shortly, but it can take a few moments.
			popupContent += "<span class='loadmsg'>Opening feed in your newsreader app ";
			popupContent += "<img id='spinner' src='"+safari.extension.baseURI+"progress_wheel.gif'></span>";
			
			var popup = showPopup(url,popupContent, false);
			if (popup !== null)
				setTimeout(closePopup, timeout);

			openFeedInApp(url);
		}
		
		else if (action == 'alwaysask'){
			
			var buttons = document.createElement('div');
			
			var createButton = function(i,t){
				var b = document.createElement('div');
				b.setAttribute('class','rssmenu-button');
				b.setAttribute('id',i);
				b.innerText=t;
				buttons.insertBefore(b,null); // null = insert as last child of popup 
			}
						
			// Show three buttons in the popup -- Google Reader, Application, and Cancel.
			createButton('googleBtn','Google Reader');
			createButton('appBtn', 'Application');
			createButton('closeBtn', 'Cancel');
						
			showPopup(url, buttons.innerHTML, true);
			
			// Not sure why the onclicks can't be set until this point, but here we go…			
			document.getElementById('googleBtn').onclick = function(){openFeedInReader(url);closePopup();};
			document.getElementById('appBtn').onclick = function(){openFeedInApp(url);closePopup();};
			document.getElementById('closeBtn').onclick = function(){closePopup();};
		}
	}
	
	if (event.name == "feedActionChanged"){
	// User changed default action in preferences, so hide the popup banner 
	// (if currently shown) to avoid confusion.
		closePopup();
	}
	
	if (event.name === "uriSchemeChanged" || event.name === "uriSchemeValue"){
	// Got uri_scheme setting from global page on page load, or user changed
	// uri_scheme preference.
		uri_scheme = event.message;
		var m = document.getElementById('uri');
		if (m!==null){
			var n = (event.message === "feed" ? 0 : 1);
			m.selectedIndex = n;
		}
		console.log("URI scheme = "+event.message);
	}
}

function findFeedsOnPage(){
	// A feed is a node in the document <head> that looks like:
	// <link rel="alternate" type="application/rss+xml" title="RSS feed" href="http://blah.com/rss/feed.xml">
	// where type may also be application/atom+xml or text/xml.

	if (window.top === window) {
	// The parent frame is the top-level frame, not an iframe, so we can go ahead and check here.
			
		var foundFeeds = [];
		var c, t, title, href;
	
		var docHead = document.getElementsByTagName('head')[0];
			
		// Store all found feeds in an array: [[name,url],[name,url],...]
		for (var i=0; i < docHead.childElementCount; i++){
			
			c = docHead.children[i];
			
			//TODO: This detection code is really clunky… clean it up later.	
			if (c.nodeName == "LINK"){
				
				if (c.attributes.getNamedItem("rel")!==null && 
					c.attributes.getNamedItem("rel").value == "alternate"){
					
					t = c.attributes.getNamedItem("type").value;
				
					if (t == "application/rss+xml" || 
						t == "application/atom+xml" ||
						t == "text/xml"){
						
						title = c.attributes.getNamedItem("title");
						
						if (title !== null){
							title = title.value;
						}
						else{
							if (t.indexOf("rss")!=-1)
								title = "RSS Feed";
							else if (t.indexOf("atom")!=-1)
								title = "Atom Feed";
							else
								title = 'Untitled Feed';
						}

						href = c.attributes.getNamedItem("href").value;						
						if (href[0]=='/'){
							// Specified link is relative, construct the full URI
							href = 'http://' + document.domain + href;
						}
						
						// Only add feed if href isn't undefined
						if (href)
							foundFeeds.push([title, href]);
					}
				}
			}
		}
		safari.self.tab.dispatchMessage("foundFeeds",foundFeeds);
	}
}