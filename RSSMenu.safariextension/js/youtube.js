/** Injected Script for Safari RSS Feed Extension **/
/** © 2012-13 Calum Benson                        **/
/** Licence: None - public domain                 **/    

if (isTopLevel()){
	findYouTubePlaylistFeedsOnPage();
}

function ytUserName(){
	// Return the username of the YouTube account that owns this page. Currently, this 
	// is found by looking for:
	//
	// <span itemprop="author">
    //      <link itemprop="url" href="http://www.youtube.com/user/<username>">
    // </span>
    //
    // in the HTML header.

	const ytUserUrl = $('span[itemprop="author"] link[itemprop="url"]').attr('href');
	
	return ytUserUrl.split('/').slice(-1)[0];
}

function findYouTubePlaylistFeedsOnPage(){
	// Return a list of RSS feeds for YouTube playlists on this page.
	// Uses Google API v2, see https://developers.google.com/youtube/2.0/reference#Playlists_Feeds.

	const username = ytUserName(); // Username to whom this youtube page belongs

	function gotYouTubePlaylists(feedType){

		return function(data, textStatus, jqXHR){
			
			var foundFeeds =[];
			
			if (textStatus==="success"){
			
				var feeds, plTitle, plURL;
				
				switch (feedType){

					case 'plist':
						feeds = $('entry',data);
						foundFeeds['menulabel'] = $('feed>title', data).text();
						
						for (var i=0; i < feeds.length; i++){
							plTitle = $('title', $('entry',data)[i]).text();							
							plURL = $('content', $('entry',data)[i]).attr('src') + "&max-results=50"; //Max allowed by API v2.
														
							// Playlist feeds will be sorted alphabetically on the menu
							foundFeeds[plURL] = {sort:true, title:plTitle, type:feedType};
						}
						break;
						
					case 'favs':
					case 'subs':
						plURL = $('link[href*="start-index"]',data).attr('href');
						plTitle = ($('title',data)[0]).textContent;
						
						// Favs and Subs feeds will be unsorted at the top of the menu
						foundFeeds[plURL] = {sort:false, title:plTitle, type:feedType};
						
						break;		
				}
				
				safari.self.tab.dispatchMessage("foundFeeds",foundFeeds);
			}
		}
	}

	
	if (username !== undefined){
		var plAPI = "https://gdata.youtube.com/feeds/api/users/"+username+"/playlists?v=2";
		$.get(plAPI, gotYouTubePlaylists('plist'));
		
		plAPI = "https://gdata.youtube.com/feeds/api/users/"+username+"/favorites"
		$.get(plAPI, gotYouTubePlaylists('favs'));
		
		plAPI = "https://gdata.youtube.com/feeds/api/users/"+username+"/newsubscriptionvideos";
		$.get(plAPI, gotYouTubePlaylists('subs'));
		
	}
}