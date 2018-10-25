var app = getApp()
var requesturl = require('../../utils/util.js')
var HOST_URL = requesturl.HOST_URL
Page({
  data: {
    items: [],
    startX: 0, //开始坐标
    startY: 0,
    hasList: false,          // 列表是否有数据
    totalPrice: 0,           // 总价，初始为0
    selectAllStatus: true,    // 全选状态，默认全选
    //page: 1,
    //perPage: 5,
    isSelectAll: true,   //全选的状态
    totalCount: 0,
    typeCount: 0,
    category: 0,
    typeId: -1
    // cartArray: []
  },

  //页面初始加载
  onLoad: function () {
    var that = this
    wx.removeStorageSync('cart-array');
    var category;
    if (that.data.typeId != -1) {
      category = that.data.typeId
    }

    //获取购物车列表
    wx.request({
      url: HOST_URL + `/shoppingCart/openShoppingCart`,
      data: ({
        'token': wx.getStorageSync('token'),
        'category': Number(category)
      }),
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var nowCartArray = res.data.data
        console.log(nowCartArray)
        //没有权限,返回登录页面
        if (res.data.code == 100) {
          wx.redirectTo({
            url: `../login/login`
          })
        }

        if (nowCartArray != []) {
          for (var index in nowCartArray) {
            nowCartArray[index].selected = true;
            nowCartArray[index].goodsDiscountPrice = (nowCartArray[index].goodsDiscountPrice * 0.01).toFixed(2);
            nowCartArray[index].subTotal = (nowCartArray[index].goodsDiscountPrice * nowCartArray[index].count).toFixed(2)
          }
          that.setData({
            nowCartArray: nowCartArray,
          })
          that.getTotalPrice();
          that.getTotalCount();
          that.getTypeCount();
        }
      }
    })



    //获取失效商品列表
    wx.request({
      url: HOST_URL + `/shoppingCart/getUnusedGoodsList`,
      data: ({
        'token': wx.getStorageSync('token'),
      }),
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data.data)
        that.setData({
          pastCartArray: res.data.data
        })
      }
    })


    for (var i = 0; i < 10; i++) {
      isTouchMove: false //默认全隐藏删除
    }

  },


  //切换购物车商品分类
  changeType(e) {
    var that = this
    var typeId = e.currentTarget.dataset.typeid;
    console.log("当前分类", typeId)
    that.setData({
      typeId: typeId
    })
    that.updateCartCount()
    that.onLoad()
  },


  //批量修改购物车商品数量
  updateCartCount() {
    var that = this
    var nowCartArray = that.data.nowCartArray
    var shoppingCartIdAndCountList = [];
    for (let i = 0; i < nowCartArray.length; i++) {
      shoppingCartIdAndCountList[i] = {};
      shoppingCartIdAndCountList[i].shoppingCartId = nowCartArray[i].id
      shoppingCartIdAndCountList[i].count = nowCartArray[i].count

    }
    wx.request({
      url: HOST_URL + `/shoppingCart/batchUpdateShoppingCartCount`,
      data: ({
        'token': wx.getStorageSync('token'),
        shoppingCartIdAndCountList: shoppingCartIdAndCountList
      }),
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          console.log("购物车数量修改成功")
        }
      }
    })
  },

  //商品详情
  pro: function (e) {
    var that = this
    var goodsId = e.currentTarget.dataset.goodsid;
    var index = e.currentTarget.dataset.index;
    var num = that.data.nowCartArray[index].count
    var shoppingCartId = that.data.nowCartArray[index].id
    wx.setStorageSync('shoppingCartId', shoppingCartId)
    console.log(goodsId)
    wx: wx.navigateTo({
      url: `../product/product?goodsId=${goodsId}&&num=${num}`,
    })
  },


  // 清空失效商品
  clear: function () {
    var that = this
    var length = that.data.pastCartArray.length
    if (length == 0) {
      wx.showToast({
        title: '没有失效的商品',
        icon: 'success',
        duration: 2000
      })
      return
    }

    wx.showModal({
      title: '提示',
      content: '确定清空吗?',
      success: function (res) {
        if (res.confirm) {

          wx.request({
            url: HOST_URL + `/shoppingCart/clearUnusedShoppingCart`,
            data: ({
              'token': wx.getStorageSync('token')
            }),
            method: 'POST',
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              console.log(res.data.code)
              wx.showModal({
                title: '提示',
                content: '清空完成',
                showCancel: false,
                success: function () {
                  that.onLoad()
                }
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  //获取分类个数
  getTypeCount() {
    var that = this
    var typeCount = 0
    for (var index in that.data.nowCartArray) {
      if (that.data.nowCartArray[index].selected == true) {
        typeCount++
      }
    }
    that.setData({
      typeCount: typeCount
    })

  },

  //获取商品总数
  getTotalCount() {
    var that = this
    var totalCount = 0
    for (var index in that.data.nowCartArray) {
      if (that.data.nowCartArray[index].selected == true) {
        totalCount = totalCount + that.data.nowCartArray[index].count
      }
    }
    that.setData({
      totalCount: totalCount
    })
  },


  //获取商品总价
  getTotalPrice() {
    var that = this
    let nowCartArray = that.data.nowCartArray;                  // 获取购物车列表
    let total = 0;
    for (let i = 0; i < nowCartArray.length; i++) {         // 循环列表得到每个数据
      if (nowCartArray[i].selected) {                   // 判断选中才会计算价格
        total += nowCartArray[i].count * nowCartArray[i].goodsDiscountPrice;     // 所有价格加起来
      }
    }
    wx.setStorageSync('cart-array', nowCartArray)
    that.setData({                                // 最后赋值到data中渲染到页面
      nowCartArray: nowCartArray,
      totalPrice: total.toFixed(2)
    });
  },



  //去结算
  toPay(e) {
    var that = this
    var totalPrice = e.currentTarget.dataset.totalprice
    var cartArray = []
    var nowCartArray = that.data.nowCartArray

    for (var index = 0; index < nowCartArray.length; index++) {
      if (nowCartArray[index].selected == true) {
        //if (nowCartArray[index] != 'undefined' && nowCartArray[index] != undefined) {
        cartArray.push(nowCartArray[index]);
        //}
      }
    }

    if (cartArray.length == 0) {
      wx.showToast({
        title: '未选择商品',
      })
      return
    }

    wx.setStorageSync('cart-array', cartArray)
    console.log("#####未跳转前####")
    console.log(cartArray)
    console.log(totalPrice)
    wx.navigateTo({
      url: `../order-tiJiao/order-tiJiao?totalPrice=` + totalPrice,
    })
  },


  //购物车 全选与全不选
  selectCartAll(e) {
    var that = this
    var isOrNot = that.data.isSelectAll
    isOrNot = !isOrNot
    that.setData({
      isSelectAll: isOrNot
    })
    var nowCartArray = that.data.nowCartArray
    if (isOrNot == true) {
      for (var index in nowCartArray) {
        nowCartArray[index].selected = true
      }
    }

    if (isOrNot == false) {
      for (var index in nowCartArray) {
        nowCartArray[index].selected = false
      }
    }
    that.getTotalPrice();
    that.getTotalCount();
    that.getTypeCount();
    wx.setStorageSync('cart-array', nowCartArray)
    that.setData({
      nowCartArray: nowCartArray
    })

  },


  selectList(e) {
    var index = e.currentTarget.dataset.index;    // 获取data- 传进来的index
    var nowCartArray = this.data.nowCartArray;                    // 获取购物车列表
    var selected = nowCartArray[index].selected;         // 获取当前商品的选中状态
    nowCartArray[index].selected = !selected;              // 改变状态

    //存在单项被不被选中,则全选也为不选中
    if (!selected == false) {
      var isSelectAll = false
      nowCartArray[index].selected == false
      this.setData({
        isSelectAll: isSelectAll
      })
    }
    wx.setStorageSync('cart-array', nowCartArray)
    this.setData({
      nowCartArray: nowCartArray,
    });

    this.getTotalPrice();                           // 重新获取总价
    this.getTotalCount();
    this.getTypeCount();
  },



  // 增加数量
  addCount(e) {
    const index = e.currentTarget.dataset.index;
    let nowCartArray = this.data.nowCartArray;
    let count = nowCartArray[index].count;
    count++;
    if (nowCartArray[index].isLimit == true) {
      if (nowCartArray[index].limitCount < count) {
        wx.showToast({
          title: '本商品限购' + nowCartArray[index].limitCount + '件',
        })
        return
      }
    }
    nowCartArray[index].count = count;
    wx.setStorageSync('cart-array', nowCartArray)
    nowCartArray[index].subTotal = (count * nowCartArray[index].goodsDiscountPrice).toFixed(2)
    this.setData({
      nowCartArray: nowCartArray
    });
    this.getTotalPrice();                           // 重新获取总价
    this.getTotalCount();
    this.getTypeCount();
  },


  // 减少数量
  minusCount(e) {
    const index = e.currentTarget.dataset.index;
    let nowCartArray = this.data.nowCartArray;

    let count = nowCartArray[index].count;
    if (count <= 1) {
      return false;
    }
    count--;
    nowCartArray[index].count = count;
    wx.setStorageSync('cart-array', nowCartArray)
    nowCartArray[index].subTotal = (count * nowCartArray[index].goodsDiscountPrice).toFixed(2)
    this.setData({
      nowCartArray: nowCartArray
    });
    this.getTotalPrice();                           // 重新获取总价
    this.getTotalCount();
    this.getTypeCount();
  },


  deleteList(e) {
    console.log("#####删除List###")
    const index = e.currentTarget.dataset.index;
    let nowCartArray = this.data.nowCartArray;
    items.splice(index, 1);              // 删除购物车列表里这个商品
    this.setData({
      nowCartArray: nowCartArray
    });
    if (!nowCartArray.length) {                  // 如果购物车为空
      this.setData({
        hasList: false              // 修改标识为false，显示购物车为空页面
      });
    } else {                              // 如果不为空
      this.getTotalPrice();           // 重新计算总价格
    }
  },
  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    //开始触摸时 重置所有删除
    this.data.nowCartArray.forEach(function (v, i) {
      if (v.isTouchMove)//只操作为true的
        v.isTouchMove = false;
    })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      nowCartArray: this.data.nowCartArray
    })
  },
  //滑动事件处理
  touchmove: function (e) {
    var that = this,
      index = e.currentTarget.dataset.index,//当前索引
      startX = that.data.startX,//开始X坐标
      startY = that.data.startY,//开始Y坐标
      touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
      //获取滑动角度
      angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
    that.data.nowCartArray.forEach(function (v, i) {
      v.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index) {
        if (touchMoveX > startX) //右滑
          v.isTouchMove = false
        else //左滑
          v.isTouchMove = true
      }
    })
    //更新数据
    that.setData({
      nowCartArray: that.data.nowCartArray
    })
  },
  /**
   * 计算滑动角度
   * @param {Object} start 起点坐标
   * @param {Object} end 终点坐标
   */
  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
  //删除事件
  del: function (e) {
    var that = this
    console.log("#####删除###", e.currentTarget.dataset.index)
    var index = e.currentTarget.dataset.index
    var nowCartArray = that.data.nowCartArray
    //this.data.nowCartArray.splice(e.currentTarget.dataset.index, 1)

    wx.showModal({
      title: '提示',
      content: '确定删除该商品吗?',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: HOST_URL + `/shoppingCart/removeShoppingCart`,
            data: ({
              shoppingCartId: nowCartArray[index].id,
              'token': wx.getStorageSync('token')
            }),
            method: 'POST',
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              console.log("##删除成功", res.data)
              nowCartArray.splice(index, 0)
              that.setData({
                nowCartArray: nowCartArray
              })
              that.onLoad()
            }

          })

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })


  },

  //onshow 监听页面变化
  onShow() {
    this.onLoad();
  },


  //页面子父级切换调用
  onUnload: function () {

  },

  //页面底栏切换调用
  onHide: function () {
    console.log("离开页面购物车商品数量更改")
    var that = this
    that.updateCartCount()
  },

})