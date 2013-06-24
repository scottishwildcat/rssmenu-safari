function displayFeed(feed, feedUrl){

	$("#loading").hide();
	
	var body = $("body");
	
	var ph = $("<header class='pageheader'>");
	
	// <h1> Feed Title - subscribe icon - webpage icon </h1>
	var h = $("<h1 class='feedtitle'>");
	h.text(feed.title);
	
	var si = $('<img>').attr('src','img/preview-subscribe.png').attr('title','Subscribe');
	var pi = $('<img>').attr('src','img/preview-webpage.png').attr('title','Visit Homepage');
	
	h.append(($('<a>').attr('href',httpToFeed(feedUrl))).append(si));
	h.append(($('<a>').attr('href',feed.link)).append(pi));
	
	ph.append(h);
	
	
	// <H2> FEED DESCRIPTION </H2>
	h = $("<h2 class='feeddesc'>");
	h.append(feed.description);
	h.text (h.text()); // Strip any html tags from feed description
	ph.append(h);
	body.append(ph);
	
	// ARTICLE LIST
	var list = $("<div id='alist'>");

	// Add show/hide all buttons
	var c = $("<div id='controls'>");
	si = $('<img>').attr('src','img/preview-show.png').attr('title','Expand All');
	pi = $('<img>').attr('src','img/preview-hide.png').attr('title','Collapse All');
	
	// Wrap clickable imgs in dummy <a> tags to allow keyboard navigation
	//c.append($('<a>').attr('href','#')).append(si);
	//c.append($('<a>').attr('href','#')).append(pi);
	c.append($('<button>').click(function(){$(".abody").show()}).append(si));
	c.append($('<button>').click(function(){$(".abody").hide()}).append(pi));
	list.append(c);

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
				window.open(url,'_blank');
			}
		}
	};

	function o(url){
		// Return a function that opens the given URL in a new tab/window.
		return function(){window.open(url,'_blank');}
	};
	
	// Articles
	for(var j = 0; j < feed.items.length; j++) {
		
		var articleId = "article"+j;
		var article = $("<article>").attr("id", articleId);
		
		var header = $('<header>').addClass('artheader');

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