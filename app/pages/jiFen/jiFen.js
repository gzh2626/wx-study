var requesturl = require('../../utils/util.js')
var HOST_URL = requesturl.HOST_URL
Page({
  data: {
    showModal: false,
    arrat: [],
    score: 0,
    vipScoreList: [],
    inputValue: '',
    putVipScore:true,
    confirmBtn:true
  },



  showDialogBtn: function () {
    this.setData({
      showModal: true
    })
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    var self=this;
    if (!this.data.inputValue){
      wx.showModal({
        title: '提示',
        content: '请输入兑换积分',
        showCancel: false
      })
      return;
    }
    wx.request({
      url: HOST_URL+'/vipScore/withdrawScore',
      data: { 'token': wx.getStorageSync('token'), quantity: this.data.inputValue },
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        self.setData({
          inputValue:''
        });
        if(res.data.code==0){
          self.hideModal();
          self.getUserInfo();
          self.getScoreList();         
        }
      }
    })
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '我的积分',
    });
    this.getUserInfo();
    this.getScoreList();
  },
  getScoreList: function () {
    var self = this;
    wx.request({
      url: HOST_URL+'/vipScore/getVipScoreByUserId',
      data: { 'token': wx.getStorageSync('token') },
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        self.setData({
          vipScoreList: res.data.data
        });
      }
    })
  },
  getUserInfo: function () {
    var self = this;
    wx.request({
      url: HOST_URL+'/user/getUserInfo',
      data: { 'token': wx.getStorageSync('token') },
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var data = res.data.data;
        if (data.vipScore){
          self.setData({
            putVipScore: false
          });
        }
        self.setData({
          vipScore: data.vipScore.toFixed(2)
        });
      }
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
  inputChange: function (e) {
    if ((Number(e.detail.value) <= this.data.vipScore) && Number(e.detail.value)){
      this.setData({
        confirmBtn:false
      })
    }else{
      this.setData({
        confirmBtn: true
      })
    }
    this.setData({
      inputValue: Number(e.detail.value)
    });
  }

})