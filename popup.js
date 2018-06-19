hideAllElements();
checkIfLoggedIn();

function getCurrentTab(callback) {
chrome.tabs.getSelected(null, function (tab) {
  var url = new URL(tab.url)
  var domain = url.hostname
$("#songData").show()
  
  if(domain=="www.youtube.com") {

    //chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
       callback(tab.title)
//});
}

else {
$("#songData").show()
$("#songData").append("Please go to a valid <a href=http://www.google.com target=_blank>Youtube</a> link")
}
});
}

function hideAllElements() {
$("#getPlaylists").hide();
$("#authorize").hide();
$("#logOut").hide();
$("#songData").hide();
$("#choosePlaylist").hide()
}

function checkIfLoggedIn() {

var accessTokenTemp = (document.cookie).split("=")
accessToken=accessTokenTemp[1]

  if(accessToken==undefined || accessToken=='' ) {
$("#authorize").show();
  }
  else{
$("#logOut").show();
 ifLoggedIn(accessToken)
  }
}

function ifLoggedIn(accessToken) {
  getCurrentTab(function(title){
  getUserId(accessToken,function(userId) {
    getCurrentSong(title,accessToken,userId,function(songId){
  $("#getPlaylists").show();
      $("#getPlaylists").click(function(){
	getPlaylists(userId,accessToken,songId)	
      })
    })
  })
  })
}

function getPlaylists(userId,accessToken,songId){

  hideAllElements()
  $('#logOut').show();
  
  $.ajax({
      type: "GET",
      url: "https://api.spotify.com/v1/users/"+userId+"/playlists?access_token="+accessToken,

      dataType: 'json',
      success: function(data){
        listofPlaylists = data["items"]
        
        var count = 0;

	$("#choosePlaylist").show();


	console.log(JSON.stringify(data["items"][0]["images"][0]["url"]).replace(/['"]+/g, ''))
	
        listofPlaylists.forEach(function(item){
            var temp = document.createElement("button");
            var playlist = JSON.stringify(item["name"]).replace(/['"]+/g, '');
            temp.innerHTML ="<img src=" + JSON.stringify(item["images"][0]["url"]).replace(/['"]+/g, '') + ">" + "<div class=playlistInfo>" + "<h3>" + playlist + "</h3>" + "<p>" + JSON.stringify(item["tracks"]["total"]).replace(/['"]+/g, '') + " songs" + "</p>" + "</div>" 
            temp.setAttribute('id',count)
	    temp.style.margin = "0px"
	    temp.style.border = "0px"
	    temp.style.padding = "0px"
            $('#playlists').append(temp)
            $("#"+count).click(function(){
              $("#playlists").empty();
	      $("#choosePlaylist").hide(); 
	      addToPlaylist(userId,item["id"].replace(/['"]+/g, ''),item["name"].replace(/['"]+/g, ''),songId,accessToken);
            });
            ++count
        })
      }
})
}

function addToPlaylist(userId,playlistId,playlistName,songId,accessToken) {
  $('#songData').show()
$.ajax({
 type:"POST",
  url: "https://api.spotify.com/v1/users/"+userId+"/playlists/"+playlistId+"/tracks?uris=" +songId ,
  headers: {"Authorization" : "Bearer " + accessToken},
  success: function(data){
	$("#playlistName").append(" <H3 id=playlistName> has been added to playlist " + playlistName + "</H3>" )
  },
  error: function(error){$("#playlistName").append(JSON.stringify(error))}
  
})
}

function getUserId(accessToken,callback){

$.ajax({
      type: "GET",
      url: "https://api.spotify.com/v1/me?access_token="+accessToken,
      dataType: 'json',
      success: function(data){
       var id = JSON.stringify(data["id"])
	callback(id.replace(/['"]+/g, ''));
      }
})

}

function getCurrentSong(testString,accessToken,id,callback) {

var temp = testString.split("ft.");

var temp5 = temp[0].split("(Official")

var temp4 = temp5[0].split("(Ft.");

var temp3 = temp4[0].split("feat.")

var temp2 = temp3[0].split(") ");

if(typeof temp2[1]== 'undefined') {
var result = temp2[0].split("-")  
}
else{
var result = temp2[1].split("-")
}

var artistArraytemp = result[0].split("(")
var artistArray = artistArraytemp[0].split(" "	)
var trackArray = result[1].split(" ")

var query = 'https://api.spotify.com/v1/search?q=';

artistArray.forEach(function(item){
  if(item!="" && item!="x" && item!="X" && item!="and" && item!="&"){
  query = query + "artist:"+item+"%20"
  }
})

trackArray.forEach(function(item){
  if(item!=""){
  query = query + "track:"+item+"%20"
  }
})

query+="&type=track"

query+="&access_token="+accessToken
$('#songData').empty()
$('#songData').show()
$("body").css('width',"320px")

console.log(query)

 $.ajax({
      type: "GET",
      url: query,
      dataType: 'json',
      success: function(data){
	console.log(JSON.stringify(data["tracks"]["items"][0]["album"]["images"][0]["url"]).replace(/['"]+/g, ''))
	$("#songData").append("<img src=" + JSON.stringify(data["tracks"]["items"][0]["album"]["images"][0]["url"]).replace(/['"]+/g, '') + ">" + "<div class=playlistInfo>" + "<h3>" + JSON.stringify(data["tracks"]["items"][0]["name"]).replace(/['"]+/g, '') + "</h3>" + "<p>" + "By " + JSON.stringify(data["tracks"]["items"][0]["artists"][0]["name"]).replace(/['"]+/g, '') + "</p>"+ "</div>" );
	callback(JSON.stringify(data["tracks"]["items"][0]["uri"]).replace(/['"]+/g, ''))
      },      
      error: function(error) {
        document.write("error")
      }
  })

}

$("#logOut").click(function(){

	document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";	
	$("#authorize").show(); 
hideAllElements()	
$("#authorize").show();
})

