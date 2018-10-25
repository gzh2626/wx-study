var app = getApp();
var requesturl = require('../../utils/util.js')
var HOST_URL = requesturl.HOST_URL
// pages/orderDetail/orderDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderId: options.orderId
    });
    wx.setNavigationBarTitle({
      title: '订单详情',
    });
    this.getOrderdetail();
    this.getGoodType();
  },
  goToLogistics: function () {
    wx.redirectTo({
      url: '../order-wuLiu/order-wuLiu?orderId=' + this.data.orderId,
    })
  },
  //确认收货
  confirmOrder: function (e) {
    var self = this;
    wx.showModal({
      title: '确定要确认收货吗?',
      success: function (res) {
        if (res.confirm) {
          var orderId = e.currentTarget.dataset.orderId;
          wx.request({
            url: HOST_URL + '/order/confirmReceivingOrder',
            data: { 'token': wx.getStorageSync('token'), orderId: orderId },
            method: 'POST',
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              wx.redirectTo({
                url: '/pages/order/order',
              })
            }
          })
        }
      }
    })
  },

  cancelOrder: function (e) {
    var self = this;
    wx.showModal({
      title: '确定要取消该订单吗?',
      success: function (res) {
        if (res.confirm) {
          var orderId = e.currentTarget.dataset.orderId;
          wx.request({
            url: HOST_URL + '/order/cancelOrder',
            data: { 'token': wx.getStorageSync('token'), orderId: orderId },
            method: 'POST',
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              wx.redirectTo({
                url: '/pages/order/order',
              })
            }
          })
        }
      }
    })
  },
  deleteOrder: function (e) {
    var self = this;
    wx.showModal({
      title: '确定要删除该订单吗?',
      success: function (res) {
        if (res.confirm) {
          var orderId = e.currentTarget.dataset.orderId;
          wx.request({
            url: HOST_URL + '/order/deleteOrder',
            data: { 'token': wx.getStorageSync('token'), orderId: orderId },
            method: 'POST',
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              wx.switchTab({
                url: '../my/my',
              })
            }
          })
        }
      }
    })
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
        var count = 0;
        for (var i = 0; i < res.data.data.goodList.length; i++) {
          count += res.data.data.goodList[i].count;
          res.data.data.goodList[i].goodsPrice = (res.data.data.goodList[i].goodsPrice*0.01).toFixed(2);
          res.data.data.goodList[i].goodsDiscountPrice = (res.data.data.goodList[i].goodsDiscountPrice*0.01).toFixed(2);
        } 
        res.data.data.totalAmount = (res.data.data.totalAmount*0.01).toFixed(2);
        res.data.data.vipScore = (res.data.data.vipScore).toFixed(2);
        res.data.data.count = count;
        if (res.data.data.payType==0){
          res.data.data.deposit = (res.data.data.totalAmount * 0.3).toFixed(2);
          res.data.data.remainingBalance  = (res.data.data.totalAmount * 0.7).toFixed(2);
        }
        self.setData({
          orderDetail: res.data.data,
          goodList: res.data.data.goodList,
          goodCategory: 'all'
        });
      }
    })
  },
  //提交订单
  payment() {
    var that = this
    var cartArray = that.data.orderDetail.goodList;
    var goodsIdAndCountList = []
    for (var i = 0; i < cartArray.length; i++) {
      var obj = {};
      obj.goodsId = cartArray[i].goodsId
      obj.count = cartArray[i].count
      goodsIdAndCountList.push(obj);
    }
    wx.showModal({
      title: '提示',
      content: '立刻支付',
      success: function (res) {
        if (res.confirm) {
          //支付定金
          if (that.data.orderDetail.payType == 0) {

            wx.request({
              url: HOST_URL + `/money/getWxPayInfo`,
              data: ({
                'token': wx.getStorageSync('token'),
                'openId': app.globalData.openId,
                'orderNo': that.data.orderDetail.orderNo,
                //'total_fee': that.data.totalPrice * 100
                'total_fee': Number((that.data.orderDetail.totalAmount * 0.3).toFixed(0))
              }),
              method: 'POST',
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                //console.log(that.data.data)
                wx.requestPayment({
                  'timeStamp': res.data.data.timeStamp,
                  'nonceStr': res.data.data.nonceStr,
                  'package': res.data.data.package,
                  'signType': 'MD5',
                  'paySign': res.data.data.paySign,
                  'success': function (res) {
                    wx.redirectTo({
                      url: '/pages/order/order',
                    })
                  },
                  'fail': function (res) {
                    // wx.showToast({
                    //   title: '支付失败',
                    // })
                  }
                })
              }
            })

          }
          //全款支付
          if (that.data.orderDetail.payType == 1) {

            // wx.navigateTo({
            //   url: '/pages/order-success/order-success',
            // })
            //获取支付参数
            wx.request({
              url: HOST_URL + `/money/getWxPayInfo`,
              data: ({
                'token': wx.getStorageSync('token'),
                'openId': app.globalData.openId,
                'orderNo': that.data.orderDetail.orderNo,
                'total_fee': Number(that.data.orderDetail.totalAmount*100).toFixed(0)
                //'total_fee': 1
              }),
              method: 'POST',
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                console.log(that.data.data)
                wx.requestPayment({
                  'timeStamp': res.data.data.timeStamp,
                  'nonceStr': res.data.data.nonceStr,
                  'package': res.data.data.package,
                  'signType': 'MD5',
                  'paySign': res.data.data.paySign,
                  'success': function (res) {
                    wx.redirectTo({
                      url: '/pages/order/order',
                    })
                  },
                  'fail': function (res) {
                    // wx.showToast({
                    //   title: '支付失败',
                    // })
                  }

                })
              }
            })
            //支付


          }
        } else if (res.cancel) {
          // wx.redirectTo({
          //   url: '/pages/order/order',
          // })
        }
      }
    })
  },
  getGoodType: function () {
    var self = this;
    wx.request({
      url: HOST_URL + '/order/getCategoryByOrderId',
      data: { 'token': wx.getStorageSync('token'), 'orderId': this.data.orderId },
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var goodType = res.data.data;
        goodType.unshift({ name: '全部', category: 'all' });
        self.setData({
          goodType: goodType
        });
      }
    })
  },
  fliterGoodList: function (e) {
    var goodCategory = e.currentTarget.dataset.goodCategory;
    var goodList = [].concat(this.data.orderDetail.goodList);
    if (goodCategory != 'all') {
      for (var i = 0; i < goodList.length; i++) {
        if (goodList[i].goodsCategory != goodCategory) {
          goodList.splice(i, 1);
          i--;
        }
      }
    }
    this.setData({
      goodList: goodList,
      goodCategory: goodCategory
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

  },
  toDetail: function (e) {
    var that = this
    var goodsId = e.currentTarget.dataset.goodId;
    wx.navigateTo({
      url: `../product/product?goodsId=${goodsId}`
    })
  }
})