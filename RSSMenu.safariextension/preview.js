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
	var b1,b2,b3;
	
	b1 = $('<img>').attr('src','img/preview-subscribe.png').attr('id','subscribe').attr('title','Subscribe');
	b2 = $('<img>').attr('src','img/preview-webpage.png').attr('id','homepage').attr('title','Homepage');
	c.append(($('<a>').attr('href',httpToFeed(feedUrl))).append(b1));
	
	if (feed.link!=""){
		c.append(($('<a>').attr('href',feed.link)).append(b2));
	}

	// Show-hide buttons
	function toggleImages(){
		var visible=true; // Essentially a static used by the anon function returned
		return function(){
			if (visible==true){
				$("img","#alist").hide();
				$("#toggle-icon").attr('src','img/preview-images-off.png');
				visible=false;
			}
			else{
				$("img","#alist").show();
				$("#toggle-icon").attr('src','img/preview-images-on.png');
				visible = true;
			}
		}
	}
	
	b1 = $('<img>').attr('src','img/preview-show.png').attr('title','Expand Articles');
	b2 = $('<img>').attr('src','img/preview-hide.png').attr('title','Collapse Articles');
	b3 = $('<img>').attr('src','img/preview-images-on.png').attr('title','Toggle Images').attr('id','toggle-icon');
	c.append($('<button>').attr('id','show-all').click(function(){$(".readorig, .abody").show()}).append(b1));
	c.append($('<button>').attr('id','hide-all').click(function(){$(".readorig, .abody").hide()}).append(b2));
	c.append($('<button>').attr('id','toggle-images').click(toggleImages()).append(b3));
	
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
		artheader.append(title).append(author).append(date);
		artheader.append($("<a class='readorig alink ext'>").attr({"href":l, "target":"_blank"}).text("Read original on "+l.split('/')[2]));
		article.append(artheader);

		h = $('<div class="abody">');
		h.append(feed.items[j].description);
		article.append(h);
		
		list.append(article);
	}
	
	body.append(list);
	
	document.title = feed.title + ' [' + feed.type.toUpperCase() + ' '+ feed.version + ']';
	
}