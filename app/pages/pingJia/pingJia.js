var requesturl = require('../../utils/util.js')
var HOST_URL = requesturl.HOST_URL
// pages/pingJia/pingJia.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    star:[{
      head:'../img/star.png',
      src:'../img/star.png',
      text: '宝贝已经收到了，质量非常好，性价比也非常高，商家服务也非常好。宝贝已经收到了，质量非常好。'
    }, {
      head: '../img/star.png',
      src: '../img/star.png',
      text: '宝贝已经收到了，质量非常好，性价比也非常高，商家服务也非常好。宝贝已经收到了，质量非常好。'
      }, {
        head: '../img/star.png',
        src: '../img/star.png',
        text: '宝贝已经收到了，质量非常好，性价比也非常高，商家服务也非常好。宝贝已经收到了，质量非常好。'
    }, {
      head: '../img/star.png',
      src: '../img/star.png',
      text: '宝贝已经收到了，质量非常好，性价比也非常高，商家服务也非常好。宝贝已经收到了，质量非常好。'
      }, {
        head: '../img/star.png',
        src: '../img/star.png',
        text: '宝贝已经收到了，质量非常好，性价比也非常高，商家服务也非常好。宝贝已经收到了，质量非常好。'
      }],
      page:1,
      perPage:10,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    console.log("############" + options.goodsId)
    var goodsId = options.goodsId


    //商品评价总数
    wx.request({
      url: HOST_URL+`/comment/getCommentCountByGoodsId`,
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

    wx.request({
      url: HOST_URL+`/comment/getCommentByGoodsId`,
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
        console.log(res.data)
        for (var index in res.data.data) {
          res.data.data[index].starCount = parseInt(res.data.data[index].starCount)/10;
        }
        that.setData({
          commentArray: res.data.data
        })
      }
    })


    wx: wx.setNavigationBarTitle({
      title: '评价',
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