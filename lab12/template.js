$(function(){
     PUBNUB.subscribe({
          channel    : "ch1",      // CONNECT TO THIS CHANNEL.
          restore    : false,              // STAY CONNECTED, EVEN WHEN BROWSER IS CLOSED
                                           // OR WHEN PAGE CHANGES.
          callback   : function(message) { // RECEIVED A MESSAGE.
            console.log(message)
          },
          disconnect : function() {        // LOST CONNECTION.
            console.log('you are disconnecting');
          },
          reconnect  : function() {        // CONNECTION RESTORED.
            console.log('And we are back!');
          },
          connect    : function() {        // CONNECTION ESTABLISHED.
            console.log('connected');
          }
      });
      
      $('#b').click(chat_now);
});

function chat_now()
{
  PUBNUB.publish({
      channel : "ch1",
      message : {a:$('#t').val(), b:3}
    });
}
