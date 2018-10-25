var app = getApp();

var requesturl = require('../../utils/util.js')
var HOST_URL = requesturl.HOST_URL
Page({
  data: {
    a: [],
    carts: [],
    tuiJian: [],
    hot: [],
    //minusStatus: 'disabled',
    //multiArray: [['上海', '江苏'], ['南京', '南通', '扬州', '镇江', '江阴', '张家港', '泰州', '靖江', '常州', '常熟', '太仓']],
    //multiArray: [['安徽', '江苏'],['合肥','南京']],
    multiIndex: [0, 0],
    city: '',
    page: 1,


    array: [{
      id: 0,
      message: '新鲜蔬菜',
      src: '../img/shuCai.png'
    }, {
      id: 1,
      message: '肉禽',
      src: '../img/rouQin.png'
    }, {
      id: 2,
      message: '水产冻货',
      src: '../img/haiXian.png'
    }, {
      id: 3,
      message: '蛋品豆面',
      src: '../img/dan.png'
    }, {
      id: 4,
      message: '米面粮油',
      src: '../img/you.png'
    }, {
      id: 5,
      message: '休闲酒饮',
      src: '../img/jiu.png'
    }, {
      id: 6,
      message: '调料干货',
      src: '../img/tiaoLia.png'
    }, {
      id: 7,
      message: '时令水果',
      src: '../img/shuiGuo.png'
    }
    ],
  },


  onLoad: function () {
    var that = this;
    console.log(wx.getStorageSync('token'))
    console.log(that.data.city)
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight
        });
      }
    });
    //获城市列表
    wx.request({
      url: HOST_URL + `/city/getCityList`,
      data: ({
        'token': wx.getStorageSync('token'),
      }),
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 100) {
          console.log("#######进来了######")
          that.skip()
        }
        var multiArray = [[], []];
        for (var index in res.data.data) {
          multiArray[0].push(index);
        }
        multiArray[1] = res.data.data[multiArray[0][0]];
        wx.setStorageSync('city', multiArray[1][0])

        // wx.showModal({
        //   title: '选择城市',
        //   content: '你当前选择城市:' + multiArray[1][0],
        //   success: function (res) {


        //   }
        // })
        that.setData({
          multiArray: multiArray,
          shadeShow: true,
          cityList: res.data.data,
          city: multiArray[1][0]
        });
        that.setCity();
      }
    })




    //当季爆款
    wx.request({
      url: HOST_URL + `/goods/getHotGoodsList`,
      data: ({
        'token': wx.getStorageSync('token'),
      }),
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log("当季爆款", res.data)
        if (res.data.code == 100) {
          console.log("#######进来了######")
          that.skip()
        }
        for (var index = 0; index < res.data.data.goodsList.length; index++) {
          res.data.data.goodsList[index].discountPrice = (res.data.data.goodsList[index].discountPrice * 0.01).toFixed(2);
        }
        that.setData({
          hot: res.data.data.goodsList
        })
      }
    })


    // //推荐菜品
    // wx.request({
    //   url: HOST_URL+`/goods/getRecommendGoodsList`,
    //   data: ({
    //     'token': wx.getStorageSync('token'),
    //   }),
    //   method: 'POST',
    //   header: {
    //     'content-type': 'application/json' // 默认值
    //   },
    //   success: function (res) {
    //     console.log("推荐菜品",res.data)
    //     if (res.data.code == 100) {
    //       that.skip()
    //     }

    //     for (var index in res.data.data) {
    //       var num = 0
    //       res.data.data[index].num = num;
    //       res.data.data[index].discountPrice = (res.data.data[index].discountPrice * 0.01).toFixed(2);
    //     }

    //     that.setData({
    //       tuiJian: res.data.data
    //     })
    //   }
    // })

  },
  //获取推荐菜品
  getTypeArr: function (reload) {
    var that = this
    wx.request({
      url: HOST_URL + `/goods/getRecommendGoodsList`,
      data: ({
        'token': wx.getStorageSync('token'),
        "page": that.data.page,
        "perPage": 10
      }),
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        for (var i = 0; i < res.data.data.goodsList.length; i++) {
          res.data.data.goodsList[i].discountPrice = (res.data.data.goodsList[i].discountPrice * 0.01).toFixed(2);
          res.data.data.goodsList[i].price = (res.data.data.goodsList[i].price * 0.01).toFixed(2);
        }
        that.setData({
          tuiJian: res.data.data.goodsList,
          totalCount: res.data.data.totalCount
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
          goodList[i].discountPrice = res.data.data[i].goodsDiscountPrice * 0.01;
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
    for (var index = 0; index < this.data.tuiJian.length; index++) {
      var num = 0
      for (var i = 0; i < goodList.length; i++) {
        if (goodList[i].id == this.data.tuiJian[index].id) {
          this.data.tuiJian[index].num = goodList[i].num
          break;
        } else if (i == goodList.length - 1) {
          this.data.tuiJian[index].num = 0
        }
      }
      if (goodList.length == 0) {
        this.data.tuiJian[index].num = 0
      }

    }
    this.setData({
      tuiJian: this.data.tuiJian
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
  //跳转到分类页面
  classify: function (e) {
    var id = e.currentTarget.dataset.id
    wx.setStorageSync('fenLei-id', id)
    wx.switchTab({
      url: `../two/two`
    })

  },


  //多列选择器
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
  bindMultiPickerChange: function (e) {
    //wx.removeStorage('city')
    console.log('picker发送选择改变，携带值为', e.detail.value)

    var value = e.detail.value;
    var cityName = this.data.multiArray[1][value[1]];
    wx.setStorageSync('city', cityName)
    this.setData({
      multiIndex: e.detail.value,
      city: cityName
    })
    this.setCity();
    console.log(this.data.city)
  },
  bindMultiPickerColumnChange: function (e) {
    //var list = { "江苏": ["苏州", "南京", "无锡", "常州"], "安徽": ["芜湖", "合肥", "蚌埠"] };
    console.log(this.data.multiIndex);
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);

    if (e.detail.column == 0) {
      var key = this.data.multiArray[0][e.detail.value];
      var newmultiArraY = [this.data.multiArray[0], this.data.cityList[key]];
      this.setData({
        multiArray: newmultiArraY,
      })

    }
  },


  //未登录跳转到登录页面
  skip() {
    console.log("######跳回登录####")
    wx.redirectTo({
      url: '/pages/login/login'
    })
  },
  setCity() {
    //定位城市
    wx.request({
      url: HOST_URL + '/city/setCityToToken',
      method: 'post',
      data: {
        'token': wx.getStorageSync('token'),
        'city': this.data.city
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log("城市定位====", res.data.code)
      }
    })
  },

  //增加商品数量
  addCount(e) {
    var that = this;
    const index = e.currentTarget.dataset.index;
    var tuiJian = that.data.tuiJian;
    var goodList = this.data.goodList;
    console.log(tuiJian)
    var num = tuiJian[index].num
    if (tuiJian[index].isLimit == true) {
      if (tuiJian[index].num >= tuiJian[index].limitCount) {
        wx.showToast({
          title: '本商品限购' + tuiJian[index].limitCount + '件',
        })
        return
      }
    }
    num++;
    tuiJian[index].num = num;
    this.addCart(tuiJian[index]);
    for (var i = 0; i < goodList.length; i++) {
      if (goodList[i].id == tuiJian[index].id) {

        goodList[i].num = tuiJian[index].num;
      } else if (i == goodList.length - 1) {
        goodList.push({ id: tuiJian[index].id, num: tuiJian[index].num, discountPrice: tuiJian[index].discountPrice });
      }
    }
    if (goodList.length == 0) {
      goodList.push({ id: tuiJian[index].id, num: tuiJian[index].num, discountPrice: tuiJian[index].discountPrice });
    }
    that.setData({
      tuiJian: tuiJian,
      goodList: goodList
    })
    this.getTotalPrice();
  },


  // 减少数量
  minusCount(e) {
    var that = this;
    var goodList = this.data.goodList;
    const index = e.currentTarget.dataset.index;
    var tuiJian = that.data.tuiJian
    if (tuiJian[index].num > 0) {
      tuiJian[index].num--
    }
    if (tuiJian[index].num>0){
      this.addCart(tuiJian[index]);
    }else{
      this.deleteCart(tuiJian[index]);
    }
    for (var i = 0; i < goodList.length; i++) {
      if (goodList[i].id == tuiJian[index].id) {
        if (tuiJian[index].num == 0) {
          goodList.splice(i, 1);
          break;
        }
        goodList[i] = tuiJian[index];
      }
    }
    that.setData({
      tuiJian: tuiJian,
      goodList: goodList
    })
    this.getTotalPrice();
  },


  //商品详情
  pro: function (e) {
    var goodsId = e.currentTarget.dataset.id;
    console.log(goodsId)
    wx.navigateTo({
      url: `../product/product?goodsId=${goodsId}`
    })
  },

  //商品详情
  detail: function (e) {
    var that = this
    var goodsId = e.currentTarget.dataset.id;
    var num = e.currentTarget.dataset.num;
    console.log(goodsId)
    wx.navigateTo({
      url: `../product/product?goodsId=${goodsId}&&num=${num}`
    })
  },

  //跳转到搜索页面
  focus: function () {
    wx.navigateTo({
      url: '../search/search'
    })
  },

  //监听页面变化函数
  onShow() {
    this.setData({
      page: 1
    });
    this.getTypeArr(true);

  var that =this;
    //当季爆款
    wx.request({
      url: HOST_URL + `/goods/getHotGoodsList`,
      data: ({
        'token': wx.getStorageSync('token'),
      }),
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log("当季爆款", res.data)
        if (res.data.code == 100) {
          console.log("#######进来了######")
          that.skip()
        }
        for (var index = 0; index < res.data.data.goodsList.length; index++) {
          res.data.data.goodsList[index].discountPrice = (res.data.data.goodsList[index].discountPrice * 0.01).toFixed(2);
        }
        that.setData({
          hot: res.data.data.goodsList
        })
      }
    })
    // var productNum = wx.getStorageSync('productNum');
    // console.log(productNum);
    // if (productNum) {
    //   for (var i = 0; i < productNum.length; i++) {
    //     for (var a = 0; a < this.data.tuiJian.length; a++) {
    //       // console.log(this.data.tuiJian[a])
    //       //for (var b = 0; b < this.data.tuiJian[a].length; b++) {
    //       if (productNum[i].id == this.data.tuiJian[a].id) {
    //         this.data.tuiJian[a].num = productNum[i].num
    //         this.data.tuiJian[a].minusStatus = productNum[i].minusStatus
    //         //}
    //       }
    //     }
    //   }

    //   this.setData({
    //     tuiJian: this.data.tuiJian,
    //     carts: productNum,
    //     hasList: true,        // 既然有数据了，那设为true吧
    //   })
    // }

    //console.log(productNum);

  },

  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      time: e.detail.value
    })
  },
  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
    })
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
  //下拉刷新
  onPull: function () {
    var that = this;
    if (that.data.tuiJian.lengt >= that.data.totalCount) {
      return;
    }
    wx.request({
      url: HOST_URL + `/goods/getRecommendGoodsList`,
      data: ({
        'token': wx.getStorageSync('token'),
        "page": that.data.page + 1,
        "perPage": 10
      }),
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        for (var i = 0; i < res.data.data.goodsList.length; i++) {
          res.data.data.goodsList[i].discountPrice = (res.data.data.goodsList[i].discountPrice * 0.01).toFixed(2);
          res.data.data.goodsList[i].price = (res.data.data.goodsList[i].price * 0.01).toFixed(2);
        }
        var goodArr = that.data.tuiJian.concat(res.data.data.goodsList);
        that.setData({
          tuiJian: goodArr,
          page: that.data.page + 1,
          totalCount: res.data.data.totalCount
        })
        that.setTypeArr();
      }
    })
  },
  //隐藏弹出层
  shadeHide: function () {
    this.setData({
      shadeShow: false
    });
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