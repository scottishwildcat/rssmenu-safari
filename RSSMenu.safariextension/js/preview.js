/** Safari RSS Feed Extension                     **/
/** © 2012-2016 Calum Benson                      **/
/** Licence: None - public domain                 **/    

function displayFeed(feed, feedUrl, selectUrl){

	$("#loading").hide(); // Lose the progress indicator, we're done.
	
	var body = $("body");
	
	var ph = $("<header id='pageheader'>");


	// TITLE+DESCRIPTION DIV
	d = $("<div id='desc'>");
	
	var h = $("<h1 id='feedtitle' class='elips'>");
	h.text(feed.title);
	d.append(h);

	h = $("<h2 id='feeddesc'>").html(feed.description);
	h.text (h.text()); // Strip any html tags from feed description
	d.append(h);

	// Only show feed URL if we're pre-selecting it
	if (selectUrl === "true"){
		h = $("<p>");
		h.append($("<a>").text(httpToFeed(feedUrl))
						 .attr('href', httpToFeed(feedUrl))
						 .attr('id','feedurl'));
		d.append(h);
	}
	
	ph.append(d);
		
	body.append(ph);
	
	// Pre-select URL if shown
	if (selectUrl === "true")
		selectText('feedurl');
		
	
	//CONTROLS DIV
	var d = $("<div id='controls'>");
		
	// BUTTONS
	var b1,b2,b3,b4;
	
	function toggleImages(){
		/* Return a function that shows or hides all <img> elements in the article list,
		   depending on whether they're currently shown or hidden. */
		   
		var visible=true; // Essentially a static used by the anon function returned
		return function(){
			if (visible==true){
				$("img","#alist").hide();
				$("#toggle-icon").attr('src','img/preview-images-off@2x.png')
								.attr('width','24px')
								.attr('height','24px');
				visible=false;
			}
			else{
				$("img","#alist").show();
				$("#toggle-icon").attr('src','img/preview-images-on@2x.png')
								.attr('width','24px')
								.attr('height','24px');
				visible = true;
			}
		}
	}
	
	// Expand all, collapse all, toggle image and visit homepage buttons
	var bdiv = $("<div id='toolbuttons'>");

	btnFeedHomepage = $('<a>').attr('href',feed.link)
				.attr('id','homepage')
				.attr('title','Visit Feed Homepage');

	btnToggleImages = $('<img>').attr('src','img/preview-images-on@2x.png')
					.attr('width','24px')
					.attr('height','24px')
					.attr('title','Toggle Images in Articles')
					.attr('id','toggle-icon');
	
	btnExpand = $('<img>').attr('src','img/preview-show@2x.png')
					.attr('width','24px')
					.attr('height','24px')
					.attr('title','Expand All Articles');
					
	btnCollapse = $('<img>').attr('src','img/preview-hide@2x.png')
					.attr('width','24px')
					.attr('height','24px')
					.attr('title','Collapse All Articles');					

	if (feed.link!=""){
		bdiv.append(btnFeedHomepage);
	}

	bdiv.append($('<button>').attr('id','toggle-images')
							.click(toggleImages()).append(btnToggleImages));
	
	bdiv.append($('<button>').attr('id','show-all')
						.click(function(){$(".readorig, .abody").show()})
						.append(btnExpand));
							
	bdiv.append($('<button>').attr('id','hide-all')
						.click(function(){$(".readorig, .abody").hide()})
						.append(btnCollapse));
								
	d.append(bdiv);
	
	//'Open in Application' button
	var d1 = $("<div id='open-in-app'>");
	d1.append($('<a class="pushbutton">').attr('id','subscribe')
									.text('Open in Application')
									.attr('href',httpToFeed(feedUrl)));
	d.append(d1);
	ph.append(d);
	
	


	// Change opacity of button icons on mouseover
	$('img','header').hover(
		function() {$(this).stop().animate({opacity: 0.5 },0);},
		function() {$(this).stop().animate({opacity: 1.0 },0);}
	);
	
	$('#homepage').hover(
		function() {$(this).stop().css('background-image','url(img/preview-webpage-hover@2x.png)')},
		function() {$(this).stop().css('background-image','url(img/preview-webpage@2x.png)')}
	);
              
	// ARTICLE LIST
	var list = $("<div id='alist'>");

	function t(id, url){
		// Return a function that toggles visibility of article with 
		// given DOM id if there is any body text, otherwise opens its 
		// url in a new tab.
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
	
	if (feed.items.length == 0){
		list.text("No articles found.");
	}
	else {
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
			var pubDate = new Date (Date.parse(feed.items[j].published));
			var upDate = new Date (Date.parse(feed.items[j].updated));
	
			var articleDate = (pubDate > upDate ? pubDate : upDate);
			
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
			
			artheader.append($("<a class='readorig alink ext'>")
						.attr({"href":l, "target":"_blank"})
						.text("Read article on "+l.split('/')[2]));
			article.append(artheader);
	
			h = $('<div class="abody">');
			h.append(feed.items[j].description);
			article.append(h);
			
			list.append(article);
		}
	}
	
	body.append(list);
	
	// jFeed acknowledgement
	var ack = $('<div id="ack">');
	ack.html("RSS Menu extension Copyright (c) 2012-2016 <a href='http://calum.me'>Calum Benson</a>. This page made with <a href='https://github.com/jfhovinne/jFeed'>jFeed</a> by Jean-Francois Hovinne.");
	body.append(ack);
	
	document.title = feed.title + ' [' + feed.type.toUpperCase() + ' '+ feed.version + ']';
	
}