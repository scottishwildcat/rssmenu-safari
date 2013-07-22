/** Injected Script for Safari RSS Feed Extension **/
/** © 2012-13 Calum Benson                        **/
/** Licence: None - public domain                 **/    

if (isTopLevel()){
	findYouTubePlaylistFeedsOnPage();
}

function findYouTubePlaylistFeedsOnPage(){
	// Return a list of RSS feeds for YouTube playlists on this page.
	// Uses Google API v2, see https://developers.google.com/youtube/2.0/reference#Playlists_Feeds.

	var foundFeeds = {}; // will be populated as: {url1:title1, url2: title2...}
	var channelId = $('meta[itemprop="channelId"]').attr('content');

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
						
						// Subs feed title is returned with channelId rather than display name,
						// so replace it first.
						var username = $('meta[itemprop="name"]').attr("content");
						plTitle = plTitle.replace(channelId.substring(2),username);

						foundFeeds[plURL] = {sort:false, title:plTitle, type:feedType};
						
						break;		
				}
				
				safari.self.tab.dispatchMessage("foundFeeds",foundFeeds);
			}
		}
	}

	
	if (channelId !== undefined){
		var plAPI = "https://gdata.youtube.com/feeds/api/users/"+channelId+"/playlists?v=2";
		$.get(plAPI, gotYouTubePlaylists('plist'));
		
		plAPI = "https://gdata.youtube.com/feeds/api/users/"+channelId+"/favorites"
		$.get(plAPI, gotYouTubePlaylists('favs'));
		
		plAPI = "https://gdata.youtube.com/feeds/api/users/"+channelId+"/newsubscriptionvideos";
		$.get(plAPI, gotYouTubePlaylists('subs'));
		
	}
}