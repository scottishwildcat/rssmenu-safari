
//safari.self.addEventListener("message", msgHandler, false); // Listen for events sent by global.html


/*function msgHandler(event){

	if (event.name == "getfeeds")
		console.log("Got explicit find feeds");
		findFeedsOnPage();
		
}
*/

function findFeedsOnPage(){

	if (window.top === window) {
	
	   // The parent frame is the top-level frame, not an iframe, so we should do our stuff.
			
		var feeds = [];
		var c, v;
	
		var docHead = document.getElementsByTagName('head')[0];
			
		// Store all found feeds in an array: [[name,url],[name,url],…]
		for (i=0; i < docHead.childElementCount; i++){
			
			c = docHead.children[i];
			
			if (c.nodeName == "LINK"){
				
				if (c.attributes.getNamedItem("rel")!=null && 
					c.attributes.getNamedItem("rel").value == "alternate"){
					
					v = c.attributes.getNamedItem("type").value;
				
					if (v == "application/rss+xml" || 
						v == "application/atom+xml" ||
						v == "text/xml")
						
						var title = c.attributes.getNamedItem("title").value;
						var href = c.attributes.getNamedItem("href").value;
						
						if (href[0]=='/'){
							// Specified link is relative, construct the full URI
							href = 'http://' + document.domain + href;
						}
						
						feeds.push([title, href]);
				}
			}
		}
		safari.self.tab.dispatchMessage("foundFeeds",[feeds,document.URL]);
	}
}

findFeedsOnPage(); // Run when any page has finished loading