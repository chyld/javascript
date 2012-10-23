var balance = 1000;

$(function(){

	$('#amount').focus();
	$('#deposit').click(deposit);
	$('#withdraw').click(withdraw);

});

function deposit()
{
	var amount = $('#amount').val();
	amount = parseInt(amount);
	balance = balance + amount;
	updateBalance();
}

function withdraw()
{
	var amount = $('#amount').val();
	amount = parseInt(amount);
	balance = balance - amount;
	updateBalance();
}

function updateBalance()
{
	$('#balance').text(balance);
	
	if(balance < 0)
	{
		$('#output').css('background-color', 'red');
		$('#output').css('color', 'white');
	}
	else
	{
		$('#output').css('background-color', '#cccccc');
		$('#output').css('color', 'black');		
	}
}
