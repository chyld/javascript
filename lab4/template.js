$(function(){

	$('#color_button').click(add_color);
	$('#colors').on('hover', '.color', hovering);

});

function hovering()
{
	$(this).toggleClass('hover');
}

function add_color()
{
	var color = $('#color_text').val();
	var d = $('<div>');
	d.addClass('color');
	d.css('background-color', color);
	$('#colors').append(d);
}
