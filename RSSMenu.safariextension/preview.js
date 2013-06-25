function displayFeed(feed, feedUrl){

	$("#loading").hide();
	
	
	var body = $("body");
	
	var ph = $("<header id='pageheader'>");
	
	// <h1> Feed Title </h1> <div controls>sub web     show hide</div>

	var c = $("<div id='controls'>");

	var h = $("<h1 id='feedtitle'>");
	h.text(feed.title);
	c.append(h);
		
	// Article buttons
	
	var si = $('<img>').attr('src','img/preview-subscribe.png').attr('id','subscribe').attr('title','Subscribe');
	var pi = $('<img>').attr('src','img/preview-webpage.png').attr('id','homepage').attr('title','Visit Homepage');
	c.append(($('<a>').attr('href',httpToFeed(feedUrl))).append(si));
	c.append(($('<a>').attr('href',feed.link)).append(pi));

	// Show-hide buttons
	si = $('<img>').attr('src','img/preview-show.png').attr('title','Expand All');
	pi = $('<img>').attr('src','img/preview-hide.png').attr('title','Collapse All');
	c.append($('<button>').attr('id','show-all').click(function(){$(".abody").show()}).append(si));
	c.append($('<button>').attr('id','hide-all').click(function(){$(".abody").hide()}).append(pi));
	
	ph.append(c);
	
	
	// <H2> FEED DESCRIPTION </H2>
	h = $("<h2 id='feeddesc'>");
	h.append(feed.description);
	h.text (h.text()); // Strip any html tags from feed description
	ph.append(h);
	
	body.append(ph);

	// Change opacity of header images on mouseover
	$('img','header').hover(
        function() {
            $(this).stop().animate({ opacity: 0.5 }, 0);
        },
       function() {
           $(this).stop().animate({ opacity: 1.0 }, 0);
		   }
	);
              
                   
	

	
	// ARTICLE LIST
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