var counter = 0;

$(function(){

	setInterval(display_more, 100);

});

function display_more()
{
	var d = $('<div>');
	d.addClass('funky');
	$('#test').prepend(d);
	counter++;
	var color1 = counter % 256;
	var color2 = (counter * counter) % 256;
	var color3 = (counter * counter * counter) % 256;

	var color_string = 'rgb('+ color1 +', '+ color2 +', '+ color3 +')';
	d.css('background-color', color_string);
}

function display_text()
{
	$('#test').text('hello world');
}
