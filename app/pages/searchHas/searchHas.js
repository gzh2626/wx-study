var requesturl = require('../../utils/util.js')
var HOST_URL = requesturl.HOST_URL
// pages/searchHas/searchHas.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sortBy: 0,
    array3: [{
      message1: '新鲜蔬菜圆生菜沙拉菜球生菜西餐色拉菜 500g',
      qian: '￥100.00',
      guige: '规格：1.2斤',
      bi: 234,
      src1: '../img/tu1.png',
      num: 0
    }, {
      message1: ' 新鲜蔬菜 圆生菜 沙拉菜球生菜 新鲜农家菜圆白新鲜蔬菜 圆生菜 沙拉菜 500g',
      qian: '￥100.00',
      guige: '规格：1.2斤',
      bi: 234,
      src1: '../img/tu1.png',
      num: 0
    }, {
      message1: '新鲜蔬菜圆生菜沙拉菜球生菜西餐色拉菜 500g新鲜蔬菜圆生菜沙拉菜球生菜西餐色拉菜 500g新鲜蔬菜圆生菜沙拉菜球生菜西餐色拉菜 500g新鲜蔬菜圆生菜沙拉菜球生菜西餐色拉菜 500g',
      qian: '￥100.00',
      guige: '规格：1.2斤',
      bi: 234,
      src1: '../img/tu1.png',
      num: 0
    }, {
      message1: '新鲜蔬菜 圆生菜 沙拉菜球生菜 新鲜农家菜圆白新鲜蔬菜 圆生菜 沙拉菜 500g',
      qian: '￥100.00',
      guige: '规格：1.2斤',
      bi: 234,
      src1: '../img/tu1.png',
      num: 0,

    }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this

    console.log("搜索关键字", queryStr)
    console.log("排序", that.data.sortBy)
    var queryStr = wx.getStorageSync("queryStr")
    
    that.setData({
      queryStr: queryStr
    })
    this.getArr();
    //showView: (options.showView == "true" ? true : false)
  },
  getArr: function () {
    var that = this;
    wx.request({
      url: HOST_URL + `/goods/getGoodsList`,
      data: ({
        'queryString': that.data.queryStr,
        'token': wx.getStorageSync('token'),
        'sortBy': that.data.sortBy,
        'city': wx.getStorageSync('city')
      }),
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var searchArray = res.data.data.goodsList;
        for (var index in searchArray) {
          searchArray[index].num=0;
          searchArray[index].discountPrice = (searchArray[index].discountPrice * 0.01).toFixed(2);
        }
        that.setData({
          searchArray: searchArray,
        })
        that.setGoodList();
      }
    })
  },
  setGoodList: function () {
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
        var goodList = [];
        for (var i = 0; i < res.data.data.length; i++) {
          goodList[i] = {};
          goodList[i].id = res.data.data[i].goodsId;
          goodList[i].num = res.data.data[i].count;
          goodList[i].discountPrice = (res.data.data[i].goodsDiscountPrice * 0.01).toFixed(2);
        }
        that.setData({
          goodList: goodList,
          carList: res.data.data || []
        })
        that.setTypeArr();
      }
    })
  },
  setTypeArr: function () {
    var goodList = this.data.goodList;
    this.getTotalPrice();
    var typeArr = this.data.searchArray;
    for (var index = 0; index < typeArr.length; index++) {
      var num = 0
      for (var i = 0; i < goodList.length; i++) {
        if (goodList[i].id == typeArr[index].id) {
          typeArr[index].num = goodList[i].num
          break;
        } else if (i == goodList.length - 1) {
          typeArr[index].num = 0
        }
      }
      if (goodList.length == 0) {
        typeArr[index].num = 0
      }
    }
    this.setData({
      searchArray: typeArr
    })
  },
  getTotalPrice: function () {
    var goodList = this.data.goodList;
    var totalPrice = 0;
    var total = 0;
    for (var i = 0; i < goodList.length; i++) {
      totalPrice = Number((totalPrice + goodList[i].num * goodList[i].discountPrice).toFixed(2));
      total += goodList[i].num;
    }
    //debugger
    this.setData({
      totalPrice: totalPrice,
      total: total
    });
  },
  //按销量排序
  sortBySale(e) {
    var that = this
    var sortBy = that.data.sortBy
    if (sortBy == 3) {
      sortBy = 4
    } else {
      sortBy = 3
    }
    that.setData({
      sortBy: sortBy
    })
    this.getArr();
  },


  //按价格排序
  sortByPrice(e) {
    var that = this
    var sortBy = that.data.sortBy
    if (sortBy == 1) {
      sortBy = 2
    } else {
      sortBy = 1
    }
    that.setData({
      sortBy: sortBy
    })
    this.getArr();
  },

  //获取关键字
  searchInput: function (e) {
    console.log(e.detail.value)
    this.setData({
      queryStr: e.detail.value
    })
    wx.setStorageSync("queryStr", e.detail.value)
  },

  //重新输入关键字搜索
  search(e) {
    this.getArr();
  },

  //增加数量
  addNum(e) {
    var that = this
    var index = e.currentTarget.dataset.index;
    //var num = e.currentTarget.dataset.num;
    var searchArray = that.data.searchArray
    var goodList = this.data.goodList;
    var num = searchArray[index].num
    num++
    if (searchArray[index].isLimit == true) {
      if (searchArray[index].limitCount < num) {
        wx.showToast({
          title: '本商品限购' + searchArray[index].limitCount + '件',
        })
        return
      }
    }
    searchArray[index].num = num
    this.addCart(searchArray[index]);
    for (var i = 0; i < goodList.length; i++) {
      if (goodList[i].id == searchArray[index].id) {
        goodList[i].num = searchArray[index].num;
      } else if (i == goodList.length - 1) {
        goodList.push({ id: searchArray[index].id, num: searchArray[index].num, discountPrice: searchArray[index].discountPrice });
      }
    }
    if (goodList.length == 0) {
      goodList.push({ id: searchArray[index].id, num: searchArray[index].num, discountPrice: searchArray[index].discountPrice });
    }
    that.setData({
      searchArray: searchArray,
      goodList: goodList
    })
    this.getTotalPrice();
  },

  //减少数量
  minusNum(e) {
    var that = this
    var index = e.currentTarget.dataset.index;
    //var num = e.currentTarget.dataset.num;
    var searchArray = that.data.searchArray
    var goodList = this.data.goodList;
    if (searchArray[index].num == 0) {
      return;
    }
    searchArray[index].num--
    if (searchArray[index].num > 0) {
      this.addCart(searchArray[index]);
    } else {
      this.deleteCart(searchArray[index]);
    }
    for (var i = 0; i < goodList.length; i++) {
      if (goodList[i].id == searchArray[index].id) {
        if (searchArray[index].num == 0) {
          goodList.splice(i, 1);
          break;
        }
        goodList[i] = searchArray[index];
      }
    }
    that.setData({
      searchArray: searchArray,
      goodList: goodList
    })
    this.getTotalPrice();
  },


  //商品详情
  pro: function (e) {
    var num = e.currentTarget.dataset.num;
    var goodsId = e.currentTarget.dataset.goodsid;
    console.log(goodsId)
    wx: wx.navigateTo({
      url: `../product/product?goodsId=${goodsId}&&num=${num}`,
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

  },
  //去结算
  toPay(e) {
    var that = this
    this.updateCar();
  },
  updateCar: function () {
    var carList = this.data.carList;
    var that = this;
    var deleteArr = [];
    var goodsIdAndCountList = [];
    for (var i = 0; i < that.data.goodList.length; i++) {
      goodsIdAndCountList[i] = {};
      goodsIdAndCountList[i].goodsId = that.data.goodList[i].id;
      goodsIdAndCountList[i].count = that.data.goodList[i].num;
    }
    for (var i = 0; i < carList.length; i++) {
      if (deleteCar(carList[i])) {
        deleteArr.push(carList[i].id);
      }
    }
    var promiseOne = new Promise(function (resolve, reject) {
      if (deleteArr.length > 0) {//批量删除购物车
        wx.request({
          url: HOST_URL + `/shoppingCart/batchRemoveShoppingCart`,
          data: ({
            'token': wx.getStorageSync('token'),
            'shoppingCartIdList': deleteArr
          }),
          method: 'POST',
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            resolve(res.data.data);
          }
        })
      } else {
        resolve('');
      }
    });
    var promiseTwo = new Promise(function (resolve, reject) {
      wx.request({
        url: HOST_URL + '/shoppingCart/batchAddToShoppingCart',
        data: ({
          'token': wx.getStorageSync('token'),
          'goodsIdAndCountList': goodsIdAndCountList
        }),
        method: 'POST',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          resolve(res.data.data);
        }
      })
    });
    Promise.all([promiseOne, promiseTwo]).then(function (result) {
      wx.switchTab({
        url: '/pages/cart/cart',
      })
    })
    function deleteCar(item) {
      for (var i = 0; i < that.data.goodList.length; i++) {
        if (that.data.goodList[i].id == item.goodsId) {
          return false;
        }
      }
      return true;
    }
  },
  back:function(){
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  addCart: function (goods) {
    wx.request({
      url: HOST_URL + `/shoppingCart/addToShoppingCart`,
      data: ({
        'token': wx.getStorageSync('token'),
        "count": goods.num,
        "goodsId": goods.id
      }),
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {

      }
    })
  },
  deleteCart: function (goods) {
    var carList = this.data.carList;
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

        }
      })
    }

  }
})