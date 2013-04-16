function displayFeed(feed, feedUrl){

	var b = $("body");
	
	// Feed Title
	var h = $("<h1>");
	h.attr("class","feedtitle");
	h.append($('<a>').attr('href', feed.link).text(feed.title));
	b.append(h);
	
	b.append($('<a class="subscribe">').attr('href', feedUrl).text("Subscribe"));
	
	// Feed description
	h = $("<h2>").text(feed.description);
	h.attr('id','feeddesc');
	b.append(h);

	b.append('<p>feed language: ' + feed.language + '</p>');
	b.append('<p>feed updated: ' + feed.updated + '</p>');
	b.append('<p>feed items: ' + feed.items.length + '</p>');


	function t(id){
		return function(){$('#'+id+' > .abody').toggle();}
	};
	
	// Articles
	for(var j = 0; j < feed.items.length; j++) {
		
		//var articleId = feed.items[j].id;
		var articleId = "article"+j;
		
		var a = $("<article>").attr("id", articleId);
				
		h= $('<button>').text(">");
		h.click(t(articleId));
		a.append(h);
		
		h = $('<h3 class="atitle">');
		h.append($('<a>').attr('href',feed.items[j].link).text(feed.items[j].title));
		a.append(h);
		
		h = $('<p class="abody">');
		h.append(feed.items[j].description);
		a.append(h);
		
		a.append($('<p class="adate">').text(feed.items[j].updated));
		
		b.append(a);
	}
	
	document.title = feed.title + ' [' + feed.type.toUpperCase() + ' '+ feed.version + ']';
	
}