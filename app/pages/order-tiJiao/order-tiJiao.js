// pages/orderDetail/orderDetail.js
var app = getApp();
var requesturl = require('../../utils/util.js')
var HOST_URL = requesturl.HOST_URL
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array1: [{
      src: '../img/pro1.png',
      title: '新鲜蔬菜 圆生菜沙拉菜球500g',
      guiGe: '规格：1.2斤'
    },
    {
      src: '../img/pro1.png',
      title: '新鲜蔬菜 圆生菜沙拉菜球500g',
      guiGe: '规格：1.2斤'
    }
    ],
    // cartArray: [],
    stationId: 0,
    pickUpAddressName: '',
    payType: 1,
    //goodsIdAndCountList:[{}]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    console.log("缓存里面的数据", wx.getStorageSync('cart-array'))
    var data;
    // this.setData({
    //   goodType: options.goodType //分类页跳过来则为true 否则为false
    // });
    // if (options.goodType) {
    //   var goodList = wx.getStorageSync('goodList');
    //   data = [];
    //   for (var i = 0; i < goodList.length; i++) {
    //     data[i] = {};
    //     data[i].goodsSpecification = goodList[i].specification;
    //     data[i].count = goodList[i].num;
    //     data[i].goodsId = goodList[i].id;
    //     data[i].goodsDiscountPrice = goodList[i].discountPrice;
    //     data[i].goodsName = goodList[i].name;
    //     data[i].goodsImg = goodList[i].img[0];
    //   }
    // } else {
    data = wx.getStorageSync('cart-array')
    //wx.removeStorageSync('cart-array');               //这之前有,之后没有
    var totalPrice = options.totalPrice
    //缓存里面的数据
    // console.log("缓存里面的数据", wx.getStorageSync('cart-array'))
    // console.log("#######data=", data)
    // console.log("####购物车里面的数据###", totalPrice)
    // console.log(data)
    that.setData({
      cartArray: data,
      totalPrice: totalPrice
    })

    //提货站点
    console.log(wx.getStorageSync('city'))
    wx.request({
      url: HOST_URL + `/pickUpAddress/getPickUpAddressByCity`,
      data: ({
        'token': wx.getStorageSync('token'),
        'city': wx.getStorageSync('city'),
      }),
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        for (var index in res.data.data) {
          res.data.data[index].id = index
        }
        that.setData({
          stationArray: res.data.data,
          pickUpAddressName: res.data.data[0].name
        })
      }
    })


    wx: wx.setNavigationBarTitle({
      title: '订单详情',
    })
  },


  //提交订单
  submit(e) {
    var that = this

    var cartArray = that.data.cartArray
    console.log(cartArray)
    var goodsIdAndCountList = []
    for (var i = 0; i < cartArray.length; i++) {
      var obj = {};
      obj.goodsId = cartArray[i].goodsId
      obj.count = cartArray[i].count
      obj.goodsPrice = (cartArray[i].goodsDiscountPrice * 100).toFixed(0);
      goodsIdAndCountList.push(obj);

    }
    wx.showModal({
      title: '提示',
      content: '确定提交订单吗?',
      success: function (res) {
        if (res.confirm) {
          that.deleteCars()
          //支付定金
          if (that.data.payType == 0) {
            wx.request({
              url: HOST_URL + `/order/generateOrder`,
              data: ({
                'token': wx.getStorageSync('token'),
                'totalAmount': that.data.totalPrice * 100,
                //'totalAmount':1,
                'payType': that.data.payType,
                'pickUpAddressName': that.data.pickUpAddressName,
                'deposit': Number((that.data.totalPrice * 30).toFixed(0)),
                //'deposit': 1,
                'remainingBalance': Number((that.data.totalPrice * 70).toFixed(0)),
                //'remainingBalance': 1,
                goodsIdAndCountList: goodsIdAndCountList
              }),
              method: 'POST',
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                console.log(res.data.data)
                if (res.data.code == 0) {
                  var orderNo = res.data.data.orderNo
                  wx.showModal({
                    title: '提示',
                    content: '立刻去支付',
                    success: function (res) {
                      if (res.confirm) {
                        wx.request({
                          url: HOST_URL + `/money/getWxPayInfo`,
                          data: ({
                            'token': wx.getStorageSync('token'),
                            'openId': app.globalData.openId,
                            'orderNo': orderNo,
                            'total_fee': Number((that.data.totalPrice * 100 * 0.3).toFixed(0))
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
                      } else if (res.cancel) {
                        wx.redirectTo({
                          url: '/pages/order/order',
                        })
                      }
                    }

                  })


                } else {
                  var err = res.data.err;
                  wx.showModal({
                    title: '提示',
                    content: err,
                    showCancel: false
                  })
                }
              }
            })
          }
          //全款支付
          if (that.data.payType == 1) {
            wx.request({
              url: HOST_URL + `/order/generateOrder`,
              data: ({
                'token': wx.getStorageSync('token'),
                'totalAmount': that.data.totalPrice * 100,
                //'totalAmount': 1,
                'payType': that.data.payType,
                'pickUpAddressName': that.data.pickUpAddressName,
                goodsIdAndCountList: goodsIdAndCountList
              }),
              method: 'POST',
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                console.log(res.data.data)
                if (res.data.code == 0) {
                  var orderNo = res.data.data.orderNo
                  wx.showModal({
                    title: '提示',
                    content: '立刻去支付',
                    success: function (res) {
                      if (res.confirm) {
                        //获取支付参数
                        wx.request({
                          url: HOST_URL + `/money/getWxPayInfo`,
                          data: ({
                            'token': wx.getStorageSync('token'),
                            'openId': app.globalData.openId,
                            'orderNo': orderNo,
                            'total_fee': Number(that.data.totalPrice * 100).toFixed(0)
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
                                console.log(that);
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
                      } else if (res.cancel) {
                        wx.redirectTo({
                          url: '/pages/order/order',
                        })
                      }
                    }
                  })
                  //支付
                } else {
                  var err = res.data.err;
                  wx.showModal({
                    title: '提示',
                    content: err,
                    showCancel: false
                  })
                }
              }
            })
          }
        } else if (res.cancel) {
          console.log("取消订单")
        }
      }
    })
  },
  deleteCars() {
    var shoppingCartIdList = [];
    var cartArray = this.data.cartArray
    for (var i = 0; i < cartArray.length; i++) {
      shoppingCartIdList.push(cartArray[i].id)
    }
    wx.request({
      url: HOST_URL + `/shoppingCart/batchRemoveShoppingCart`,
      data: ({
        'token': wx.getStorageSync('token'),
        shoppingCartIdList: shoppingCartIdList
      }),
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
    })
  },


  //选择站点
  selectStation(e) {
    var id = e.currentTarget.dataset.id;
    var place = e.currentTarget.dataset.place;
    this.setData({
      stationId: id,
      pickUpAddressName: place
    })
  },

  //选择支付方式
  payWay(e) {
    var payType = e.currentTarget.dataset.paytype;
    console.log("支付方式", payType)
    this.setData({
      payType: payType
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
    //this.onLoad();
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