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
		return function(){$('#'+id+' > .abody').slideToggle('fast');}
	};

	function o(link){
		return function(){window.open(link);}
	};
	
	// Articles
	for(var j = 0; j < feed.items.length; j++) {
		
		//var articleId = feed.items[j].id;
		var articleId = "article"+j;
		var article = $("<article>").attr("id", articleId);
		
		var header = $('<div class="artheader">');

		// <d artheader> <s atitle>Title</s> <btn>Link</btn></s> <s adate>date</s> </s>		
		var title = $('<span class="atitle">').text(feed.items[j].title);
		title.click(t(articleId));

		var btn = $('<button>').text("Link");
		btn.click(o(feed.items[j].link));

		var date = $('<span class="adate">').text(feed.items[j].updated);
		header.append(title).append(btn).append(date);
		article.append(header);

		h = $('<p class="abody">');
		h.append(feed.items[j].description);
		article.append(h);
		
		
		b.append(article);
	}
	
	document.title = feed.title + ' [' + feed.type.toUpperCase() + ' '+ feed.version + ']';
	
}