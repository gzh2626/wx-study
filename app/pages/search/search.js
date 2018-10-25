var requesturl = require('../../utils/util.js')
var HOST_URL = requesturl.HOST_URL
// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    serchValue:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  back: function () {
    wx.navigateBack({
      delta: 1
    })
  },
  onLoad: function (options) {

   var that = this

    //获取搜索记录
    wx.request({
      url: HOST_URL+`/searchHistory/getSearchHistoryByUserId`,
      data:({
        'token': wx.getStorageSync('token'),
      }),
      method:'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success:function(res){
        console.log(res)
        that.setData({
          searchArray:res.data.data
        })
      }
    })
  
  },


  //
  searchInput:function(e){
   console.log(e.detail.value)
    this.setData({
      serchValue: e.detail.value
    })
  },


  //添加搜索记录
  search(e){
    var that = this

    var queryStr = e.currentTarget.dataset.str;
    if (queryStr==undefined){
      queryStr = that.data.serchValue
    }
    
    if (queryStr.length==0){
      wx.showToast({
        title: '请输入关键字！',
      })
      return
    }

    wx.request({
      url: HOST_URL+`/searchHistory/recordSearchHistory`,
      data: ({
        'token': wx.getStorageSync('token'),
        'queryStr': queryStr
      }),
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log("进入到搜索页面之前")
      }
    })

    wx.setStorageSync("queryStr", queryStr)
    wx.navigateTo({
      url: `/pages/searchHas/searchHas`,
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
    this.onLoad();
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