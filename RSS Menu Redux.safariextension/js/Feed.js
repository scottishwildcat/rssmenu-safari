/********************************************/
/* RSS Menu Extension - Feed class          */
/* (c) Calum Benson 2015                    */
/********************************************/

const GROUP_NONE 				=0;
const GROUP_YT_PLAYLIST 		=1;
const GROUP_YT_FAVOURITES 		=2;
const GROUP_YT_SUBSCRIPTIONS	=3;

var Feed = function(url, title, format, group){
	this.uri = canonize(absoluteUrl(url));
	this.title = ( title!==undefined ? title : "Untitled Feed" );
	this.format = ( format!==undefined ? format : "text/xml" );
	this.group = ( group!==undefined ? group : GROUP_NONE );
};