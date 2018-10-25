var app = getApp();
var countdown = 60;
var settime = function (that) {
  if (countdown == 0) {
    that.setData({
      is_show: true
    })
    countdown = 60;
    return;
  } else {
    that.setData({
      is_show: false,
      last_time: countdown
    })

    countdown--;
  }
  setTimeout(function () {
    settime(that)
  }, 1000)
}
var requesturl = require('../../utils/util.js')
var HOST_URL = requesturl.HOST_URL
Page({

  data: {
    last_time: '',
    tel: '',
    code: '',
    is_show: true,
    telRule: false,
    codeRule: false,
    getcode:false
  },
  subm: function (e) {
    setTimeout(() => {
      var subValue = e.detail.value.input
      wx.showModal({
        title: (subValue),
        content: '',
      })
      if (subValue == null || subValue == "") {
        console.log("不能为空")
        this.setData(
          { popErrorMsg: "发布的留言内容不能为空" }
        );

      }
    }, 100)

  },
  tel: function (e) {
    var telRules = new RegExp(/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
    if (telRules.test(e.detail.value)){
      this.setData({
        tel: e.detail.value,
        telRule:true
      })
    }else{
      this.setData({
        tel: e.detail.value,
        telRule: false
      })
    }
  },
  code: function (e) {
    var codeRules = new RegExp(/^\d{6}$/);
    if (codeRules.test(e.detail.value)) {
      this.setData({
        code: e.detail.value,
        codeRule:true
      })
    }else{
      this.setData({
        code: e.detail.value,
        codeRule: false
      })
    }
  },
  clickVerify: function () {
    var that = this;
    var telRules = new RegExp(/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
    if (!telRules.test(that.data.tel )) {
      wx.showModal({
        title: '提示',
        content: '请输入正确的手机号',
        showCancel: false
      })
      return
    }
    wx.request({
      url: `${HOST_URL}/login/getIdentifyCode`,
      method: 'post',
      data: { 'phoneNo': that.data.tel },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: '发送成功',
          })
          that.setData({
            getcode:true
          })
        }else{
          countdown=0;
          that.setData({
            is_show: (!that.data.is_show)  //false
          })
      
          wx.showModal({
            title: '提示',
            content: '获取验证码失败',
            showCancel: false
          })
        }

      }
    })
    // 将获取验证码按钮隐藏60s，60s后再次显示
    that.setData({
      is_show: (!that.data.is_show)  //false
    })
    settime(that);
  },

  login: function () {
    var that = this;
    if (that.data.tel == '') {
      wx.showModal({
        title: '提示',
        content: '请输入正确的手机号',
        showCancel: false
      })
      return
    }
    if (that.data.code == '') {
      wx.showModal({
        title: '提示',
        content: '请输入验证码',
        showCancel: false
      })
    } else {
      wx.request({
        url: HOST_URL + '/login/loginByPhoneNo',
        method: 'post',
        data: {
          'phoneNo': that.data.tel,
          //'phoneNo':'18256934272',
          'identifyCode': that.data.code,
          'openId': app.globalData.openId
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          console.log(res.data)
          wx.setStorageSync('token', res.data.token)
          //wx.setStorageSync('token', '0b0a22d0-db5b-11e7-a46b-050be7729b77')
          if (res.data.code == 0) {
            wx.showToast({
              title: '登录成功',
            })
            wx.switchTab({
              url: '/pages/index/index',
            })
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.err,
              showCancel: false
            })
          }

        }
      })
    }

  },
  onLoad: function (options) {
    wx: wx.setNavigationBarTitle({
      title: '登录',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})


