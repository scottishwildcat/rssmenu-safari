
safari.self.addEventListener("message", msgHandler, false); // Listen for click events sent by global.html

function msgHandler(event){
	// Look for <link rel="alternate" type="application/rss|atom+xml"> nodes in <head>

	if (event.name == "toolbarbutton"){
			
		var feeds = [];
		var c, v;
	
		var docHead = document.getElementsByTagName('head')[0]; //docHead is of type Node
		
		// Store all found feeds in an array: [[name,url],[name,url],…]
		for (i=0; i < docHead.childElementCount; i++){
			c = docHead.children[i];
			if (c.nodeName == "LINK"){
				v = c.attributes.getNamedItem("type").value;
				if (v == "application/rss+xml" || v == "application/atom+xml")
					feeds.push([c.attributes.getNamedItem("title").value, c.attributes.getNamedItem("href").value]);
			}
		}
		
		safari.self.tab.dispatchMessage("foundFeeds",feeds);
	}
}