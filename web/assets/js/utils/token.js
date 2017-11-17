var checkToken = function(param){
  console.log(JSON.parse(param.responseText).msg);
  if(JSON.parse(param.responseText).msg ===  "Token expires."){
    $("#session-modal").modal();
    //window.location.href = "/"
  }
}
