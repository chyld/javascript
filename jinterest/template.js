var JinObject = null;

$(function(){
  $('#query').focus();
  $('#search').click(search_flickr);
  $('#results').on('click', '.result img', show_controls);
  $('#results').on('click', '.result input[type="button"]', create_jin);
  Parse.initialize("Np1hTMiqjsGc7Dton2uiKraCK0sRZ6pSPMHEvSPa", "q1RcZR56kiHic8eE8zBm3a3Qcx4YkozPtuEUBi4s");
  JinObject = Parse.Object.extend("JinObject");
  getJins();
});

function search_flickr()
{
	var search = $('#query').val();
	$.getJSON('http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=e0be04ac4bf315a5c31e21f0df569c2b&text=' + search + '&per_page=500&page=1&format=json&jsoncallback=?', dataReceived);	
}

function dataReceived(data)
{
  $.each(data.photos.photo, displayPhoto);
}

function displayPhoto(index, item)
{
	var src = "http://farm"+ item.farm +".static.flickr.com/"+ item.server +"/"+ item.id +"_"+ item.secret +"_m.jpg";
	var div = $('<div>');
	div.addClass('result');
	var img = $('<img>');
	img.attr('src', src);
	div.append(img);
	$('#results').prepend(div);
}

function show_controls()
{
  var box = $('<div>');
  box.addClass('control');
  var tb = $('<input>');
  tb.attr('type', 'text');
  tb.attr('placeholder', 'Enter a note');
  var button = $('<input>');
  button.attr('type', 'button');
  button.attr('value', 'Jin it!');
  box.append(tb);
  box.append(button);
  $(this).parent().append(box);
  tb.focus();
}

function create_jin()
{
  var img = $(this).parent().parent().children('img').attr('src');
  var txt = $(this).parent().children('input[type="text"]').val();

  var jin = new JinObject();
    jin.save({img: img,txt: txt}, {
    success: function(object) {
      getJins();
    },
    error: function(model, error) {}
  });
  
  $(this).parent().remove();
}

function getJins()
{
  var query = new Parse.Query(JinObject);
  query.ascending("createdAt");
  query.find({
    success: function(results) {
      showJins(results);
    },
    error: function(error) {}
  });
}

function showJins(results)
{
  $('#saved').empty();

  for(var i = 0; i < results.length; i++)
    showJin(results[i]);
}

function showJin(jin)
{
  var div = $('<div>');
  div.addClass('jin');
  var img = $('<img>');
  img.attr('src', jin.get('img'));
  img.attr('title', jin.get('txt'));
  div.append(img);
  $('#saved').prepend(div);
}
