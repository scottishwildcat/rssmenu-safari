function displayFeed(feed, feedUrl){

	$("#loading").hide();
	
	var body = $("body");
	
	var ph = $("<header id='pageheader'>");
	
	// <div controls><h1>Feed Title</h1> web show hide</div>

	var d = $("<div id='controls'>");

	var h = $("<h1 id='feedtitle' class='elips'>");
	//h.append($('<a>').text(feed.title).attr('title','Open in Application').attr('href',httpToFeed(feedUrl)));
	h.text(feed.title);
	d.append(h);
		
	// BUTTONS
	var b1,b2,b3,b4;
	
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
	
	b1 = $('<img>').attr('src','img/preview-show.png').attr('title','Expand All Articles');
	b2 = $('<img>').attr('src','img/preview-hide.png').attr('title','Collapse All Articles');
	b3 = $('<img>').attr('src','img/preview-images-on.png').attr('title','Toggle Images in Articles').attr('id','toggle-icon');
	
	d.append($('<button>').attr('id','show-all').click(function(){$(".readorig, .abody").show()}).append(b1));
	d.append($('<button>').attr('id','hide-all').click(function(){$(".readorig, .abody").hide()}).append(b2));
	d.append($('<button>').attr('id','toggle-images').click(toggleImages()).append(b3));
	
	b4 = $('<img>').attr('src','img/preview-webpage.png').attr('id','homepage').attr('title','Visit Feed Homepage');
	
	if (feed.link!=""){
		d.append(($('<a>').attr('href',feed.link)).append(b4));
	}
	
	ph.append(d);
	
	
	// <H2> FEED DESCRIPTION </H2>
	d = $("<div 'desc'>");
	h = $("<h2 id='feeddesc'>").text(feed.description);
	h.text (h.text()); // Strip any html tags from feed description
	d.append(h);
	
	//Subscribe button
	d.append($('<a class="linkbtn">').attr('id','subscribe').text('Open in Application').attr('href',httpToFeed(feedUrl)));

	ph.append(d);
		
	body.append(ph);

	// Change opacity of header images on mouseover
	$('img','header').hover(
		function() {$(this).stop().animate({ opacity: 0.5 },0);},
		function() {$(this).stop().animate({ opacity: 1.0 },0);}
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
	
	// ARTICLES
	for(var j = 0; j < feed.items.length; j++) {
		
		var articleId = "article"+j;
		var article = $("<article>").attr("id", articleId);
		
		var artheader = $('<header>').addClass('artheader');

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
		
		if (articleDate!='Invalid Date'){
			
			if (articleDate.toLocaleDateString() == today){
				displayDate = articleDate.toLocaleTimeString();
			}
			else{
				displayDate = articleDate.toLocaleDateString();
			}
		}
				
		var date = $('<span class="elips adate">').text(displayDate);
		artheader.append(title).append(author).append(date);
		artheader.append($("<a class='readorig alink ext'>").attr({"href":l, "target":"_blank"}).text("Read article on "+l.split('/')[2]));
		article.append(artheader);

		h = $('<div class="abody">');
		h.append(feed.items[j].description);
		article.append(h);
		
		list.append(article);
	}
	
	body.append(list);
	
	// jFeed acknowledgement
	var ack = $('<div id="ack">');
	ack.html("RSS Menu extension (c) 2012-2013 <a href='http://calum.me'>Calum Benson</a>. This page made with <a href='https://github.com/jfhovinne/jFeed'>jFeed</a> by Jean-Francois Hovinne.");
	body.append(ack);
	
	document.title = feed.title + ' [' + feed.type.toUpperCase() + ' '+ feed.version + ']';
	
}