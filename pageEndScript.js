/** Safari Extension End Script **/

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
	closePopup();
}

function openFeedInReader(url){
	// Pass feed url to Google Reader in a new tab/window (according to browser prefs).
	closePopup();
	window.open('http://www.google.com/reader/view/feed/'+encodeURIComponent(url), '_blank');
}

function showPopup (url,content){

		var popup = document.createElement('div');

		popup.setAttribute('class','addingfeed');
		popup.setAttribute('id','addingfeed-popup');
		popup.innerHTML = "<h1><a href='"+url+"'>"+url+"</a>";
		popup.innerHTML += content;
		
		document.body.insertBefore(popup, document.body.firstChild);
		window.scroll(0,0);		
		return popup;
}

function closePopup(){
	// Close the popup that's used to 'always ask' or indicate 'now loading in default app'.
	var popup = document.getElementById('addingfeed-popup');
	popup.parentElement.removeChild(popup);
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
			popupContent += '<p>Loading feed into your default newsreader app… ';
			popupContent += 'this might take a few seconds, even after this message disappears.</p>';
			
			var popup = showPopup(url,popupContent);
			setTimeout(closePopup, timeout);

			openFeedInApp(url);
		}
		
		else if (action == 'alwaysask'){

			var popup = showPopup(url,"");
			
			//TODO: Add the buttons before showing the popup.
			
			// Show three buttons in the popup -- Google Reader, Application, and Cancel.
			var googleButton = document.createElement('button');
			googleButton.setAttribute('type','button');
			googleButton.setAttribute('id','googleBtn');
			googleButton.innerText='Google Reader';
			popup.insertBefore(googleButton, null); // null = insert as last child of popup

			var appButton = document.createElement('button');
			appButton.setAttribute('type','button');
			appButton.setAttribute('id','appBtn');
			appButton.innerText='Application';
			popup.insertBefore(appButton, null); // null = insert as last child of popup

			var closeButton = document.createElement('button');
			closeButton.setAttribute('type','button');
			closeButton.setAttribute('id','closeBtn');
			closeButton.innerText='Cancel';
			popup.insertBefore(closeButton, null); // null = insert as last child of popup
			
			// Not sure why the onclicks can't be set until this point, but here we go…			
			document.getElementById('googleBtn').onclick = function(){openFeedInReader(url)};
			document.getElementById('appBtn').onclick = function(){openFeedInApp(url)};
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
						t == "text/xml")
						
						title = c.attributes.getNamedItem("title").value;
						href = c.attributes.getNamedItem("href").value;
						
						if (href[0]=='/'){
							// Specified link is relative, construct the full URI
							href = 'http://' + document.domain + href;
						}
						
						foundFeeds.push([title, href]);
				}
			}
		}
		safari.self.tab.dispatchMessage("foundFeeds",[foundFeeds,document.URL]);
	}
}