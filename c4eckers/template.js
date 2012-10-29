/* --------------------------------------------------------------- */
/* --------------------------------------------------------------- */
/* --------------------------------------------------------------- */

var players = [];
var whoami;
var turn = 1;
var selected_piece = null;

/* --------------------------------------------------------------- */
/* --------------------------------------------------------------- */
/* --------------------------------------------------------------- */

$(function(){

  subscribe();
  $('#name').focus();
  $('#join').click(join_game);
  $('#chat').click(send_chat_message);
  $('.square').click(select_or_move_piece);
  $('#endturn_button').click(send_end_turn_message);

});

/* --------------------------------------------------------------- */
/* --------------------------------------------------------------- */
/* --------------------------------------------------------------- */

function send_end_turn_message()
{
  if(is_current_player())
    PUBNUB.publish({channel: "c4eckers", message: {type: 'end', current_turn: turn}});
}

function end_turn(current_turn)
{
  if(current_turn == 4)
    turn = 1;
  else
    turn++
  
  selected_piece = null;
  update_player_display();
}

function update_player_display()
{
  $('.player').removeClass('active');
  $('.player').eq(turn - 1).addClass('active');
  $('td').removeClass('selected');
}

/* --------------------------------------------------------------- */
/* --------------------------------------------------------------- */
/* --------------------------------------------------------------- */

function select_or_move_piece()
{
  var piece_number = $(this).data('player');
  if(piece_number == undefined)
    piece_number = 0;

  if(piece_number == turn && is_current_player())
    send_select_piece_message(this);
    
  if((piece_number == 0) && (selected_piece != null) && is_current_player())
    try_move_piece(this);
}

function send_select_piece_message(piece)
{
  PUBNUB.publish({channel: "c4eckers", message: {type: 'select', turn: turn, row: $(piece).data('row'), col: $(piece).data('col')}});
}

function select_piece(who, row, col)
{
  $('td').removeClass('selected');
  selected_piece = $('td[data-row="' + row + '"][data-col="' + col + '"]').addClass('selected');
}

/* --------------------------------------------------------------- */
/* --------------------------------------------------------------- */
/* --------------------------------------------------------------- */

function try_move_piece(piece)
{
  switch(move_type(piece))
  {
    case 'move':
      send_move_message(piece);
      break;
    case 'jump':
      send_jump_message(piece);
      break;
  }
}

function move_type(piece)
{
  var cr = parseInt($(selected_piece).data('row'));
  var cc = parseInt($(selected_piece).data('col'));
  var fr = parseInt($(piece).data('row'));
  var fc = parseInt($(piece).data('col'));
  var is_king = parseInt($(selected_piece).data('king'));
  
  if((((fr == (cr+1))||(fr == (cr-1))) && ((fc == (cc+1))||(fc == (cc-1)))) && is_king)
    return 'move';

  if((!is_king && turn == 1) && ((fr == (cr+1))  &&  ((fc == (cc+1)) || (fc == (cc-1)))))
    return 'move';

  if((!is_king && turn == 2) && ((fc == (cc+1))  &&  ((fr == (cr+1)) || (fr == (cr-1)))))
    return 'move';

  if((!is_king && turn == 3) && ((fr == (cr-1))  &&  ((fc == (cc+1)) || (fc == (cc-1)))))
    return 'move';

  if((!is_king && turn == 4) && ((fc == (cc-1))  &&  ((fr == (cr+1)) || (fr == (cr-1)))))
    return 'move';

  if((((fr == (cr+2))||(fr == (cr-2))) && ((fc == (cc+2))||(fc == (cc-2)))) && is_king)
    return is_piece_jumpable(cr, cc, fr, fc);

  if((!is_king && turn == 1) && ((fr == (cr+2))  &&  ((fc == (cc+2)) || (fc == (cc-2)))))
    return is_piece_jumpable(cr, cc, fr, fc);

  if((!is_king && turn == 2) && ((fc == (cc+2))  &&  ((fr == (cr+2)) || (fr == (cr-2)))))
    return is_piece_jumpable(cr, cc, fr, fc);

  if((!is_king && turn == 3) && ((fr == (cr-2))  &&  ((fc == (cc+2)) || (fc == (cc-2)))))
    return is_piece_jumpable(cr, cc, fr, fc);

  if((!is_king && turn == 4) && ((fc == (cc-2))  &&  ((fr == (cr+2)) || (fr == (cr-2)))))
    return is_piece_jumpable(cr, cc, fr, fc);
}

function is_piece_jumpable(cr, cc, fr, fc)
{
  var jmp_row = ((fr - cr) / 2) + cr;
  var jmp_col = ((fc - cc) / 2) + cc;
  var piece = $('td[data-row="' + jmp_row + '"][data-col="' + jmp_col + '"]');
  var jmp_player = $(piece).data('player');
  
  if((jmp_player != undefined) && (jmp_player != turn) && (jmp_player != 0))
    return 'jump';  
}

function send_move_message(piece)
{
  PUBNUB.publish({channel: "c4eckers", message: {type: 'move', turn: turn, row: $(piece).data('row'), col: $(piece).data('col')}});
}

function send_jump_message(piece)
{
  PUBNUB.publish({channel: "c4eckers", message: {type: 'jump', turn: turn, row: $(piece).data('row'), col: $(piece).data('col')}});
}

