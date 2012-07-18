/** End Script for Safari RSS Feed Extension **/
/** © 2012 Calum Benson                      **/
/** Licence: None - public domain            **/      

//"use strict";

safari.self.addEventListener("message", msgHandler, false); // Listen for events sent by global.html

findFeedsOnPage(); // Run when any page has finished loading


/*
 * Helper functions
 */

function openFeedInApp(url){
	// We open a feed in the default app by adding an invisible iframe to the page
	// whose src is the feed URL.
	
	var appiframe = document.getElementById('appiframe');		

	if (appiframe == null){
		// We haven't already created the iframe for this page, so do it now.
		appiframe = document.createElement('IFRAME');
		appiframe.style.width = 0+'px';
		appiframe.style.height = 0+'px';
		appiframe.setAttribute('id','appiframe');
		document.body.appendChild(appiframe);
	}	
	appiframe.src = url;
}

function openFeedInReader(url){
	// Pass feed url to Google Reader in a new tab/window (according to browser prefs).
	window.open('http://www.google.com/reader/view/feed/'+encodeURIComponent(url), '_blank');
}

function showPopup (url,content){

		var popup = null;
		
		if (window.top === window) {
			// Don't show the popup in any iframes on the page
			popup = document.createElement('div');

			popup.setAttribute('class','popup');
			popup.setAttribute('id','addfeed-popup');
			popup.style['opacity'] = '0';
			
			popup.innerHTML = "<div class='url'><a href='"+url+"'>"+url+"</a></div>";
			popup.innerHTML += "<div class='action'>" + content + "</div>";
			
			document.body.insertBefore(popup, document.body.firstChild);
			
			// If we don't wrap the opacity change in a timeout, the fade transition
			// doesn't happen, for some reason...
			setTimeout(function(){popup.style['opacity']='1'},0);
		}
		return popup;
}

function closePopup(){
	// Close the popup that's used to 'always ask' or indicate 'now loading in default app'.
	var popup = document.getElementById('addfeed-popup');
	
	if (popup != null){
		// If we don't wrap the opacity change in a timeout, the fade transition
		// doesn't happen, for some reason...
		setTimeout(function(){popup.style['opacity']='0'},0);
		
		// Don't remove the div immediately, or it will cut the fadeout short
		setTimeout(function(){popup.parentElement.removeChild(popup)},1000);
	}
}

function msgHandler(event){
	// Only event we currently deal with is "showFeedPopup", sent from global page.

	var url = event.message[0]; // URL of feed to view
	var action = event.message[1];
	var timeout = event.message[2]; // Timeout (ms) before "adding feed" message disappears
	var popupContent = "";
	
	if (event.name == "showFeedPopup"){
								
		if (action == 'defaultapp'){
		
			// Use popup to show a transient message that the feed will load in
			// the default app shortly, but it can take a few moments.
			popupContent += "<span class='loadmsg'>Loading feed into your default newsreader app… ";
			popupContent += "might take a few seconds after this message disappears.</span>";
			
			var popup = showPopup(url,popupContent);
			if (popup!=null)
				setTimeout(closePopup, timeout);

			openFeedInApp(url);
		}
		
		else if (action == 'alwaysask'){
			
			var buttons = document.createElement('div');
			
			// Show three buttons in the popup -- Google Reader, Application, and Cancel.
			var googleButton = document.createElement('div');
			googleButton.setAttribute('class','bannerbutton');
			googleButton.setAttribute('id','googleBtn');
			googleButton.innerText='Google Reader';
			buttons.insertBefore(googleButton, null); // null = insert as last child of popup

			var appButton = document.createElement('div');
			appButton.setAttribute('class','bannerbutton');
			appButton.setAttribute('id','appBtn');
			appButton.innerText='Application';
			buttons.insertBefore(appButton, null); // null = insert as last child of popup

			var closeButton = document.createElement('div');
			closeButton.setAttribute('class','bannerbutton');
			closeButton.setAttribute('id','closeBtn');
			closeButton.innerText='Cancel';
			buttons.insertBefore(closeButton, null); // null = insert as last child of popup
			
			showPopup(url, buttons.innerHTML);
			
			// Not sure why the onclicks can't be set until this point, but here we go…			
			document.getElementById('googleBtn').onclick = function(){openFeedInReader(url);closePopup();};
			document.getElementById('appBtn').onclick = function(){openFeedInApp(url);closePopup();};
			document.getElementById('closeBtn').onclick = function(){closePopup()};
		}
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
						
			if (c.nodeName == "LINK"){
				
				if (c.attributes.getNamedItem("rel")!==null && 
					c.attributes.getNamedItem("rel").value == "alternate"){
					
					t = c.attributes.getNamedItem("type").value;
				
					if (t == "application/rss+xml" || 
						t == "application/atom+xml" ||
						t == "text/xml"){
						
						title = c.attributes.getNamedItem("title").value;
						if (!title)
							title = 'Untitled Feed';

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