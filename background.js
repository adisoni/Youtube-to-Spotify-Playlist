chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
	//alert("hi")

    var url = new URL(changeInfo.url)

	console.log(url);

    if(url.hostname=="github.com") {



    var urlParts = (url.hash).split("&") 
    temp = urlParts[0].split("=")
    accessToken=temp[1]
var d = new Date();

d.setTime(d.getTime() + (1*60*60*1000));
    var expires = "expires="+ d.toUTCString();

	document.cookie = "accessToken="+accessToken+";"+expires;
	
    }
})	

