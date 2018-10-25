var requesturl = require('../../utils/util.js')
var HOST_URL = requesturl.HOST_URL
// pages/my/my.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    user: {},
    phone: '',
    vipScore: '',
    AfterSalesNumber:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  toOrder: function (e) {
    var orderType;
    switch (e.currentTarget.dataset.orderType) {
      case 'all'://全部订单
        orderType = 0;
        break;
      case 'waitBuy'://待付款
        orderType = 6;
        break;
      case 'waitGet'://待收货
        orderType = 7;
        break;
      case 'waitAssess'://待评价
        orderType = 1;
        break;
      case 'afterSales'://售后
        orderType = 111;
        break;
    }
    wx.navigateTo({
      url: '../order/order?orderType=' + orderType,
    })
  },
  myjiFen: function () {
    wx.navigateTo({
      url: '../jiFen/jiFen',
    })
  },


  tui: function () {
    wx.showModal({
      title: '确定要退出账号吗?',
      success: function (res) {
        if (res.confirm) {
          wx.removeStorageSync('token')
          wx.redirectTo({
            url: '../login/login',
          })
        }
      }
    })
  },
  getUserInfo: function () {
    var self = this;
    wx.request({
      url: HOST_URL+'/user/getUserInfo',
      data: { 'token': wx.getStorageSync('token') },
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var data = res.data.data;
        self.setData({
          phone: data.phoneNo || '请用手机号登录',
          vipScore: data.vipScore.toFixed(2)
        });
      }
    })
  },
  getOrderNumber: function () {
    var self = this;
    wx.request({
      url: HOST_URL+ '/user/getOrderCount',
      data: { 'token': wx.getStorageSync('token') },
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var data = res.data.data;
        self.setData({
          orderNumber: data
        });
      }
    })
  },
  getAfterSalesNumber: function () {
    var self = this;
    wx.request({
      url: HOST_URL+'/customerService/getCustomerServiceOrderCountByUserId',
      data: { 'token': wx.getStorageSync('token') },
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var data = res.data.data;
        self.setData({
          AfterSalesNumber: data
        });
      }
    })
  },
  onLoad: function (options) {
    var token = wx.getStorageSync('token');
    if (!token) {
       wx.redirectTo({
        url: '../login/login',
      })
      return;
    };
    this.getUserInfo();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {//异步加载 空对象时第二次进入页面重新赋值
    if (Object.keys(this.data.user).length === 0) {
      var appInstance = getApp().globalData;
      this.setData({
        user: appInstance.userInfo
      });
    }
    this.getOrderNumber();
    this.getAfterSalesNumber();
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