// 弹框
var modal = function() {

    function Alert(cfg) {
        var defaultcfg = {};
        this.cfg = $.extend({}, defaultcfg, cfg);
        this.el = $(this.cfg.el)
        this.close = $(this.cfg.closeClass);
        this.btnBox = $(this.cfg.btnBoxClass);
    }

    Alert.prototype = {
        init: function() {
            this.el.hide();
            this.btn_event();
            this.close_event(this.cfg.endClose);
            return this;
        },
        show: function(cb) {
            this.el.show();
            cb && cb();
        },
        hide: function(cb) {
            this.el.hide();
            cb && cb();
        },
        btn_event: function() {
            var that = this;
            var items = this.btnBox.children();
            items.each(function(index, item) {
                var eventcfg = that.cfg.btnEvent[index];
                for (var key in eventcfg) {
                    $(this).on(key, eventcfg[key])
                }
            })

        },
        close_event: function(cb) {
            var that = this;
            this.close.on('click', function() {
                that.hide();
                cb && cb();
            })
        }
    }

    var init = function(cfg) {
        return new Alert(cfg).init();
    }

    return { init: init };
}();




var rule = modal.init({
    el: '#rule',
    closeClass: '.close',
})

// 规则
$('.rule').on('click', function() {
    rule.show()
})
//我的奖品
$('.myaward').on('click', function() {
    $('#myreward').css({
        'transform': 'translateX(0)',
        'webkitTransform': 'translateX(0)',
    })
})
$('.return').on('click', function() {
    $('#myreward').css({
        'transform': 'translateX(100%)',
        'webkitTransform': 'translateX(100%)',
    })
})

// 三个弹框
var result1 = modal.init({
    el: '#result1',
    closeClass: '.coupon-modal-close',
})
var result2 = modal.init({
    el: '#result2',
    closeClass: '.coupon-modal-close',
})
var result3 = modal.init({
    el: '#result3',
    closeClass: '.coupon-modal-close',
})


//开始
$('.pointer').on('click', function() {
    
    if (game.isRuning) {
        return false;
    }
    if (game.count<=0) {
        alert('没有抽奖机会了');
        return false;
    }
    game.isRuning = true;
    $('.DB_G_circle').hide();
    $('.DB_G_hand').hide();
    $.ajax({
        url:'https://www.easy-mock.com/mock/59e5b90705db1179c65de6fc/game/reward',
        method:'post',
        data:{},
        success:function(res){
            if(res.code == 200){
                game.resultindex = res.data.index;
                game.type = Number(res.data.type);
                game.deg = game.deg + (360 - game.deg % 360) + (360 * 10 - game.resultindex * (360 / game.num))
                game.chanceCount();
                game.runRotate(game.deg)
                game.rewardPush(res.data)
            }
        },
        error:function(){
            alert('与服务器通信出错,请重试~~')
        }
    })


})
var game = {
    isRuning:false,
    deg:0,
    num:6,
    count:6,
    resultindex:1,
    type:1,
    runRotate:function(deg){
        $('.turntable').css({
            'transform': 'rotate(' + deg + 'deg)',
            'webkitTransform': 'rotate(' + deg + 'deg)'
        })
    },
    chanceCount:function(){
        var num = $('#count').text() - 1;
        $('#count').text(num);
        game.count = num;
    },
    rewardPush:function(data){
        $('#emptyReward').remove();
        var item = '<a class="item" href="'+data.href+'">'+    
                        '<img  src="'+data.imgUrl+'">'+   
                        '<div class="item-info">'+
                           '<h3>'+data.prize+'</h3><span>有效期: '+data.effectTime+'</span>'+
                        '</div>'+
                   '</a>';
        $('.award-list').append(item)
    }


}

$('.turntable').on('transitionEnd webkitTransitionEnd', function() {
    // var type = Math.floor(Math.random() * 3 + 1)
    switch (game.type) {
        case 1:
            result1.show()
            break;
        case 2:
            result2.show()
            break;
        case 3:
            result3.show()
            break;
    }
    game.isRuning = false;
    $('.DB_G_circle').show();
    $('.DB_G_hand').show();

})


// 弹框表单
$('#getHuaFei').on('click',function(){

    if (!$('#code').val()||!/^1[3|4|5|7|8]\d{9}$/.test($('#phone').val())) {
        alert('请正确填写手机号和验证码')
        return false;
    }

    alert('恭喜你获得话费')

})
var Code = (function(){

    function PhoneCode(cfg){
        var dcfg = {
            url:"https://www.easy-mock.com/mock/59e5b90705db1179c65de6fc/game/sms?phone=",
            btn:'#getCode',
            input:'#phone',
        }
        this.cfg = $.extend({},dcfg,cfg);
        this.btn = $(this.cfg.btn);
        this.phone = $(this.cfg.input);
        this.init();
    }
    PhoneCode.prototype={
        regPhone: /^1[3|4|5|7|8]\d{9}$/,
        regCode: /^\d{4}$/,
        init:function(){
            var self = this;
            this.btn.on('click',function(e){
                self._event(e,self)
            });
        },
        _djs:function(time){
              var self = this;
              time = time?time:60;
              this.btn.text(time+'s后重发');
              var timer = setInterval(function(){
                time--;
                if (time == 0) {
                  clearInterval(timer);
                  self.btn.on('click',function(e){
                    self._event(e,self)
                  });
                  self.btn.text('获取验证码');
                }else{
                  self.btn.text(time+'s后重发');
                }
              }, 1000);
        },
        _ajax:function(){
            $.ajax({
              type:'GET',
              url:this.cfg.url+this.phone.val(),
              success:function(res){
                if (res.code == 200) {
                  alert('短信已发送')
                }else{
                  alert(res.message)
                }           
              },
              error:function(){
                alert('获取短信验证码失败')
              }
            })
        },
        _event:function(e,self){
            console.log(self);
            if (!self.regPhone.test( self.phone.val() )) {
                alert('手机号码格式错误')
                return false;
            }else{
                self._ajax();
                self._djs(60);
                self.btn.off('click');
            }
        }
    }
    var init = function(cfg){
        return new PhoneCode(cfg)
    }
    return {
        init:init
    }
})();


Code.init()
