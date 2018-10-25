var requesturl = require('../../utils/util.js')
var HOST_URL = requesturl.HOST_URL
// pages/order-pingJia/order-pingJia.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputValue:'',
    orderId:'',
    orderDetail:{},
    submitDisable:true
  },
pro:function(){
wx:wx.navigateTo({
  url: '../product/product',
})
},

submitAssess: function () {
  wx.request({
    url: HOST_URL+'/customerService/addCustomerService',
    data: { 'token': wx.getStorageSync('token'),content: this.data.inputValue, orderId: this.data.orderId },
    method: 'POST',
    header: {
      'content-type': 'application/json' // 默认值
    },
    success: function (res) {
      if (res.data.code == 0) {
        wx.showToast({
          title: '申请售后成功',
          success: function () {
            wx.navigateTo({
              url: '../order/order',
            })
          }
        })
      }
    }
  })

},
bindTextArea: function (e) {
  var value = e.detail.value;
  if (e.detail.value) {
    this.setData({
      submitDisable: false
    });
  } else {
    this.setData({
      submitDisable: true
    });
  }
  this.setData({
    inputValue: value
  });
},
  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '申请售后',
    })
    this.setData({
      orderId: options.orderId
    });
    this.getOrderdetail();
  },
  getOrderdetail: function () {
    var self = this;
    wx.request({
      url: HOST_URL+'/order/getOrderById',
      data: { 'token': wx.getStorageSync('token'), 'orderId': this.data.orderId },
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        self.setData({
          orderDetail: res.data.data
        });
      }
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