// ==UserScript==
// @name		bro3_pretty_skill
// @namespace	soiyawalker
// @description	ブラウザ三国志 回復系スキル実行ツール
// @include		http://*.3gokushi.jp/*
// @version		1.0.2
// @require		http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// @icon		http://pbs.twimg.com/profile_images/526631907543375872/eSaF5cj8.jpeg
// ==/UserScript==

// version //
// 1.0.0 とりあえず回復実行
// 1.0.1 仁君が実行できなかったので修正
// 1.0.2 鹵獲系スキルの対応

jQuery.noConflict();

(function($) {
    // ******************************************************************************** //
    // 設定一覧
    // ******************************************************************************** //

    // 回復系対応スキル一覧
    var skills = [
        ["仁君", "sd000"],
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

    // 鹵獲系対応スキル一覧
    var rokakuSkills = [
        ["猛将の鹵獲", "sa019"],
        ["劉備の大徳", "at144"],
        ["鬼神の鹵獲", "at168"],
        ["趁火打劫", "at122"],
        ["迅速劫略", "at134"],
        ["神速劫略", "at150"]
    ];

    // 鹵獲先領地
    var targets = [
        ["森", 799, -795],
        ["岩", 794, -799],
        ["鉄", 800, -795],
        ["糧", 798, -791]
    ];

    // 資源比率
    // 木:石:鉄:糧
    // 0を指定すると鹵獲を出さなくなります
    // 近衛向けに石と鉄を重視する：木:石:鉄:糧 = 0:6:10:0
    var resourceRates = "0:6:10:0";

    // ******************************************************************************** //
    // 回復系スキルの実行
    // ******************************************************************************** //
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

    // ******************************************************************************** //
    // 鹵獲系スキルの実行(デッキに挙げてないカード)
    // ******************************************************************************** //
    // 資源量の取得
    var resources = [
        $("#wood").text(), $("#stone").text(), $("#iron").text(), $("#rice").text()
    ];

    var resourceRateArray = resourceRates.split(":");
    var currentResourceRates = [
        resources[0] / (resourceRateArray[0] + 0.001),
        resources[1] / (resourceRateArray[1] + 0.001),
        resources[2] / (resourceRateArray[2] + 0.001),
        resources[3] / (resourceRateArray[3] + 0.001)
    ];

    var targetIndex = 0;
    var targetRate = currentResourceRates[0];
    for(var i = 1; i < 4; i++){
        if (currentResourceRates[i] < targetRate) {
            targetRate = currentResourceRates[i];
            targetIndex = i;
        }
    }

    function addRokakuSkill(skillData) {
        var skillName = skillData[0] + "LV";
        var skillId = skillData[1];

        var target = targets[targetIndex];
        var targetName = target[0];
        var targetX = target[1];
        var targetY = target[2];

        var confirmText = skillName + "を使用して" + "(" + targetX + ", " + targetY + ")" + targetName + "☆1に鹵獲しますか？";

        $(".cardStatusDetail:contains(" + skillName + ")").each(function(){
            if($(this).find(".set_release").length){
                if(!$(this).find("tr:contains(" + skillName + ")").hasClass("used")){
                    $(this).find("td:contains(" + skillName + ")")
                        .css("color","blue")
                        .css("cursor","pointer")
                        .click(function(){
                            if(confirm(confirmText)){
                                var cid = $(this).parents(".statusDetail").find(".thickbox").attr("href").match(/\d+/g)[2];
                                var vid = $(".attention_detail").find("option").eq($("li:has('.map-basing')").index($("li.on"))).val();
                                var sid = skillId + ($(this).text().match(/\d+/)[0]-1);
                                $(this).addClass("jinDisp").text("拠点確認中");
                                $.get("/card/domestic_setting.php", function(a){
                                    var b = {mode:"set",target_card:cid,ssid:$("#ssid").val()};
                                    b["selected_village["+cid+"]"] = vid;
                                    $(".jinDisp").text("拠点セット中");
                                    $.post("/card/deck.php",b,function(){
                                        //出兵処理
                                        var params = {};
                                        params["village_x_value"] = targetX;
                                        params["village_y_value"] = targetY;
                                        params["village_name"] = "";
                                        params["card_id"] = 212;
                                        params["radio_move_type"] = 302; // 殲滅戦
                                        params["show_beat_bandit_flg"] = 1;
                                        params["unit_assign_card_id"] = cid;
                                        params["use_skill_id["+cid+"]"] = sid;
                                        params["btn_send"] = "出兵";
                                        $(".jinDisp").text("出兵中");
                                        $.post("/facility/castle_send_troop.php", params, function(){
                                            $(".jinDisp").text("出兵完了");
                                            location.reload();
                                        });
                                    });
                                });
                            }
                        });
                }
            }
        });
    }

    $.each(rokakuSkills, function(){
        addRokakuSkill(this);
    });

})(jQuery);
