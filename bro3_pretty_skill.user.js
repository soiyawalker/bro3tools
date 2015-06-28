// ==UserScript==
// @name		bro3_pretty_skill
// @namespace	soiyawalker
// @description	ブラウザ三国志 回復系スキル実行ツール
// @include		http://*.3gokushi.jp/*
// @version		1.00
// @require		http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// @icon		http://pbs.twimg.com/profile_images/526631907543375872/eSaF5cj8.jpeg
// ==/UserScript==

// version //
// 1.0 とりあえず回復実行

jQuery.noConflict();

(function($) {
    // 対応スキル一覧
    var skills = [
        ["仁君", "sd001"],
        ["神医の術式", "sd003"],
        ["傾国", "sd004"],
        ["弓腰姫の愛", "sd001"],
        ["皇后の慈愛", "sd012"],
        ["神医の施術", "sd013"],
        ["桃色吐息", "sd017"],
        ["城壁補強", "sd005"],
        ["勇姫督励", "sd018"],
        ["優雅な調べ", "sd011"],
        ["劉備の契り", "sd022"],
        ["酔吟吐息", "sd026"]
    ];

    function addSkill(skillData) {
        var skillName = skillData[0] + "LV";
        var skillId = skillData[1];

        $(".cardStatusDetail:contains('" + skillName + "')").each(function(){
            if($(this).find(".set_release").length){
                if(!$(this).find("tr:contains('" + skillName + "')").hasClass("used")){
                    $(this).find("td:contains('" + skillName + "')")
                        .css("color","blue")
                        .css("cursor","pointer")
                        .click(function(){
                            if(confirm($(this).text()+"を使用しますか？")){
                                var cid = $(this).parents(".statusDetail").find(".thickbox").attr("href").match(/\d+/g)[2];
                                var vid = $(".attention_detail").find("option").eq($("li:has('.map-basing')").index($("li.on"))).val();
                                var sid = skillId + ($(this).text().match(/\d+/)[0]-1);
                                $(this).addClass("jinDisp").text("拠点確認中");
                                $.get("/card/domestic_setting.php",function(a){
                                    if(a.replace(/rowspan="\d"/g,"").replace(/\s/g,"").match("<td>内政中</td>")){
                                        alert("内政中の武将が居ます\n拠点を変更してください")
                                    }else{
                                        var b = {mode:"set",target_card:cid,ssid:$("#ssid").val()};
                                        b["selected_village["+cid+"]"] = vid;
                                        $(".jinDisp").text("拠点セット中");
                                        $.post("/card/deck.php",b,function(){
                                            $(".jinDisp").text("内政セット中");
                                            $.get("/card/domestic_setting.php?id="+cid+"&mode=domestic",function(){
                                                $(".jinDisp").text("発動中");
                                                $.get("/card/domestic_setting.php?mode=skill&id="+cid+"&sid="+sid,function(){
                                                    $(".jinDisp").text("内政解除中");
                                                    $.get("/card/domestic_setting.php?mode=u_domestic&id="+cid,function(){
                                                        $(".jinDisp").text("拠点解除中");
                                                        $.post("/card/deck.php",{mode:"unset",target_card:cid,ssid:$("#ssid").val()},function(){
                                                            $(".jinDisp").text("ページ更新中");
                                                            location.reload();
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    }
                                });
                            }
                        });
                }
            }
        });
    }

    $.each(skills, function(){
        addSkill(this);
    });

})(jQuery);
