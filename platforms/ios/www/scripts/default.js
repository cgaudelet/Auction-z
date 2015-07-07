// jQuery no-double-tap-zoom plugin
// Triple-licensed: Public Domain, MIT and WTFPL license - share and enjoy!

(function($) {
 var IS_IOS = /iphone|ipad/i.test(navigator.userAgent);
 $.fn.nodoubletapzoom = function() {
 if (IS_IOS)
 $(this).bind('touchstart', function preventZoom(e) {
              var t2 = e.timeStamp
              , t1 = $(this).data('lastTouch') || t2
              , dt = t2 - t1
              , fingers = e.originalEvent.touches.length;
              $(this).data('lastTouch', t2);
              if (!dt || dt > 500 || fingers > 1) return; // not double-tap
              
              e.preventDefault(); // double tap - prevent the zoom
              // also synthesize click events we just swallowed up
              $(this).trigger('click').trigger('click');
              });
 };
 })(jQuery);


/* Gestion des langues */
if (localStorage.getItem("language") != null)
{
	/* Gestion des labels */
	var jsonLang = JSON.parse(localStorage.getItem("labels" + localStorage.getItem("language")));
}

/* Configuration WebService */
var webServiceUrl = "https://www.auction-z.com/xml";
var xmlHeader = "";
var xmlFooter = "";
xmlHeader += '<?xml version="1.0" encoding="utf-8" ?>';
xmlHeader += '<auctionz application_version="1.0.0" interface_version="1.0">';
xmlFooter += '</auctionz>';

/* Equivalent js de Request.QueryString[""] en c# */
function RequestQueryString(Key)
{
	var url = window.location.href;
	KeysValues = url.split(/[\?&]+/);
	for (i = 0; i < KeysValues.length; i++)
	{
		KeyValue = KeysValues[i].split("=");
		if (KeyValue[0] == Key)
		{
			return KeyValue[1];
		}
	}
}

window.onerror = function(message, url, lineNumber) {
    console.log("Error: "+message+" in "+url+" at line "+lineNumber);
}
 

/* MessageBox */
function ShowMessageBox(status, message)
{
	var sb = "";
	sb += '<div class="messageBoxWrapper">'
	sb += '  <div class="messageBoxCenter">'
	if (status == "success")
	{
		sb += '  <div id="messageBoxContent" class="messageBoxContent">';
	}
	else
	{
		sb += '  <div id="messageBoxContent" class="messageBoxContentError">';
	}

	sb += message;

	sb += '    </div>';
	sb += '  </div>';
	sb += '</div>';

	 $("#messageBox").append($(sb).delay(3000).animate({ opacity: 0 }, 1000, function () { $(this).remove(); }));
}


