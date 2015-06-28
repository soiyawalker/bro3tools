// ==UserScript==
// @name		bro3_hide_ad
// @namespace	soiyawalker
// @description	ブラウザ三国志 広告非表示ツール
// @include		http://*.3gokushi.jp/*
// @version		1.00
// @require		http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// @icon		http://pbs.twimg.com/profile_images/526631907543375872/eSaF5cj8.jpeg
// ==/UserScript==

// version //
// 1.0 とりあえず広告削除

(function($) {
  var advId = "#banner_set";
  var newsId = "#whiteWrapper > div:nth-child(2) > iframe:nth-child(1)";
  
  $(advId).css("visibility", "hidden");
  $(advId).css("height", "0px");
  $(newsId).css("visibility", "hidden");

})(jQuery);
