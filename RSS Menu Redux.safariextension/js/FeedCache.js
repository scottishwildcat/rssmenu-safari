/********************************************/
/* RSS Menu Extension - FeedCache class     */
/* (c) Calum Benson 2015                    */
/********************************************/


// Cache format:
// {tabUrl1: [feedobj1, feedobj2, feedobj3], tabUrl2: [feedobj1, feedobj2, feedobj3], ... }
//
// where feedobj = {uri:<feeduri>, 
//					title:<feed title>, 
//					format:<text/xml, etc.>, 
//					group:<GROUP_NONE|GROUP_YT_PLAYLIST|GROUP_YT_SUBSCRIPTIONS|GROUP_YT_FAVOURITES>}

var FeedCache = function(){
	var name;
}

FeedCache.prototype.initialize = function(name){
	// Create a new FeedCache object in localStorage with given name.
	// If named cache already exists from previous browser session, use that instead.
	this.name = name;
	if (!(this.name in localStorage)){
		localStorage.setItem(this.name,JSON.stringify(new Object()));
	}	
}

FeedCache.prototype.destroy = function(){
	// Destroy this FeedCache obhect.
	localStorage.removeItem(this.name);
}

//TODO: Handle case where localStorage entry was deleted manually,
// but object still exists.

FeedCache.prototype.tabExists = function(tabUrl){
	// Return true if feeds for tabUrl are already cached, otherwise false.
	var cache = JSON.parse(localStorage[this.name]);
	return (tabUrl in cache);
} 

FeedCache.prototype.getFeedsForTab = function(tabUrl){
	// Return list of feeds for tab with given tabUrl.
	var cache = JSON.parse(localStorage[this.name]);
	return (cache[tabUrl]);
}

FeedCache.prototype.addTab = function(tabUrl, feedArray){
	// Add the array of Feed objects for tabUrl to the cache, in alphabetical title order.
	var cache = JSON.parse(localStorage[this.name]);
	feedArray.sort(function(f,g){
		return ((f.title.toLowerCase() < g.title.toLowerCase()) ? -1 : 1)
		});
	cache[tabUrl] = feedArray;
	localStorage[this.name] = JSON.stringify(cache);
}

FeedCache.prototype.removeTab = function(tabUrl){
	// Remove cached feeds for tabUrl.
	var cache = JSON.parse(localStorage[this.name]);
	delete cache[tabUrl];
	localStorage[this.name] = JSON.stringify(cache);
}