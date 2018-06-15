var accessToken = document.cookie;
$("#getPlaylists").hide();
$("#authorize").hide();
$("#logOut").hide();
if(accessToken==undefined || accessToken=='' ) {
$("#authorize").show();
$("#getPlaylists").hide();
$("#logOut").hide();
}
else{
$("#authorize").hide();
$("#getPlaylists").show();
$("#logOut").show();
}

$("#logOut").click(function(){

	document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";	
	$("#authorize").show(); 
$("#getPlaylists").hide();
$("#logOut").hide();		
})

function getUserId(accessToken,callback){

$.ajax({
      type: "GET",
      url: "https://api.spotify.com/v1/me?access_token="+accessToken,
      dataType: 'json',
      success: function(data){
       var id = JSON.stringify(data["id"])
	callback(id);
      }
})

}

$("#getPlaylists").click(function(){



var accessTokenTemp = (document.cookie).split("=")
accessToken=accessTokenTemp[1]


var id;


getUserId(accessToken,function(data){
	id = data.replace(/['"]+/g, '')		

	$("button").hide();
$.ajax({
      type: "GET",
      url: "https://api.spotify.com/v1/users/"+id+"/playlists?access_token="+accessToken,
      dataType: 'json',
      success: function(data){
        listofPlaylists = data["items"]

        console.log(listofPlaylists.length)
        
        var count = 0;      
        listofPlaylists.forEach(function(item){
            var temp = document.createElement("button");
            var playlist = JSON.stringify(item["name"]).replace(/['"]+/g, '');
            temp.innerHTML = playlist
            temp.setAttribute('id',count)
            $('#test').append(temp)
            $('#test').append("<br>")
            $("#"+count).click(function(){
              $("#test").empty();
              console.log(item["name"]);
              addSong(item,accessToken,id);
            });
            ++count

        })
      }
}).done(function(data){console.log("hi")})
  
  $("button").hide();

})

});


var test;

function generateQuery(testString,item,accessToken,id) {

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

 $.ajax({
      type: "GET",
      url: query,
      dataType: 'json',
      success: function(data){
        $("#test").append("Adding song "+JSON.stringify(data["tracks"]["items"][0]["name"]))
        //$("a").attr("href", JSON.stringify(data["tracks"]["items"][0]["href"]))
	test = JSON.stringify(data["tracks"]["items"][0]["name"]);
 $.ajax({
 type:"POST",
  url: "https://api.spotify.com/v1/users/"+id+"/playlists/"+item["id"]+"/tracks?uris=" + (JSON.stringify(data["tracks"]["items"][0]["uri"])).replace(/['"]+/g, ''),
  headers: {"Authorization" : "Bearer " + accessToken},
  success: function(data){
	//$("#test2").append(JSON.stringify(data))
	$("#date").append("\n to playlist " + item['name'])
  },
  error: function(error){$("#test2").append(JSON.stringify(error))}
  
})
      },      
      error: function(error) {
        document.write("error")
      }
  })

}

function addSong(item,accessToken,id) {

chrome.tabs.getSelected(null, function (tab) {
  var url = new URL(tab.url)
  var domain = url.hostname
  
  if(domain=="www.youtube.com") {

chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
       generateQuery(tabs[0].title,item,accessToken,id);
	//alert(tabs[0].title)

});
}

else {alert('Please go to a valid Youtube page to add a song')}
});

}