function move_piece(who, row, col)
{
  var piece = $('td[data-row="' + row + '"][data-col="' + col + '"]');

  $(piece).css('background-color', players[who-1].color);
  $(piece).addClass('selected');
  if($(selected_piece).data('king') == 1)
    $(piece).addClass('kinged');
  $(piece).data('player', who);
  $(piece).data('king', $(selected_piece).data('king'));

  $(selected_piece).css('background-color', '#252525');
  $(selected_piece).removeClass('selected');
  $(selected_piece).removeClass('kinged');
  $(selected_piece).data('player', '0');
  $(selected_piece).data('king', '0');

  selected_piece = piece;
  determine_king_status();
  determine_winner();
}

function jump_piece(who, dest_row, dest_col)
{
  var src_row = $(selected_piece).data('row');
  var src_col = $(selected_piece).data('col');
  var kill_row = ((dest_row - src_row) / 2) + src_row;
  var kill_col = ((dest_col - src_col) / 2) + src_col;
  var piece = $('td[data-row="' + kill_row + '"][data-col="' + kill_col + '"]');
  $(piece).css('background-color', '#252525');
  $(piece).data('player', '0');
  $(piece).removeClass('kinged');
  
  move_piece(who, dest_row, dest_col);
}

function determine_king_status()
{
  var current_row = $(selected_piece).data('row');
  var current_col = $(selected_piece).data('col');
  
  if(((current_row == 12) && (turn == 1)) || ((current_col == 12) && (turn == 2)) || ((current_row == 1) && (turn == 3)) || ((current_col == 1) && (turn == 4)))
  {
    $(selected_piece).data('king', 1);
    $(selected_piece).addClass('kinged');
  }
}

function determine_winner()
{
  var row = $(selected_piece).data('row');
  var col = $(selected_piece).data('col');
  var king = $(selected_piece).data('king');
  
  if((turn == 1) && (king == 1) && (row < 4))
    show_winner();
  if((turn == 2) && (king == 1) && (col < 4))
    show_winner();
  if((turn == 3) && (king == 1) && (row > 9))
    show_winner();
  if((turn == 4) && (king == 1) && (col > 9))
    show_winner();
}

function show_winner()
{
  var winner = players[turn-1].name;
  $('#header').text(winner);
  turn = 0
  selected_piece = null;
  $('.player').removeClass('active');
  $('td').removeClass('selected');
  $('#endturn').empty();
}

/* --------------------------------------------------------------- */
/* --------------------------------------------------------------- */
/* --------------------------------------------------------------- */

function join_game()
{
  var name = $('#name').val();
  var color = $('#color').val();
  
  if(players.length < 4)
  {
    whoami = name;
    send_join_game_message(name, color);
  }
}

function send_join_game_message(name, color)
{
  PUBNUB.publish({channel: "c4eckers", message: {type: 'join', name: name, color: color}});
}

function add_player_to_game(name, color)
{
  turn = 1;
  players.push({name: name, color: color});
  var div = $('<div>');
  div.text(name);
  div.addClass('player');
  div.css('background-color', color);

  if(name == whoami)
    div.addClass('whoami');
  if(players.length == 1)
    div.addClass('active');

  $('#players').append(div);
  add_pieces_to_board(color, players.length);
}

function add_pieces_to_board(color, position)
{
  $('td[data-player="' + position + '"]').css('background-color', color);
}

/* --------------------------------------------------------------- */
/* --------------------------------------------------------------- */
/* --------------------------------------------------------------- */

function send_chat_message()
{
  PUBNUB.publish({channel: "c4eckers", message: {type: 'chat', name: whoami, message: $('#message').val()}});
}

function display_chat_message(name, message)
{
  var msg = name + ': ' + message;
  var div = $('<div>');
  div.text(msg);
  div.css('color', lookup_player(name).color);
  div.addClass('chat');
  $('#chats').prepend(div);
}

/* --------------------------------------------------------------- */
/* --------------------------------------------------------------- */
/* --------------------------------------------------------------- */

function lookup_player(name)
{
  for(var i = 0; i < players.length; i++)
    if(name == players[i].name)
      return players[i];
}

function is_current_player()
{
  var player = lookup_player(whoami);
  return (players.indexOf(player) + 1) == turn;
}

/* --------------------------------------------------------------- */
/* --------------------------------------------------------------- */
/* --------------------------------------------------------------- */

function subscribe()
{
  PUBNUB.subscribe({
       channel    : "c4eckers",
       restore    : false,
       callback   : receive_message,
       disconnect : disconnected,
       reconnect  : reconnected,
       connect    : connected,
       });
}

function receive_message(message)
{
  switch(message.type)
  {
    case 'join':
      add_player_to_game(message.name, message.color);
      break;
    case 'chat':
      display_chat_message(message.name, message.message);
      break;
    case 'end':
      end_turn(message.current_turn);
      break;
    case 'select':
      select_piece(message.turn, message.row, message.col);
      break;
    case 'move':
      move_piece(message.turn, message.row, message.col);
      break;
    case 'jump':
      jump_piece(message.turn, message.row, message.col);
      break;
  }
}

function disconnected()
{
  console.log('Disconnected.');
}

function reconnected()
{
  console.log('Reconnected.');
}

function connected()
{
  console.log('Connected.');
}

/* --------------------------------------------------------------- */
/* --------------------------------------------------------------- */
/* --------------------------------------------------------------- */
