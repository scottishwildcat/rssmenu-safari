/** End Script for Safari RSS Feed Extension **/
/** © 2012-13 Calum Benson                   **/
/** Licence: None - public domain            **/      

//"use strict";

function isTopLevel(){
	return (window.top === window);
}

if (isTopLevel()){
	safari.self.addEventListener("message", msgHandler, false); // Listen for events sent by global.html
	findFeedsOnPage(); // Run when any page or iframe on that page has finished loading
}

function XFrameOptions(url){
	// Return true if specified URL is allowed to be displayed in an iframe,
	// false if its http headers specify 'X-Frame-Options: deny'.
	
	try {
		var xhr = new XMLHttpRequest();
		xhr.open("HEAD", url, false); // false = synchronous
		xhr.send(null);
	}
	catch(e){
		//TODO: Assumes failure is due to cross-domain request, so returns "deny"
		//to open the feed in a tab instead -- may not be the case.
		clog('d',e.message);
		return "deny";
	}

	if (xhr.status === 200){
		return xhr.getResponseHeader("X-Frame-Options"); // Poss. values: 'deny' or 'sameorigin'
	}
	else
		return "deny"; // We couldn't access the http header, so assume the worst
	}

function openFeedInApp(url){
	// We open a feed in the default app by adding an invisible iframe to the page
	// whose src is the feed URL.
	
	clog('d',url);
	
	if (XFrameOptions(url) != "deny"){
		var appiframe = document.getElementById('appiframe');		
		if (appiframe === null){
			// We haven't already created the iframe for this page, so do it now.
			appiframe = document.createElement('IFRAME');
			appiframe.style.width = 0+'px';
			appiframe.style.height = 0+'px';
			appiframe.setAttribute('id','appiframe');
			document.body.appendChild(appiframe);
			clog('l',"Appended hidden iframe to page");
		}
		url = httpToFeed(url);
		appiframe.src = url;
	}
	else{
		clog('w',"iFrame denied, opening in tab");
		safari.self.tab.dispatchMessage("openFeedInTab",url);
	}
	
}

function openFeedInBrowser(url){
	safari.self.tab.dispatchMessage("openLocal",url);
}

function showPopup (url,content){
	// Show a popup banner at the top of the web page.
	// url = the url of the RSS feed for which the banner is being shown.
	// content = action buttons or 'loading in default app' message, depending on current preferences.

	var popup = document.getElementById('rssmenu-popup'); // Will be 'null' if no existing popup being shown.
		
	if (window.top === window) {
		// Don't show the popup in any iframes on the page
		
		if (popup !== null){
		// If there's already a popup, hide it now.
		// TODO: Should kill any existing hide timeout associated with it as well.
			popup.parentElement.removeChild(popup);
		}

		popup = document.createElement('div');

		popup.setAttribute('class','rssmenu-popup');
		popup.setAttribute('id','rssmenu-popup');
		popup.style['opacity'] = '0';
		
		var innerHTML = [];
		//innerHTML.push("<div class='rssmenu-urlicon'><img src='"+ safari.extension.baseURI +"img/RSS-20.png'/></div>");
		innerHTML.push('<div class="rssmenu-icon"></div>');
		innerHTML.push("<div class='rssmenu-url'><a href='"+url+"'>"+url+"</a></div>");
		innerHTML.push("<div class='rssmenu-action'>" + content + "</div>");
		popup.innerHTML = innerHTML.join('');
		
		document.body.insertBefore(popup, document.body.firstChild);
		
		// If we don't wrap the opacity change in a timeout, the fade transition
		// doesn't happen...
		setTimeout(function(){popup.style['opacity']='1';},0);
	}
	return popup;
}

function closePopup(){
	// Close the popup that's used to 'always ask' or indicate 'now loading in default app'.
	var popup = document.getElementById('rssmenu-popup');
	
	if (popup !== null){
		// If we don't wrap the opacity change in a timeout, the fade transition
		// doesn't happen...
		setTimeout(function(){popup.style['opacity']='0';},0);
		
		// Don't remove the div immediately, or it will cut the fadeout short
		setTimeout(function(){popup.parentElement.removeChild(popup);},1000);
	}
}

