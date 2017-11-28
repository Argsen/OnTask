/**
 * Created by Harry on 21/02/2017.
 */

var showTestNotification = window.localStorage.getItem('showTestNotification');
if (showTestNotification && showTestNotification == "true") {
  $("#checkbox2_0").prop('checked', true);
  window.localStorage.setItem('showTestNotification', showTestNotification);
} else {
  showTestNotification = "false";
  $("#checkbox2_0").prop('checked', false);
  window.localStorage.setItem('showTestNotification', showTestNotification);
}
$("#checkbox2_0").click(function () {
  if ($(this).prop('checked')) {
    showTestNotification = "true";
  } else {
    showTestNotification = "false";
  }
  window.localStorage.setItem('showTestNotification', showTestNotification);
  window.location.reload();
});

 $(document).ready(function(){
   /*----------------nav bar-----------------------*/

   var urlSign = window.location.href.split("/")[3];
   var searchQ;

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

   $redirectHeading =$("#redirect-heading");
   $redirectHeading.attr("href", "/action");

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
         data: {dataTableData: JSON.stringify(data), ruleId: window.localStorage.getItem('current_rule_id'), showTestNotification: showTestNotification},
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
             totalData: response.totalData,
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
     "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
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
     var params = 'ruleId=' + window.localStorage.getItem('current_rule_id') + '&dataTableData=' + encodeURIComponent(JSON.stringify(searchQ));
     window.open(window.location.href.split('/')[0] + '//' + window.location.href.split('/')[2] + '/notification/notificationExport?' + params);
   });
 });

 var nav = function(element, url) {
   element.on("click", function() {
     window.location = url;
   });
 }
