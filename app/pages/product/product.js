var requesturl = require('../../utils/util.js')
var HOST_URL = requesturl.HOST_URL
// pages/product/product.js

Page({
  data: {
    imgUrls: [
      '../img/pro1.png',
      '../img/pro1.png',
      '../img/pro1.png'
    ],
    indicatorDots: true,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    page: 1,
    perPage: 1,
    goodsCount: 1,
    shoppingCartId: '',
    sessionFrom: '',
    statusDisable:false
  },

  pingjia: function (e) {
    var goodsId = e.currentTarget.dataset.goodsid;
    wx.navigateTo({
      url: `../pingJia/pingJia?goodsId=${goodsId}`,
    })
  },

  //加入购物车
  into: function () {
    var that = this
    if (that.data.num > 0) {
      //加入购物车
      wx.request({
        url: HOST_URL + `/shoppingCart/addToShoppingCart`,
        data: ({
          goodsId: that.data.goodsId,
          'token': wx.getStorageSync('token'),
          count: that.data.num
        }),
        method: 'POST',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          if (res.data.code == 0) {
            wx.showToast({
              title: '加入购物车成功',
              icon: 'success',
              duration: 2000
            })
            // wx.showModal({
            //   title: '提示',
            //   content: '立刻前往购物车',
            //   success: function (res) {
            //     if (res.confirm) {
            //       wx.switchTab({
            //         url: `../cart/cart`,
            //       })
            //     } 
            //     // else if (res.cancel) {
            //     //   wx.switchTab({
            //     //     url: `../two/two`,
            //     //   })
            //     // }
            //   }
            // })
          } else {
            console.log("购物车添加失败")
          }
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '请选择商品数量',
        success: function (res) {

        }
      })
    }

  },

  //跳转到购物车页面
  toCart(e) {
    wx.switchTab({
      url: '/pages/cart/cart',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var goodsId = options.goodsId
    var num = options.num
    if (num == undefined) {
      num = 1
    }

    that.setData({
      goodsId: goodsId,
      num: num,
      reload: false,
    })

    // 商品详情
    wx.request({
      url: HOST_URL + `/goods/getGoodsById`,
      data: ({
        goodsId: goodsId,
        'token': wx.getStorageSync('token')
      }),
      header: {
        'content-type': 'application/json' // 默认值
      },
      method: 'POST',
      success: function (res) {
        if (res.data.code == 100) {
          wx.redirectTo({
            url: '/pages/login/login',
          })
        }
        if (res.data.data.status==1){
          that.setData({
            statusDisable: true
          })
        }
        console.log(res.data.data)
        res.data.data.discountPrice = (res.data.data.discountPrice * 0.01).toFixed(2)
        res.data.data.price = (res.data.data.price * 0.01).toFixed(2);
        that.setData({
          goodsDetail: res.data.data
        })
        that.getCart();
      }
    })

    //商品评价总数
    wx.request({
      url: HOST_URL + `/comment/getCommentCountByGoodsId`,
      data: ({
        goodsId: goodsId,
        'token': wx.getStorageSync('token'),
      }),
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data.data)
        that.setData({
          count: res.data.data
        })
      }
    })

    //商品评价
    wx.request({
      url: HOST_URL + `/comment/getCommentByGoodsId`,
      data: ({
        goodsId: goodsId,
        'token': wx.getStorageSync('token'),
        page: that.data.page,
        perPage: that.data.perPage
      }),
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log("#####商品评价###")
        console.log(res.data.data)
        that.setData({
          commentArray: res.data.data
        })
      }
    })



    wx.setNavigationBarTitle({
      title: '商品详情页'
    })
  },
  //获取购物车
  getCart() {
    var that = this;
    //获取购物车列表
    wx.request({
      url: HOST_URL + `/shoppingCart/openShoppingCart`,
      data: ({
        'token': wx.getStorageSync('token'),
      }),
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        //没有权限,返回登录页面
        if (res.data.code == 100) {
          wx.redirectTo({
            url: `../login/login`
          })
        }
        var cartDetail = {};
        var carLength = 0;
        for (var i = 0; i < res.data.data.length; i++) {
          carLength += res.data.data[i].count;
          if (res.data.data[i].goodsId == that.data.goodsDetail.id) {
            cartDetail = res.data.data[i];
            that.setData({
              num: cartDetail.count,
              cartId: cartDetail.id,
            })
          }
        }
        that.setData({
          carLength: carLength,
          carList: res.data.data
        })
      }
    })
  },
  //商品数量的加减

  //增加数量
  add(e) {
    var that = this;
    var num = that.data.num
    var goodsDetail = that.data.goodsDetail
    num++
    if (goodsDetail.isLimit == true) {
      if (goodsDetail.limitCount < num) {
        wx.showToast({
          title: '本商品限购' + goodsDetail.limitCount + '件',
        })
        return
      }

    }
    that.setData({
      num: num
    })
    this.addCart();
  },
  // 减少数量
  minus(e) {
    var that = this;
    var num = that.data.num
    if (num != 0) {
      num--
    }

    that.setData({
      num: num
    })
    if (num > 0) {
      this.addCart();
    } else {
      this.deleteCart();
    }
  },

  //立即购买
  buyNow() {
    var that = this
    var num = that.data.num
    if (num == 0) {
      wx.showModal({
        title: '提示',
        content: '请添加商品数量',
        showCancel: false
      })
    } else {
      var totalPrice = (that.data.num * that.data.goodsDetail.discountPrice).toFixed(2);
      var goodsDetail = that.data.goodsDetail
      console.log(goodsDetail)
      console.log(wx.getStorageSync("cart-array"))
      //var cartArray = []
      var cartArray = []
      var obj = {}
      obj.count = num
      obj.goodsDiscountPrice = Number(goodsDetail.discountPrice).toFixed(2);
      obj.goodsId = goodsDetail.id
      obj.goodsImg = goodsDetail.img[0]
      obj.goodsName = goodsDetail.name
      obj.goodsSpecification = goodsDetail.specification
      cartArray.push(obj)
      wx.setStorageSync("cart-array", cartArray)
      wx.navigateTo({
        url: `../order-tiJiao/order-tiJiao?totalPrice=` + totalPrice,
      })
    }
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
    var appInstance = getApp().globalData;
    this.setData({
      sessionFrom: "{city:" + wx.getStorageSync('city') + ",nickName: " + appInstance.userInfo.nickName + "}"
    });
    console.log(wx.getStorageSync('city'));
    if (this.data.reload) {
      this.getCart();
    } else {
      this.setData({
        reload: true
      })
    }
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
  addCart: function () {
    var that = this;
    wx.request({
      url: HOST_URL + `/shoppingCart/addToShoppingCart`,
      data: ({
        'token': wx.getStorageSync('token'),
        "count": this.data.num,
        "goodsId": this.data.goodsDetail.id
      }),
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.getCart();
        }
      }
    })
  },
  deleteCart: function () {
    var carList = this.data.carList;
    var goods = this.data.goodsDetail;
    var that=this;
    var shoppingCartId;
    for (var i = 0; i < carList.length; i++) {
      if (goods.id == carList[i].goodsId) {
        shoppingCartId = carList[i].id;
        break;
      }
    }
    if (shoppingCartId) {
      wx.request({
        url: HOST_URL + `/shoppingCart/removeShoppingCart`,
        data: ({
          'token': wx.getStorageSync('token'),
          "shoppingCartId": shoppingCartId
        }),
        method: 'POST',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          if (res.data.code == 0) {
            that.getCart();
          }
        }
      })
    }

  }
})