$(function() {


  //label_loading = (jsonLang.LABEL_LOADING != undefined)?jsonLang.LABEL_LOADING : 'Loading';
  label_loading = 'Loading';
  $('body').append('<div id="loading">'+label_loading+'...</div>');
    formatNumber = function(my_number)
    {
        var x1 = my_number.toFixed(0);
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1;
    }
    
    imageOrientation = function(element) {
		var img = document.getElementById(element);
		img_width = img.width; 
		img_height =img.height; 

		$('#'+element).removeClass('horizontal');
		$('#'+element).removeClass('vertical');
		
		if(img_width > img_height) {
			$('#'+element).addClass('horizontal');
			//console.log('horizontal');
		}
		else if(img_width < img_height){
			$('#'+element).addClass('vertical');
			//console.log('vertical');
		}
		//l'image est carre
		else {
			$('#'+element).addClass('carre');
			//console.log('carre');
		}
	}
	$(document).off('click','.goback');
    $(document).on('click','.goback',function(){
		window.location.href = $(this).data('url');
	});
	$(document).off('click','#bt_menu');
	$(document).on('click','#bt_menu', function(e){
	    if($(this).data('open') == 0) {
    	   $('#menu').animate({right :"0"},500); 
    	   $(this).data('open',1);
	    }
	    else {
	        $('#menu').animate({right :"-80%"},500); 
    	   $(this).data('open',0);
	    }
	    e.stopPropagation();
	});
	
	/* Gestion du right to left*/
    if (localStorage.getItem("language") == "ar")
	{
	    $("html")[0].dir = "rtl";
		$('body').addClass("body_ar");
    		
	}
  
  
  
  loadPushNotifs = function() {
  
  $("#notifs_title").html(jsonLang.LABEL_NOTIFICATIONS + '<div class="bt_close">X</div>');
    //on load les notifs
  	var xmlNotifs = xmlHeader + '<push_notifications />' + xmlFooter;
  	$.ajax({ type: "POST", url: webServiceUrl, data: { xml: xmlNotifs }, xhrFields: { withCredentials: true } }).done(
  	function (result)
  	{
  		if ($(result).find("message").text() != "You must logging")
  		{
            //on recupère la liste des notifs
  			var nb_new = $(result).find("push_notifications").attr("nb_new");
  			var nb_total = $(result).find("push_notifications").attr("nb_total");
  
  			if(nb_total > 0 ) {
  				$('#notifs_list').html('');
  
  				$("#notif_counter").html(nb_total);
  				if(nb_new > 0) {
  					$("#notif_counter").addClass('new');
  				}
  				
  				//on ajoute les notifs
  				$($.parseXML(result)).find("push_notification").each(function (indexNotif) {
  
  					current_notif = '<div class="notif" data-id="'+ $(this).attr("id_lot") +'">';
  					text = $(this).find("lot_label").text().replace(/"/g, '');
  					if(text != '') {
  						text += ' : ';
  					}
  					description = $(this).find("description").text().replace(/"/g, '');
  					
                    text += jsonLang[description];
  					current_notif += '<div class="description">'+text+'</div>';
  					current_notif += '</div>';
  
  					$('#notifs_list').append(current_notif);
  
  				});
                
                $("#notif_counter").show();
  			}
            else {
            	$("#notif_counter").hide();
            }
  
  		}
  	});
  }
  
  $(document).off('click','#notif_counter, #notifs_title .bt_close');
  $(document).on('click','#notif_counter, #notifs_title .bt_close',function() {
                 $('#notifs').slideToggle('top');
                 //console.log('toto');
                 var xmlNotifs = xmlHeader + '<push_notifications_reset />' + xmlFooter;
                 $.ajax({ type: "POST", url: webServiceUrl, data: { xml: xmlNotifs }, xhrFields: { withCredentials: true } }).done(function(result) {
                                                                                                                                   $("#notif_counter").removeClass('new');
                                                                                                                                   });
	});
   
  $(document).off('click','.notif');
  $(document).on('click','.notif',function() {
                 if($(this).data('id') != '') {
                 window.location = 'lot.html?l=' + $(this).data('id');
                 }
  });
	
});


function sendDeviceID(deviceId){
	//console.log('before');
    
	var xmlDevice = xmlHeader + '<subscribe_push_notification deviceId="'+deviceId+'" deviceOs="'+device.platform+'" />' + xmlFooter;
	
	//console.log(xmlDevice);
	$.ajax({ type: "POST", url: webServiceUrl, data: { xml: xmlDevice }, xhrFields: { withCredentials: true } }).done(function (result)
	{
		//console.log('in');
		if ($(result).find("subscribe_push_notification").attr("status") == "success")
		{
			//ShowMessageBox("info", $(result).find("message").text());
			localStorage.setItem("deviceID",deviceId);
		}
		else if($(result).find("message").text() == "You must logging")
		{
        	window.location = "login.html";
        }
        else {
			ShowMessageBox("error", $(result).find("message").text());
		}
		//console.log('after');
		}).fail(function(e,textStatus, errorThrown) {
	    //console.log( "sendDeviceID error : " + errorThrown );
	  });
}

function successHandler(result) {
	
    sendDeviceID(result);
}

function errorHandler(error) {
	console.log('errorHandler : '+ error);
}


// handle APNS notifications for iOS
    function onNotificationAPN(e) {
    // storage the e.id value  (the extra value sent in push notification)
    window.localStorage.setItem("push_que", e.id);
    var push_que=e.id;
    // if the push notification is coming inline
    if (e.foreground=="1")
    {
   // storage the e.numero value  (the extra value sent in push notification)
    window.localStorage.setItem("push_que", e.id);
    var push_que=e.id;
   /// some code here to open a message  if a new push is recieved inline
    ;}
    if ( event.alert )
    {
    navigator.notification.alert(event.alert);
    }
    if ( event.sound )
    {
    var snd = new Media(event.sound);
    snd.play();
    }
    if ( event.badge )
    {
    pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
    }
    }

function onNotificationGCM(e) {

    switch(e.event){
        case 'registered':
            if (e.regid.length > 0){
            	sendDeviceID(e.regid);
            }
        break;

        case 'message':
            if (e.foreground){
            	// When the app is running foreground. 
                //console.log("onNotificationGCMe.message : " + e.message);
                loadPushNotifs();
            }
        break;

        case 'error':
            console.log('onNotificationGCMe.error : ' + e.msg);
        break;

        default:
          //console.log('An unknown event was received');
          break;
    }
}

function init_push() {
	//on donne un id au body avec le device platform
	//$('body').attr('id',device.platform)
    
	if(localStorage.getItem("deviceID") == null) {
		var pushNotification = window.plugins.pushNotification;
		pushNotification.register(
		    successHandler,
		    errorHandler, 
		    {
		        'senderID':'683427540689',
		        'badge':'true',
		        'sound':'true',
		        'alert':'true',
		        'ecb':'onNotificationAPN' // callback function
		    }
		);
	}
    else {
        console.log('deviceID not null : ' + localStorage.getItem("deviceID"));
    }
	
}