function msgHandler(event){
	// Messages we currently expect are:
	// "showFeedPopup", sent from global page.
	// "feedActionChanged", sent from global page.
	
	if (event.name == "showFeedPopup"){

		var url = event.message[0]; // URL of feed to view
		var action = event.message[1];
		var timeout = event.message[2]; // Timeout (ms) before "adding feed" message disappears
		var popupContent = [];
								
		if (action == 'defaultapp'){
		
			// Use popup to show a transient message that the feed will load in
			// the default app shortly, but it can take a few moments.
			popupContent.push("<div class='rssmenu-pushbuttons'>");
			popupContent.push("<span class='loadmsg'>Opening feed in your newsreader app...");
			popupContent.push("<img id='spinner' src='"+safari.extension.baseURI+"img/progress_wheel.gif'></span></div>");
			popupContent=popupContent.join('');
			
			var popup = showPopup(url,popupContent);
			if (popup !== null)
				setTimeout(closePopup, timeout);

			openFeedInApp(url);
		}
		
		else if (action == 'alwaysask'){
			
			// Show three buttons in the popup -- Safari, Application, and Cancel.
			popupContent.push('<div class="rssmenu-pushbuttons">');
	        popupContent.push('<div class="rssmenu-button" id="appBtn">Open in Application</div>');
	        popupContent.push('<div class="rssmenu-button" id="browserBtn">Preview in Safari</div>');
	    	popupContent.push('</div>');
			popupContent.push('<div class="rssmenu-closebtn" id="closeBtn"></div>');
			popupContent = popupContent.join('');
	        									
			showPopup(url, popupContent);
			
			// Not sure why the onclicks can't be set until this point, but here we go…			
			document.getElementById('browserBtn').onclick = function(){openFeedInBrowser(url);closePopup();};
			document.getElementById('appBtn').onclick = function(){openFeedInApp(url);closePopup();};
			document.getElementById('closeBtn').onclick = function(){closePopup();};
		}
	}
	
	if (event.name == "feedActionChanged"){
	// User changed default action in preferences, so hide the popup banner 
	// (if currently shown) to avoid confusion.
		closePopup();
	}
}

function getBaseURL(){
	// Check for presence of <base href="<url>"> tag in <head>, and
	// return URL if found. Adds trailing '/' if not present.
	// Used when RSS feed link is not fully qualified.

		var docHead = document.getElementsByTagName('head')[0];
		var baseLinks = docHead.getElementsByTagName('base');
		var baseURL;
		
		for (var i=0; i < baseLinks.length; i++){
			
			var link = baseLinks[i];
			
			if (link.attributes.getNamedItem("href") !== null){
				url = link.attributes.getNamedItem("href").value;
				if (url.charAt(url.length-1)!='/'){
					url+='/';
				}
				break;
			}
		}
		
		return baseURL;
	
}

function fullyQualifiedURL(h){
	// Given the href value from a <link> tag specifying a URL feed, which may not be fully
	// qualified, return the full URL to that feed.
					
	var href = h.trim();
	
	if (href.substr(0,4) !== "http"){
		// Specified link is relative, construct the full URL
		
		// Remove leading slash if present
		if (href[0] == '/'){
			href = href.slice(1);
		}

		var baseURL = getBaseURL();
		if (baseURL != undefined){
			href = baseURL + href;				
		}
		else{
			// In absence of <base> tag, assume document domain.
			href = protocol(document.URL) + '://' + document.domain + '/' + href;
		}
	}
	
	return href;

}

function findFeedsOnPage(){
	// A feed is a node in the document <head> that looks like:
	// <link rel="alternate" type="application/rss+xml" title="RSS feed" href="http://blah.com/rss/feed.xml">
	// Other forms of href: "/feed.xml" (relative to site root), "feed.xml" (relative to current page.)
	// Other values of type: application/atom+xml, text/xml.

	var foundFeeds = []; // will be populated as: [[name,url],[name,url],...]

	var docHead = document.getElementsByTagName('head')[0];		
	var headLinks = docHead.getElementsByTagName('link');
				
	for (var i=0; i < headLinks.length; i++){
		
		var link = headLinks[i];
		
		if (link.attributes.getNamedItem("rel") !== null && 
			link.attributes.getNamedItem("rel").value == "alternate"){
			
			var typeItem = link.attributes.getNamedItem("type");

			if (typeItem !== null){

				var type=typeItem.value;			
			
				if (type === "application/rss+xml"  || 
					type === "application/atom+xml" ||
					type === "text/xml"){
					
					var title = link.attributes.getNamedItem("title");
					
					if (title !== null){
						// Use the feed title specified on the page
						title = title.value;					
					}
					else{
						// No title specified, use a generic name based on the type
						if (type.indexOf("rss") != -1)
							title = "RSS Feed";
						else if (type.indexOf("atom") != -1)
							title = "Atom Feed";
						else
							title = 'Untitled Feed';
					}
	
					var href = fullyQualifiedURL(link.attributes.getNamedItem("href").value);
										
					if (href)
						foundFeeds.push([title, href]);
				
				} // type === rss+xml/atom+xml/xml
	
			} // type.Item !==null
	
		} // rel==alternate
	}
	safari.self.tab.dispatchMessage("foundFeeds",foundFeeds);
}