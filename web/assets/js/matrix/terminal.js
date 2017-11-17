  jQuery(function ($, undefined) {
    $('#term').terminal(function (command, term) {
//      if (command !== '') {
//        var result = window.eval(command);
//        if (result != undefined) {
//          term.echo(String(result));
//        }
//      }

      $.ajax({
        type: 'POST',
        url: 'matrix/transform',
        dataType: 'json',
        data: {query: command},
        error:function(response){
          checkToken(response);
        },
        success: function (response) {
          console.log(response);
        }
      });

    }, {
      greetings: 'OnTask version 0.0.1 SQL Query Console',
      height: '100%',
      width: '100%',
      prompt: 'SQL> '
    });
  });
