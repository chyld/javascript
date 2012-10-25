var selected_color = null;

$(function(){

	$('#add').click(add_colors);
	$('#colors').on('hover', '.color', change_bg);
	$('#colors').on('dblclick', '.color', delete_color);
	$('#colors').on('click', '.color', toggle_select_color);
	$('#left').click(left);
	$('#right').click(right);

});

function add_colors()
{
	var colors = $('#colors_string').val();
	colors = colors.split(', ');
	for(var i = 0; i < colors.length; i++)
	{
		var color = $('<div>');
		color.addClass('color');
		color.css('background-color', colors[i])
		$('#colors').append(color);
	}
}

function change_bg()
{
	var color = $(this).css('background-color');
	$('#colors_string').css('background-color', color);
}

function delete_color()
{
	$(this).remove();
}

function toggle_select_color()
{
	if(selected_color != this)
	{
		$(selected_color).removeClass('selected');
		
		
		selected_color = this;
		$(selected_color).addClass('selected');
	}
	else
	{
		$(selected_color).removeClass('selected');		
		selected_color = null;
	}
}

function left()
{
	if(selected_color != null)
	{
		var previous = $(selected_color).prev();
		previous.before(selected_color);
	}
}

function right()
{
	if(selected_color != null)
	{
		var next = $(selected_color).next();
		next.after(selected_color);
	}
}
