
safari.self.addEventListener("message", msgHandler, false); // Listen for events sent by global.html

findFeedsOnPage(); // Run when any page has finished loading


function msgHandler(event){

	if (event.name == "openFeedInDefaultApp"){
		// We open feed in default app by adding an invisible iframe to the page
		// whose src is the feed URL.
		
		// TODO: If we've already added an iframe, don't keep adding new ones, just
		// change the src.
		
		//TODO: A nice transparent overlay saying "Opening feed in default app, may take a few seconds"
		var ifrm = document.createElement('IFRAME');
		ifrm.src = event.message;
		ifrm.style.width = 0+'px';
		ifrm.style.height = 0+'px';
		document.body.appendChild(ifrm);
	}	
}


function findFeedsOnPage(){

	/* A feed is a node in the document <head> that looks like:
	 * <link rel="alternate" type="application/rss+xml" title="RSS feed" href="http://blah.com/rss/feed.xml">
	 * where type may also be application/atom+xml or text/xml. */

	if (window.top === window) {
	   // The parent frame is the top-level frame, not an iframe, so we can go ahead and check here.
			
		var foundFeeds = [];
		var c, t;
	
		var docHead = document.getElementsByTagName('head')[0];
			
		// Store all found feeds in an array: [[name,url],[name,url],…]
		for (i=0; i < docHead.childElementCount; i++){
			
			c = docHead.children[i];
						
			if (c.nodeName == "LINK"){
				
				if (c.attributes.getNamedItem("rel")!=null && 
					c.attributes.getNamedItem("rel").value == "alternate"){
					
					t = c.attributes.getNamedItem("type").value;
				
					if (t == "application/rss+xml" || 
						t == "application/atom+xml" ||
						t == "text/xml")
						
						var title = c.attributes.getNamedItem("title").value;
						var href = c.attributes.getNamedItem("href").value;
						
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

function openFeedInDefaultApp(url){
	// We do this by adding an invisible iframe to the page, whose source is the feed URL
	var ifrm = document.createElement('IFRAME');
	ifrm.src = url;
	ifrm.style.width = 0+'px';
	ifrm.style.height = 0+'px';
	document.body.appendChild(ifrm);

}