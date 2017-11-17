/**
 * Created by Harry on 24/02/2017.
 */

$(document).ready( function () {
  $('#table_id tfoot th').each( function () {
    var title = $(this).text();
    if (title) {
      $(this).html( '<input type="text" title="' + title + '" placeholder="Search '+title+'" />' );
    }
  });

  var table = $('#table_id').DataTable({
    "serverSide": true,
    "processing": true,
    "ajax": function ( data, callback, settings ) {
      $.ajax({
        type: "POST",
        url: "notification/studentGet",
        dataType: "json",
        data: {dataTableData: data, email: window.localStorage.getItem('student')},
        error: function (response) {
        //  checkToken(response);
          console.log(JSON.parse(response.responseText).msg);
          callback({
            data: '',
            recordsTotal: 0,
            recordsFiltered: 0
          });
        },
        success: function (response) {
          callback({
            data: response.data,
            recordsTotal: response.recordsTotal,
            recordsFiltered: response.recordsFiltered
          });

          $(".showNotification").click(function () {
            $displayContent = $("#display-content");
            $displayContent.empty();
            $displayContent.append($(this).parent().find('.notification').html());

            $displayModal =$("#display-modal");
            $displayModal.modal();
          });
        }
      });
    },
    "order": [[4, 'desc']],
    "columns": [
      null,
      { "searchable": false },
      null,
      null,
      null,
    ],
    "initComplete": function () {
      table.columns().every( function () {
        var that = this;
        $( 'input', this.footer() ).on( 'keyup change', function () {
          if ( that.search() !== this.value ) {
            that
              .search( this.value )
              .draw();
          }
        } );
      });
    }
  });
});

$(document).ready(function(){
  $redirectHeading = $("#redirect-heading");
  $redirectHeading.attr("href", "/");
});

$("#redirect-heading").click(function () {
  console.log(1);
});
