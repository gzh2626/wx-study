var requesturl = require('../../utils/util.js')
var HOST_URL = requesturl.HOST_URL
// pages/order-pingJia/order-pingJia.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: '',
    inputValue: '',
    stars: [0, 1, 2, 3, 4],
    normalSrc: '../img/star2.png',
    halfSrc: '../img/star.png',
    key: 0,//评分
    submitDisable:true
  },
  pro: function () {
    wx: wx.navigateTo({
      url: '../product/product',
    })
  },
  pro: function () {
    wx.navigateTo({
      url: '../product/product',
    })
  },
  submitAssess: function () {
    var goodsIdList = [];
    this.data.orderDetail.goodList.forEach(function (item) {
      goodsIdList.push(item.goodsId);
    })
    wx.request({
      url: HOST_URL + '/comment/addComment',
      data: { 'token': wx.getStorageSync('token'), 'goodsIdList': goodsIdList, content: this.data.inputValue, starCount: this.data.key * 10, orderId: this.data.orderId },
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: '评价成功',
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
  selectLeft: function (e) {
    var key = e.currentTarget.dataset.selectIndex;
    if (this.data.key == 1 && e.currentTarget.dataset.selectIndex == 1) {
      //只有一颗星的时候,再次点击,变为0颗
      key = 0;
    }
    //console.log("得" + key + "分")
    this.setData({
      key: key
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '评价订单',
    })
    this.setData({
      orderId: options.orderId
    });
    this.getOrderdetail();
  },
  getOrderdetail: function () {
    var self = this;
    wx.request({
      url: HOST_URL + '/order/getOrderById',
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
  bindTextArea: function (e) {
    var value = e.detail.value;
    if (e.detail.value){
      this.setData({
        submitDisable: false
      });
    }else{
      this.setData({
        submitDisable: true
      });
    }
    this.setData({
      inputValue: value
    });
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