var total = 0;

$(function(){

	$('#a10').click(a10);
	$('#a20').click(a20);
	$('#a30').click(a30);
	$('#red').click(red);
	$('#blue').click(blue);
	$('#n10').click(n10);
	$('#n20').click(n20);
	$('#n30').click(n30);

});

function a10()
{
	total += 10;
	$('#out').text(total);
}

function a20()
{
	total += 20;
	$('#out').text(total);
}

function a30()
{
	total += 30;
	$('#out').text(total);
}

function red()
{
	$('#out').css('background-color', '#ff33cc');
}

function blue()
{
	$('#out').css('background-color', '#3366ff');
}

function n10()
{
	total -= 10;
	$('#out').text(total);
}

function n20()
{
	total -= 20;
	$('#out').text(total);
}

function n30()
{
	total -= 30;
	$('#out').text(total);
}
