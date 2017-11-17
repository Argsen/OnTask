/*----------------- nav bar control -------------------------- */
$(document).ready(function() {

  // $('.tabs_data').tabslet({active: 1, mouseevent: 'click', attribute: 'href', animation: true});

  /*----------------nav bar-----------------------*/

  var urlSign = window.location.href.split("/")[3];

  switch (urlSign) {
    case "workflow":
      var $titleList = $("ul.nav li:eq(0)");
      $titleList.addClass("activated");
      break;
    case "data":
      var $titleList = $("ul.nav li:eq(1)");
      $titleList.addClass("activated");
      break;
    case "matrix":
      var $titleList = $("ul.nav li:eq(2)");
      $titleList.addClass("activated");
      break;
    case "action":
      var $titleList = $("ul.nav li:eq(3)");
      $titleList.addClass("activated");
      break;
    case "notification":
      var $titleList = $("ul.nav li:eq(4)");
      $titleList.addClass("activated");
      break;
    default:
  }

  var urlArr = ["/workflow", "/data", "/matrix", "/action", "/notification"];
  for (var i = 0; i < 5; i++) {
    var $list = $("ul.nav li:eq(" + i + ")");
    nav($list, urlArr[i]);
  }
  /*-----------------End nav bar----------------------*/

  /*------------------ grab ontask user info from local storage-----------------*/
  // var onTaskInfo = JSON.parse(window.localStorage.getItem('onTaskInfo'));
  //
  // var $overviewSubHeading = $("#notification-sub-heading");
  // if (onTaskInfo != null) {
  //   $overviewSubHeading.empty();
  //   var div = $("<i class='fa fa-user-circle' aria-hidden='true'></i><span class='name'>" + onTaskInfo.lastName
  //   + ',' + onTaskInfo.firstName + "</span>");
  //   $overviewSubHeading.append(div);
  //
  // } else {
  //   console.log("no local strorage");
  //   window.location.href = "/"
  // }

});

var nav = function(element, url) {
  element.on("click", function() {
    window.location = url;
  });
};

//$.ajax({
//  type: 'POST',
//  url: 'notification/getAll',
//  dataType: 'json',
//  data: {},
//  error: function (response) {
//    var tr = $('<tr></tr>');
//    $("#table_id tbody").append(tr);
//    tr.append('<td></td>');
//    tr.append('<td><div></div></td>');
//    tr.append('<td></td>');
//    tr.append('<td></td>');
//    tr.append('<td></td>');
//
//    $(document).ready( function () {
//      $('#table_id tfoot th').each( function () {
//        var title = $(this).text();
//        $(this).html( '<input type="text" placeholder="Search '+title+'" />' );
//      });
//
//      var table = $('#table_id').DataTable();
//
//      table.columns().every( function () {
//        var that = this;
//
//        $( 'input', this.footer() ).on( 'keyup change', function () {
//          if ( that.search() !== this.value ) {
//            that
//              .search( this.value )
//              .draw();
//          }
//        } );
//      });
//    });
//  },
//  success: function (response) {
//    if (response.status == 'success') {
//      for (var i=0; i<response.data.length; i++) {
//        var tr = $('<tr></tr>');
//        var button = $('<button class="btn btn-green">Show</button>');
//        var td = $('<td></td>');
//        $("#table_id tbody").append(tr);
//        tr.append('<td>' + response.data[i]['email'] + '</td>');
//        tr.append(td);
//        td.append(button);
//        td.append('<div class="notification" style="display: none;">' + response.data[i]['data'] + '</div>');
//        //  tr.append('<td><button>Show</button><div style="display: none;">' + response.data[i]['data'] + '</div></td>');
//        tr.append('<td>' + response.data[i]['type'] + '</td>');
//        tr.append('<td>' + response.data[i]['status'] + '</td>');
//
//        button.click(function () {
//          //console.log($(this).parent().find('.notification').html());
//
//          $displayContent = $("#display-content");
//          $displayContent.empty();
//          $displayContent.append($(this).parent().find('.notification').html());
//
//          $displayModal =$("#display-modal");
//          $displayModal.modal();
//
//        });
//
//        if (response.data[i]['createdAt']) {
//          var myDate = new Date(response.data[i]['createdAt']);
//          var day = myDate.getDate();
//          if (day < 10) {
//            day = '0' + day;
//          }
//          var month = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'][myDate.getMonth()];
//          var year = myDate.getFullYear();
//          var hour = myDate.getHours();
//          var minute = myDate.getMinutes();
//          if (minute < 10) {
//            minute = '0' + minute;
//          }
//
//          tr.append('<td>' + day + '/' + month + '/' + year + ' ' + hour + ':' + minute + '</td>');
//        } else {
//          tr.append('<td> </td>');
//        }
//      }
//
//      $(document).ready( function () {
//        $('#table_id tfoot th').each( function () {
//          var title = $(this).text();
//          $(this).html( '<input type="text" placeholder="Search '+title+'" />' );
//        });
//
//        var table = $('#table_id').DataTable();
//
//        table.columns().every( function () {
//          var that = this;
//
//          $( 'input', this.footer() ).on( 'keyup change', function () {
//            if ( that.search() !== this.value ) {
//              that
//                .search( this.value )
//                .draw();
//            }
//          } );
//        });
//      });
//    }
//  }
//});

$(document).ready( function () {
  var searchQ;

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
      searchQ = data;
      $.ajax({
        type: "POST",
        url: "notification/dataTableGet",
        dataType: "json",
        data: {dataTableData: JSON.stringify(data)},
        error: function (response) {
          checkToken(response);
          console.log(JSON.parse(response.responseText).msg);
          callback({
            data: [],
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
    "order": [[5, 'desc']],
    "columns": [
      null,
      { "searchable": false },
      null,
      null,
      null,
      null
    ],
    "initComplete": function () {
      var tempSearchSetTimeout;
      var tempColumnSearchValue;
      table.columns().every( function () {
        var that = this;
        $( 'input', this.footer() ).on( 'keyup change', function (e) {
          clearTimeout(tempSearchSetTimeout);
          tempColumnSearchValue = this.value;
          tempSearchSetTimeout = setTimeout(function () {
            if ( that.search() !== tempColumnSearchValue ) {
              that
                .search(tempColumnSearchValue)
                .draw();
            }
          }, 500);
        });
      });
    }
  });

  var dataTableSearchSetTimeout;
  var tempSearchValue;
  $('#table_id_filter input').unbind();
  $('#table_id_filter input').bind('keyup change', function(e) {
    clearTimeout(dataTableSearchSetTimeout);
    tempSearchValue = this.value;
    dataTableSearchSetTimeout = setTimeout(function () {
      table
        .search(tempSearchValue)
        .draw();
    }, 500);
  });

  $("#notificationExport").click(function () {
    var params = 'dataTableData=' + encodeURIComponent(JSON.stringify(searchQ));
    window.open(window.location.href.split('/')[0] + '//' + window.location.href.split('/')[2] + '/notification/notificationExport?' + params);
  });
});
