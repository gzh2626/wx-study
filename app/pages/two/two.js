var requesturl = require('../../utils/util.js')
var HOST_URL = requesturl.HOST_URL
Page({

  data: {
    carts: [],
    minusStatus: 'disabled',
    index: 0,
    catalogSelect: 0,//判断是否选中
    num: '',
    fenLei: [],
    active: 'active',
    minusStatus: 'disabled',
    showView: false,
    categoryId: 0,
    sortBy: 0,
    array0: [{
      namr: '新鲜蔬菜',
      id: 0
    }, {
      namr: '肉禽',
      id: 1
    },
    {
      namr: '水产冻货',
      id: 2
    }, {
      namr: '蛋品肉类',
      id: 3
    }, {
      namr: '米面粮油',
      id: 4
    }, {
      namr: '休闲酒饮',
      id: 5
    }, {
      namr: '调料干货',
      id: 6
    }, {
      namr: '时令水果',
      id: 7
    }
    ],
    array: []
  },

  //页面初始加载函数
  onLoad: function (options) {
    var that = this;
    //this.getClass(0, 0)
    // this.setData({
    //   'categoryId': wx.getStorageSync('fenLei-id')||0
    // });
    // wx.setStorageSync('fenLei-id', '');
    wx: wx.setNavigationBarTitle({
      title: '分类',
    })
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight,
          scrollTop: 0
        });
      }
    });
    this.setData({
      page: 1
    });
    //showView: (options.showView == "true" ? true : false)
  },
  getTypeArr: function (reload) {
    var that = this
    var category = this.data.categoryId;
    var city = wx.getStorageSync('city');
    wx.request({
      url: HOST_URL + '/goods/getGoodsList',
      method: 'post',
      data: {
        'token': wx.getStorageSync('token'),
        'category': category,
        'city': city,
        'sortBy': that.data.sortBy,
        "page": 1,
        "perPage": 10
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        for (var i = 0; i < res.data.data.goodsList.length; i++) {
          res.data.data.goodsList[i].discountPrice = (res.data.data.goodsList[i].discountPrice * 0.01).toFixed(2);
          res.data.data.goodsList[i].price = (res.data.data.goodsList[i].price * 0.01).toFixed(2);
        }
        that.setData({
          typeArray: res.data.data.goodsList,
          totalCount: res.data.data.totalCount,
        })
        if (reload) {
          that.setGoodList();
        } else {
          that.setTypeArr();
        }
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
    var typeArr = this.data.typeArray;
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
      typeArray: typeArr
    })
  },

  //切换分类
  change: function (e) {
    var that = this
    this.setData({
      categoryId: e.currentTarget.dataset.id,
      scrollTop: 0
    });
    //wx.setStorageSync('goodList', this.data.goodList);
    this.getTypeArr();

    //that.onLoad()
  },

  //增加数量
  addCount(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var typeArray = that.data.typeArray
    var num = typeArray[index].num
    var goodList = this.data.goodList;
    num++
    if (typeArray[index].isLimit == true) {
      if (typeArray[index].limitCount < num) {
        wx.showToast({
          title: '本商品限购' + typeArray[index].limitCount + '件',
        })
        return
      }
    }
    typeArray[index].num = num
    this.addCart(typeArray[index]);

    for (var i = 0; i < goodList.length; i++) {
      if (goodList[i].id == typeArray[index].id) {

        goodList[i].num = typeArray[index].num;
      } else if (i == goodList.length - 1) {
        goodList.push({ id: typeArray[index].id, num: typeArray[index].num, discountPrice: typeArray[index].discountPrice });
      }
    }
    if (goodList.length == 0) {
      goodList.push({ id: typeArray[index].id, num: typeArray[index].num, discountPrice: typeArray[index].discountPrice });
    }
    that.setData({
      typeArray: typeArray,
      goodList: goodList
    })
    this.getTotalPrice();
  },

  // 减少数量
  minusCount(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var typeArray = that.data.typeArray
    var goodList = this.data.goodList;
    if (typeArray[index].num == 0) {
      return
    }
    typeArray[index].num--
    if (typeArray[index].num > 0) {
      this.addCart(typeArray[index]);
    } else {
      this.deleteCart(typeArray[index]);
    }
    for (var i = 0; i < goodList.length; i++) {
      if (goodList[i].id == typeArray[index].id) {
        if (typeArray[index].num == 0) {
          goodList.splice(i, 1);
          break;
        }
        goodList[i] = typeArray[index];
      }
    }
    that.setData({
      typeArray: typeArray,
      goodList: goodList
    })
    this.getTotalPrice();
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
  //商品详情
  pro: function (e) {
    var that = this
    var index = e.currentTarget.dataset.index;
    var id = e.currentTarget.dataset.id;
    var num = that.data.typeArray[index].num
    console.log(id)
    console.log(num)
    wx: wx.navigateTo({
      url: `../product/product?goodsId=${id}&&num=${num}`,
    })
  },


  //进入到搜索页面
  search: function () {
    wx: wx.navigateTo({
      url: '../search/search',
    })
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
    //that.onLoad();
    this.setData({
      scrollTop: 0
    });
    //wx.setStorageSync('goodList', this.data.goodList);
    this.getTypeArr();
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
    //that.onLoad();
    this.setData({
      scrollTop: 0
    });
    //wx.setStorageSync('goodList', this.data.goodList);
    this.getTypeArr();
  },
  //去结算
  toPay(e) {
    var that = this
    this.updateCar();


  },


  //监听页面变化函数
  onShow: function () {
    //this.onLoad();
    this.setData({
      'categoryId': wx.getStorageSync('fenLei-id') || 0
    });
    this.getTypeArr(true);
  },

  onHide: function () {
    var that = this;
    // wx.setStorageSync('goodList', this.data.goodList);
    wx.setStorageSync('fenLei-id', 0);
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
  onPull: function () {
    var that = this;
    var city = wx.getStorageSync('city');
    if (that.data.typeArray.length >= that.data.totalCount) {
      return
    }
    wx.request({
      url: HOST_URL + '/goods/getGoodsList',
      method: 'post',
      data: {
        'token': wx.getStorageSync('token'),
        'category': that.data.categoryId,
        'city': city,
        'sortBy': that.data.sortBy,
        "page": that.data.page + 1,
        "perPage": 10
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        for (var i = 0; i < res.data.data.goodsList.length; i++) {
          res.data.data.goodsList[i].discountPrice = (res.data.data.goodsList[i].discountPrice * 0.01).toFixed(2);
          res.data.data.goodsList[i].price = (res.data.data.goodsList[i].price * 0.01).toFixed(2);
        }
        var typeArray = that.data.typeArray.concat(res.data.data.goodsList);
        that.setData({
          typeArray: typeArray,
          totalCount: res.data.data.totalCount
        })
        that.setTypeArr();
      }
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