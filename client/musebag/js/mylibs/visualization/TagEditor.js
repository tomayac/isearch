TagEditor = function(tags, callBack) {	
	this.tags = tags ;
	this.callBack = callBack ;
	
	this.show() ;
};	

var p = TagEditor.prototype;	

p.show = function()
{
	var popupDiv = $('<div/>', { id: "tags-popup", "class": "tag-editor", title: "Add/Edit Tags"} ) ;
	var tagsDiv = $('<div/>', { "class": "tags-container" }).appendTo(popupDiv) ;
	
	this.tagsContainer = tagsDiv ;
	
	var that = this ;
	
	for( var tag in this.tags )
	{
		this.appendTagBox(tag, tagsDiv) ;
	}
	
	var addTagDiv = $('<div/>').appendTo(tagsDiv) ;
	var tagInput = $('<input/>', { "class": "add-tag-input",  value:"add a tag",  autocomplete: "off" }).appendTo(addTagDiv) ;
	
	this.tagsInput = addTagDiv ;
	
	$(tagInput).keydown(function(event) {
		if (event.keyCode == '13') {
		
			that.addTag($(this).attr("value")) ;
			$(this).attr("value", "") ;
			event.preventDefault();
		}
   }) ;
   
   $(tagInput).focus(function(event) {
		$(this).attr("value", "") ;
	}) ;

	var tagsClear = $('<div/>', { "class": "tags-clear" }).appendTo(addTagDiv) ;
		
	$(popupDiv).dialog( { 
		close: function(event, ui) 	{ 
			that.callBack(that.tags)
		}
	}) ;

} ;

p.appendTagBox = function(tag, tagsDiv)
{
	var tagBox = $('<span/>', { "class": "tag", "tag": tag, text: tag + "  " }) ;
	
	if ( tagsDiv ) tagBox.appendTo(tagsDiv) ;
	else  {
		var sel = $('.tag', this.tagsContainer).last() ;
		if ( sel.length == 1 ) tagBox.insertAfter(sel) ;
		else tagBox.insertBefore(this.tagsInput) ;
	}
	var deleteTag = $('<a/>', { "title": "remove tag", href: "javascript:void(0);", text: "x" }).appendTo(tagBox) ;
	
	var that = this ;	
	$(deleteTag).click(function() {
		var box = $(this).parent() ;
		var tag = box.attr("tag") ;
		if ( that.tags[tag] == 0 ) that.tags[tag] = 1 ;
		else delete that.tags[tag] ;
		
		$('.add-tag-input', that.tagsContainer).attr("value", "add a tag") ;
		
		box.remove() ;
	}) ;	
};

p.addTag = function(tag)
{
	if ( !this.tags.hasOwnProperty(tag) || this.tags[tag] == 1 )
	{
		this.appendTagBox(tag) ;
		
		this.tags[tag] = 2 ;
	}
}
	



