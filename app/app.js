//app.js
App({

  pro: function (e) {
    wx.navigateTo({
      url: 'product/product',
    })
    console.log(e);
  },
  onLaunch: function () {
    let self = this;
    var token = wx.getStorageSync('token');
    if (!token) {
      wx.redirectTo({
        url: "/pages/login/login",
      })
    } else {
      wx.redirectTo({
        url: '/pages/index/index',
      })
    }
    //调用微信登录接口  
    wx.login({
      success: function (loginCode) {
        var appid = 'wxae46580648be3544'; //填写微信小程序appid  
        var secret = 'b4137c5dfedd3311e03804bacf6cb462'; //填写微信小程序secret  
        //调用request请求api转换登录凭证  
        wx.request({
          url: 'https://api.weixin.qq.com/sns/jscode2session?appid='+appid+'&secret='+secret+'&grant_type=authorization_code&js_code=' + loginCode.code,
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            self.globalData.openId=res.data.openid;//获取openid  
          }
        })
      }
    })
    // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    // // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //   }
    // })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          getUserInfoFn();
        } else {
          wx.authorize({
            scope: 'scope.userInfo',
            success: res => {
              getUserInfoFn();
            }
          });
        }
        function getUserInfoFn() {
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              self.globalData.userInfo = res.userInfo;
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (self.userInfoReadyCallback) {
                self.userInfoReadyCallback(res);
              }
            }
          })
        }
      }
    })
  },

  // globalData: {
  //   userInfo: null
  // },
  request(params) {
    var url = this.baseRequestUrl + params.url;

    if (!params.type) {
      params.type = 'GET';
    }

    wx.request({
      url: 'http://cqsx-api.yuxisoft.cn' + params.url,
      data: params.data,
      method: params.type,
      header: {
        'content-type': 'application/json',
        'token': wx.getStorageSync('token')
      },
      success: res => params.sCallback && params.sCallback(res.data),
      fail: error => {
        console.log(error);
        params.eCallback && params.eCallback(error);
      }
    })
  },
  globalData: {
    userInfo:{},
    openId:''
  }
})