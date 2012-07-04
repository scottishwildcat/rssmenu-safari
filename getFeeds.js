/** Safari Extension End Script **/

//"use strict";

safari.self.addEventListener("message", msgHandler, false); // Listen for events sent by global.html

findFeedsOnPage(); // Run when any page has finished loading

function openFeedInApp(url){
		// We open feed in default app by adding an invisible iframe to the page
		// whose src is the feed URL.
		
		// TODO: If we've already added an iframe, don't keep adding new ones, just
		// change the src.
		var ifrm = document.createElement('IFRAME');
		ifrm.src = url;
		ifrm.style.width = 0+'px';
		ifrm.style.height = 0+'px';
		document.body.appendChild(ifrm);

}

function openFeedInReader(url){
	closePopup();
	window.open('http://www.google.com/reader/view/feed/'+encodeURIComponent(url), '_blank');
}

function closePopup(){
	var popup = document.getElementById('addingfeed-popup');
	popup.parentElement.removeChild(popup);
}

function msgHandler(event){

	var url = event.message[0]; // URL of feed to view
	var action = event.message[1];
	var timeout = event.message[2]; // Timeout (ms) before "adding feed" message disappears

	if (event.name == "showFeedBanner"){
				
		var popup = document.createElement('div');
		popup.setAttribute('class','addingfeed');
		popup.setAttribute('id','addingfeed-popup');
		popup.innerHTML = "<h1><a href='"+url+"'>"+url+"</a>";
				
		if (action == 'defaultapp'){
			popup.innerHTML += '<p>Loading feed into your default newsreader app… this might take a few seconds, even after this message disappears.</p>';
			document.body.insertBefore(popup, document.body.firstChild);
			window.scroll(0,0);
			setTimeout(closePopup, timeout);
			openFeedInApp(url);
		}
		
		if (action == 'alwaysask'){
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
			
			document.body.insertBefore(popup, document.body.firstChild);
			window.scroll(0,0);
			
			// Not sure why the onclicks can't be set until this point, but anyway…
			document.getElementById('googleBtn').onclick = function(){openFeedInReader(url)};
			document.getElementById('appBtn').onclick = function(){openFeedInApp(url)};
			document.getElementById('closeBtn').onclick = function(){closePopup()};
		}
	}	
}

function findFeedsOnPage(){

	/* A feed is a node in the document <head> that looks like:
	*  <link rel="alternate" type="application/rss+xml" title="RSS feed" href="http://blah.com/rss/feed.xml">
	*  where type may also be application/atom+xml or text/xml. 
	*/

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