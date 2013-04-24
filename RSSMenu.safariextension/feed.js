function displayFeed(feed, feedUrl){

	$("#loading").hide();
	
	var body = $("body");
	
	var ph = $("<header class='pageheader'>");
	
	// Feed Title
	var h = $("<h1 class='feedtitle'>");
	h.append($('<a>').attr('href', feed.link).text(feed.title));
	ph.append(h);
	
	// Feed description
	h = $("<p class='feeddesc'>");
	h.append(feed.description);
	ph.append(h);
	
	ph.append($('<a class="subscribe">').attr('href', feedUrl).text("Subscribe"));
	ph.append($("<button>").text("Show All").click(function(){$(".abody").show()}));

	body.append(ph);
	
	var list = $("<div id='alist'>");

	function t(id, url){
		// Return a function that either expands article with DOM id if there is any body text,
		// otherwise opens the original url in a new tab.
		return function(){
			var b = $('#'+id+' .abody');
			var l = $('#'+id+' .alink');
			if (b.html()!=""){
				b.slideToggle('fast');
				l.toggle();
			}
			else{
				window.open(url);
			}
		}
	};

	function o(link){
		return function(){window.open(link);}
	};
	
	// Articles
	for(var j = 0; j < feed.items.length; j++) {
		
		var articleId = "article"+j;
		var article = $("<article>").attr("id", articleId);
		
		var header = $('<header class="artheader">');

		var title = $('<h2>');
		title.append($('<a class="elips atitle" href="#">').text(feed.items[j].title));
		
		// If article content is empty, clicking title will link directly to original article
		if (feed.items[j].description == ""){
			$("a",title).addClass("ext");
		}
		
		var l = feed.items[j].link;
		title.click(t(articleId,l));

		var author = "";
		if (feed.items[j].author != ""){
			author = $('<span class="elips author">').text(feed.items[j].author);
		}
		
		// Show only time if article posted today, only date otherwise.
		var today = new Date().toLocaleDateString();
		var articleDate = new Date (Date.parse(feed.items[j].updated));
		var displayDate = "";
		
		if (articleDate.toLocaleDateString() == today){
			displayDate = articleDate.toLocaleTimeString();
		}
		else{
			displayDate = articleDate.toLocaleDateString();
		}
				
		var date = $('<span class="elips adate">').text(displayDate);
		header.append(title).append(author).append(date);
		header.append($("<a class='alink ext'>").attr({"href":l, "target":"_blank"}).text("Read original on "+l.split('/')[2]));
		article.append(header);

		h = $('<div class="abody">');
		h.append(feed.items[j].description);
		article.append(h);
		
		list.append(article);
	}
	
	body.append(list);
	
	document.title = feed.title + ' [' + feed.type.toUpperCase() + ' '+ feed.version + ']';
	
}