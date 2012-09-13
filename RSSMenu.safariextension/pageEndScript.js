/** End Script for Safari RSS Feed Extension **/
/** © 2012 Calum Benson                      **/
/** Licence: None - public domain            **/      

//"use strict";

safari.self.addEventListener("message", msgHandler, false); // Listen for events sent by global.html

findFeedsOnPage(); // Run when any page has finished loading


/*
 * Helper functions
 */

function x_frame_options(url){
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
		console.log("oops - "+e.message);
		return "deny";
	}

	if (xhr.status === 200){
		return xhr.getResponseHeader("X-Frame-Options"); // Poss. values: 'deny' or 'sameorigin'
	}
	else
		return "allow"; // We couldn't access the http header, so hope for the best.
}

function openFeedInApp(url){
	// We open a feed in the default app by adding an invisible iframe to the page
	// whose src is the feed URL.
	
	if (x_frame_options(url) != "deny"){
		var appiframe = document.getElementById('appiframe');		
		if (appiframe === null){
			// We haven't already created the iframe for this page, so do it now.
			appiframe = document.createElement('IFRAME');
			appiframe.style.width = 0+'px';
			appiframe.style.height = 0+'px';
			appiframe.setAttribute('id','appiframe');
			document.body.appendChild(appiframe);
		}			
		appiframe.src = url;
	}
	else{
		safari.self.tab.dispatchMessage("openFeedInTab",url);
	}
	
}

function openFeedInReader(url){
	// Pass feed url to Google Reader in a new tab/window (according to browser prefs).
	window.open('http://www.google.com/reader/view/feed/'+encodeURIComponent(url), '_blank');
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
		
		popup.innerHTML = "<div class='rssmenu-urlicon'><img src='"+ safari.extension.baseURI +"rss-color.png'/></div>";
		popup.innerHTML += "<div class='rssmenu-url'><a href='"+url+"'>"+url+"</a></div>";
		popup.innerHTML += "<div class='rssmenu-action'>" + content + "</div>";
		
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
			
			var popup = showPopup(url,popupContent);
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

			buttons.innerHTML += '<div class="rssmenu-button"><svg id="closeBtn" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0, 0, 64, 64">'
  				+'<g id="Layer 1">'
				+'<path d="M53.692,9.241 C65.898,21.447 65.898,41.237 53.692,53.442 C41.487,65.648 21.697,65.648 9.491,53.442 C-2.715,41.237 -2.715,21.447 9.491,9.241 C21.697,-2.965 41.487,-2.965 53.692,9.241" stroke="#000000" stroke-width="1" fill="#888888"/>'
    			+'<g>'
      			+'<path d="M19.171,18.921 L44.012,43.762" stroke="#EEEEEE" stroke-width="10" fill="#000000" fill-opacity="0"/>'
      			+'<path d="M19.171,43.762 L44.012,18.921" stroke="#EEEEEE" stroke-width="10" fill="#000000" fill-opacity="0"/>'
    			+'</g></g><defs/></svg></div>';
    									
			showPopup(url, buttons.innerHTML);
			// svg = document.getElementsByTagName('object')[0].contentDocument.getElementsByTagName('svg')[0];
			// svg.removeAttribute('width');
			// svg.removeAttribute('height');

			
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
}

function findFeedsOnPage(){
	// A feed is a node in the document <head> that looks like:
	// <link rel="alternate" type="application/rss+xml" title="RSS feed" href="http://blah.com/rss/feed.xml">
	// Other forms of href: "/feed.xml" (relative to site root), "feed.xml" (relative to current page.)
	// Other values of type: application/atom+xml, text/xml.

	if (window.top === window) {
		// The parent frame is the top-level frame, not an iframe, so go ahead.
		
		var foundFeeds = []; // will be populated as: [[name,url],[name,url],...]
	
		var docHead = document.getElementsByTagName('head')[0];		
		var headLinks = docHead.getElementsByTagName('link');
			
		for (var i=0; i < headLinks.length; i++){
			
			var link = headLinks[i];
			
			if (link.attributes.getNamedItem("rel") !== null && 
				link.attributes.getNamedItem("rel").value == "alternate"){
				
				var type = link.attributes.getNamedItem("type").value;
			
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

					var href = link.attributes.getNamedItem("href").value;
					href = href.trim();
											
					if (href[0] == '/'){
						// Specified link is relative to site root, construct the full URL
						var protocol = document.URL.split(':')[0];
						href = protocol+ '://' + document.domain + href;
					}

					if (href.substr(0,4) !== "http"){
						// Specified link is relative to current page, construct the full URL
						href = document.URL + href;
					}
					
					if (href)
						foundFeeds.push([title, href]);
				}
			}
		}
		safari.self.tab.dispatchMessage("foundFeeds",foundFeeds);
	}
}