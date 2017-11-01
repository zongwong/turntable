//csrf验证
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});
// 初始数据填充
$('#start_date').text(GAME.start_date);
$('#end_date').text(GAME.end_date);
$('#chanceTime').text(USER.harvests);

//奖品列表
if (GAME.raw !== null) {
    for (var i = 0; i < GAME.raw.length; i++){
        var reward = GAME.raw[i];
        if (reward.is_real) {
            var item = '<li class="reward_item"><div class="reward_item-title"><span>'+reward.level+'</span><span></span></div><div class="reward_item-info"><span>'+reward.prize+'</span><span></span></div> </li>';
            $('.reward_list').append(item)
        }
    }
}
//中奖记录
var maxRecord = PRIZES.length>30?30:PRIZES.length;
for (var i = 0; i < maxRecord; i++){
    var pr = PRIZES[i];
    // for (var j = 0; j < pr.reward.length; j++) {
        var item = '<li class="record_item"><img src="'+pr.avatar+'"><span class="user_name">'+pr.nickname+'</span><span class="reward_name">'+pr.reward[0].prize+'</span></li>';
        if (i === 0 ) {
            $('.record_list').empty()
        }
        $('.record_list').append(item)
    // }
}

//我的奖品
if (USER.reward !== null) {
    for (var i = 0; i < USER.reward.length; i++){
        var reward = USER.reward[i];
        var item = '<li class="reward_item userreward-item"><div class="reward_item-title"><span>'+reward.level+'</span><span></span></div><div class="reward_item-info"><span>'+reward.prize+'</span><span>'+reward.timestamp+'</span></div></li>';
        // var item ='<li class="reward_item userreward-item"><div class="userreward-item_info"><span>'+reward.prize+'</span><span>'+reward.timestamp+'</span></div><div class="userreward-item_title"><span class="userreward-item_price">价值:XXXX</span></div></li>'
        if (i === 0) {
            $('.userreward-list').empty()
        }
        $('.userreward-list').append(item)
    }
}
// 弹框
var modal = function (){

    function Alert(cfg){
        var defaultcfg = {};
        this.cfg = $.extend({},defaultcfg,cfg);
        this.el = $(this.cfg.el)
        this.close = $(this.cfg.closeClass);
        this.btnBox = $(this.cfg.btnBoxClass);
    }

    Alert.prototype = {
        init:function(){
            this.el.hide();
            this.btn_event();
            this.close_event(this.cfg.endClose);
            return this;
        },
        show:function(cb){
            this.el.show();
            cb && cb();
        },
        hide:function(cb){
            this.el.hide();
            cb && cb();
        },
        btn_event:function(){
            var that = this;
            var items = this.btnBox.children();
            items.each(function(index,item){
                var eventcfg = that.cfg.btnEvent[index];
                for(var key in eventcfg){
                    $(this).on(key,eventcfg[key])
                }
            })
            
        },
        close_event:function(cb){
            var that = this;
            this.close.on('click',function(){
                that.hide();
                cb && cb();
            })
        }
    }

    var init = function(cfg){
        return new Alert(cfg).init();
    }

    return {init:init};
}();
// 滚动
var scrollList = function (){

    function ScrollList(cfg){
        var defaultcfg = {};
        this.cfg = $.extend({},defaultcfg,cfg);
        this.wrap = $(this.cfg.wrap)
        this.powrap = $(this.cfg.powrap);
        this.item = $(this.cfg.item);
        this.timer = null;
    }

    ScrollList.prototype = {
        init:function(){
            this.run();
            this.event();
            return this;
        },
        run:function(){
            var that = this;
            that.clear();
            var length = this.powrap.children().length;
            this.item = $(this.cfg.item);
            if (length<3) {
                return false;
            }
            var i = 0;
            this.timer = setInterval(function(){
                var itemHeight = that.item.outerHeight();
                that.powrap.animate({
                    top:-itemHeight
                },'ease',function(){
                    that.powrap.css({
                        top:0
                    })
                    var clone = that.item.first().clone();
                    that.item.first().remove();
                    that.powrap.append(clone);
                    that.item = $(that.cfg.item);
                })
                
            },that.cfg.timeout)
        },
        event:function(){
            var that = this;
            // this.wrap.on('touchstart',function(){
            //     that.clear();
            // })
            // this.wrap.on('touchend',function(){
            //     that.run();
            // })
        },
        clear:function(){
            clearInterval(this.timer);
        }

    }

    var init = function(cfg){
        return new ScrollList(cfg).init();
    }

    return {init:init};
}();
//user
var game = {

    getResult:function(url,callback, data){
        $.ajax({
            url:url,
            method:'post',
            data:data,
            success:function(res){
                callback(res);
            },
            error:function(){

            }
        })
    },
    //次数减一
    gameCount:function(el,type){
        var now = parseInt($(el).text());
        if (type === 're') {
            now -=1;
        }else if(type === 'add'){
            now +=1;
        }
        now = now<0?0:now;
        $(el).text(now);
    }

}
//微信
wx.config(JSSDK);

wx.ready(function(){
    console.log('wx ready');
    wx.onMenuShareTimeline({
        title: GAME.share_title, // 分享标题
        link: GAME.share_url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: GAME.share_img, // 分享图标
        success: function (res) {
            game.getResult(BASE_URL + '/share', function (ret) {
                if (!ret.status){
                    alert(ret.message);
                }else{
                    game.gameCount('#chanceTime','add');
                }
            }, {
                game_id : GAME.id,
                open_id : USER.open_id
            });
        },
        cancel: function () {

        }
    });
    wx.onMenuShareAppMessage({
        title:GAME.share_title, // 分享标题
        desc: GAME.share_description, // 分享描述
        link: GAME.share_url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: GAME.share_img, // 分享图标
        success: function (res) {
            game.getResult(BASE_URL + '/share', function (ret) {
                if (!ret.status){
                    alert(ret.message);
                }else{
                    game.gameCount('#chanceTime','add');
                }
            }, {
                game_id : GAME.id,
                open_id : USER.open_id
            });
        },
        cancel: function () {

        }
    });
});
wx.error(function(res){
    console.log(res)
});