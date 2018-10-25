var app = getApp()
var requesturl = require('../../utils/util.js')
var HOST_URL = requesturl.HOST_URL
Page({
  data: {
    // 相当于使用过滤器的表达式
    orderList: [],
    array1: [{
      src: '../img/pro1.png',
      title: '新鲜蔬菜 圆生菜沙拉菜球500g',
      guiGe: '规格：1.2斤'
    }
    ],

    /** 
        * 页面配置 
        */
    winWidth: 0,
    winHeight: 0,
    // tab切换  
    currentTab: 0,
  },

  pro: function () {
    wx.navigateTo({
      url: '../product/product',
    })
  },
  kan: function () {
    wx.navigateTo({
      url: '../order-wuLiu/order-wuLiu',
    })
  },
  daiFuKuan: function () {
    wx.navigateTo({
      url: '../orderDetail/orderDetail',
    })
  },
  daiShouHuo: function () {
    wx.navigateTo({
      url: '../order-daiShouHuo/order-daiShouHuo',
    })
  },
  daiPingJia: function () {
    wx.navigateTo({
      url: '../order-daiPingJia/order-daiPingJia',
    })
  },
  pingJia: function () {
    wx.navigateTo({
      url: '../order-pingJia/order-pingJia',
    })
  },
  goToDetail: function (e) {
    var orderId = e.currentTarget.dataset.orderId;
    wx.navigateTo({
      url: '../orderDetail/orderDetail?orderId=' + orderId,
    })
  },
  onLoad: function (option) {
    wx.setNavigationBarTitle({
      title: '我的订单',
    })
    var orderType = option.orderType;
    switch (orderType) {
      case '0'://全部订单
        this.setData({
          currentTab: '0'
        });
        break;
      case '6'://待付款
        this.setData({
          currentTab: '1'
        });
        break;
      case '7'://待收货
        this.setData({
          currentTab: '2'
        });
        break;
      case '1'://待评价
        this.setData({
          currentTab: '3'
        });
        break;
      case '111'://售后
        this.setData({
          currentTab: '4'
        });
        break;
    };
    var that = this;
    this.getOrderList();
    /** 
     * 获取系统信息 
     */
    wx.getSystemInfo({

      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }

    });
  },
  /** 
     * 滑动切换tab 
     */
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
    this.getOrderList();

  },
  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {
    // wx.navigateTo({
    //   url: '/pages/order-pingjia/order-pingjia',
    // })
    var that = this;

    if (this.data.currentTab === e.currentTarget.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.currentTarget.dataset.current
      })
      this.getOrderList();
    }
  },

  getOrderList: function () {
    var orderType;
    switch (this.data.currentTab.toString()) {
      case '0'://全部订单
        orderType = undefined;
        this.getOrderListFn(orderType);
        break;
      case '1'://待付款
        orderType = 6;
        this.getOrderListFn(orderType);
        break;
      case '2'://待收货
        orderType = 3;
        this.getOrderListFn(orderType);
       //this.getWaitForReceive();
        break;
      case '3'://待评价
        orderType = 1;
        this.getOrderListFn(orderType);
        break;
      case '4'://售后
        this.afterSales();
        break;
    };
  },
  getOrderListFn: function (orderType) {
    var self = this;
    wx.request({
      url: HOST_URL + '/order/getOrderByUserId',
      data: { 'token': wx.getStorageSync('token'), 'status': orderType },
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var data = res.data.data;
        for(var i=0;i<data.length;i++){
          data[i].totalAmount = (data[i].totalAmount * 0.01).toFixed(2);
          data[i].vipScore = (data[i].vipScore).toFixed(2);
          for (var j = 0; j < data[i].goodsList.length;j++){
            data[i].goodsList[j].goodsDiscountPrice = (data[i].goodsList[j].goodsDiscountPrice * 0.01).toFixed(2);
            data[i].goodsList[j].goodsPrice = (data[i].goodsList[j].goodsPrice * 0.01).toFixed(2);
          }
        }
        self.setData({
          orderList: res.data.data
        });
      }
    })
  },
  // getWaitForReceive: function () {
  //   var self = this;
  //   var promiseOne = new Promise(function (resolve, reject) {
  //     wx.request({
  //       url: HOST_URL + '/order/getOrderByUserId',
  //       data: { 'token': wx.getStorageSync('token'), 'status': 3 },
  //       method: 'POST',
  //       header: {
  //         'content-type': 'application/json' // 默认值
  //       },
  //       success: function (res) {
  //         resolve(res.data.data);
  //       }
  //     })
  //   });
  //   var promiseTwo = new Promise(function (resolve, reject) {
  //     wx.request({
  //       url: HOST_URL + '/order/getOrderByUserId',
  //       data: { 'token': wx.getStorageSync('token'), 'status': 7 },
  //       method: 'POST',
  //       header: {
  //         'content-type': 'application/json' // 默认值
  //       },
  //       success: function (res) {
  //         resolve(res.data.data);
  //       }
  //     })
  //   });
  //   Promise.all([promiseOne, promiseTwo]).then(function (result) {
  //     var data = result[0].concat(result[1]);
  //     self.setData({
  //       orderList: data
  //     });
  //   })
  // },
  afterSales: function () {
    var self = this;
    wx.request({
      url: HOST_URL + '/order/getCustomerServiceOrderByUserId',
      data: { 'token': wx.getStorageSync('token') },
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        self.setData({
          orderList: res.data.data
        });
      }
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
              self.getOrderList();
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
              self.getOrderList();
            }
          })
        }
      }
    })
  },
  //提交订单
  payment(e) {
    var that = this
    this.setData({
      orderDetail: that.data.orderList[e.currentTarget.dataset.arrIndex]
    })
    var cartArray = that.data.orderDetail.goodsList;
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
                'total_fee': Number((that.data.orderDetail.totalAmount*100 * 0.3).toFixed(0))
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
        }
      }
    })
  },

}) 