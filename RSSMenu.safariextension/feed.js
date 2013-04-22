function displayFeed(feed, feedUrl){

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

	/*
	body.append('<p>feed language: ' + feed.language + '</p>');
	body.append('<p>feed updated: ' + feed.updated + '</p>');
	body.append('<p>feed items: ' + feed.items.length + '</p>');
	*/

	function t(id){
		return function(){
			var b = $('#'+id+' > .abody');
			if (b.html()!=""){
				b.slideToggle('fast');
			}
		}
	};

	function o(link){
		return function(){window.open(link);}
	};
	
	// Articles
	for(var j = 0; j < feed.items.length; j++) {
		
		//var articleId = feed.items[j].id;
		var articleId = "article"+j;
		var article = $("<article>").attr("id", articleId);
		
		var header = $('<header class="artheader">');

		var title = $('<h2>');
		title.append($('<a class="elips atitle" href="#">').text(feed.items[j].title));
		title.click(t(articleId));

		var author = "";
		if (feed.items[j].author != ""){
			author = $('<span class="elips author">').text(feed.items[j].author);
		}
		
		var linkBtn = $('<span class="alink">').html("<img src='link.png'>");
		linkBtn.click(o(feed.items[j].link));

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
		header.append(title).append(author).append(linkBtn).append(date);
		article.append(header);

		h = $('<div class="abody">');
		h.append(feed.items[j].description);
		article.append(h);
		
		
		list.append(article);
	}
	
	body.append(list);
	
	document.title = feed.title + ' [' + feed.type.toUpperCase() + ' '+ feed.version + ']';
	
	/*
	$(".atitle").hover(	function(){$(this).css({"color":"purple"});
									$(this).siblings(".adate").css({"color":"purple"});
								},
						function(){$(this).css({"color":"black"});
									$(this).siblings(".adate").css({"color":"black"});
								});
	*/
}