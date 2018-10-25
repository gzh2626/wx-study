Page({
  data: {
    num: 0,
    minusStatus: 'disabled',
    multiArray: [['上海', '江苏'], ['南京','南通', '扬州', '镇江', '江阴', '张家港', '泰州', '靖江', '常州', '常熟','太仓']],
    objectMultiArray: [
      [
        {
          id: 0,
          name: '上海'
        },
        {
          id: 1,
          name: '江苏'
        }
      ], [
        {
          id: 0,
          name: '南京'
        },
        {
          id: 1,
          name: '南通'
        },
        {
          id: 2,
          name: '扬州'
        },
        {
          id: 3,
          name: '镇江'
        },
        {
          id: 3,
          name: '江阴'
        },
        {
          id: 3,
          name: '张家港'
        },
        {
          id: 3,
          name: '泰州'
        },
        {
          id: 3,
          name: '靖江'
        },
        {
          id: 3,
          name: '常州'
        },
        {
          id: 3,
          name: '常熟'
        },
        {
          id: 3,
          name: '太仓'
        }
      ]
    ],
    multiIndex: [1, 0],
    




    array: [{
      message: '新鲜蔬菜',
      src: '../img/shucai.png'
    }, {
        message: '肉禽',
      src: '../img/rouQin.png'
      }, {
        message: '水产冻货',
        src: '../img/haiXian.png'
    }, {
        message: '蛋品豆面',
         src:'../img/dan.png'
      }
    ],
    array1: [ {
      message1: '米面粮油',
      src1: '../img/you.png'
    }, {
      message1: '休闲酒饮',
      src1: '../img/jiu.png'
    }, {
      message1: '调料干货',
      src1: '../img/tiaolia.png'
    }, {
      message1: '时令水果',
      src1: '../img/shuiGuo.png'
    }
    ] ,
    array2: [{
      message1: '马达加斯加冻...',
      qian:'￥200.00',
      src1: '../img/xia.png'
    }, {
      message1: '马达加斯加冻...',
      qian: '￥200.00',
      src1: '../img/xia.png'
      }, {
        message1: '马达加斯加冻...',
        qian: '￥200.00',
        src1: '../img/xia.png'
    }, {
      message1: '马达加斯加冻...',
      qian: '￥200.00',
      src1: '../img/xia.png'
      }, {
        message1: '马达加斯加冻...',
        qian: '￥200.00',
        src1: '../img/xia.png'
      }
    ],
    array1: [{
      message1: '米面粮油',
      src1: '../img/you.png'
    }, {
      message1: '休闲酒饮',
      src1: '../img/jiu.png'
    }, {
      message1: '调料干货',
      src1: '../img/tiaolia.png'
    }, {
      message1: '时令水果',
      src1: '../img/shuiGuo.png'
    }
    ],
    array3: [{
      message1: '新鲜蔬菜圆生菜沙拉菜球生菜西餐色拉菜 500g',
      qian: '￥100.00',
      src1: '../img/tu1.png',
      num:0
    }, {
      message1: '新鲜蔬菜圆生菜沙拉菜球生菜西餐色拉菜 500g',
      qian: '￥100.00',
      src1: '../img/tu1.png',
      num: 0
      }, {
        message1: '新鲜蔬菜圆生菜沙拉菜球生菜西餐色拉菜 500g',
        qian: '￥100.00',
        src1: '../img/tu1.png',
        num: 0
    }, {
      message1: '新鲜蔬菜圆生菜沙拉菜球生菜西餐色拉菜 500g',
      qian: '￥100.00',
      src1: '../img/tu1.png',
      num: 0
      }
    ],
  },
  pro:function(){
  wx.navigateTo({
    url: '../product/product',
  })
  },
  focus: function () {
   wx.navigateTo({
     url: '../search/search'
   })
  },
  
  bindMinus: function (e) {
    var num = this.data.num;
    if (num > 0) {
      num--;
    }
    var minusStatus = num <= 1 ? 'disabled' : 'normal';
    this.setData({
      num: num,
      minusStatus: minusStatus
    });
  },
  bindPlus: function (e) {
    var num = this.data.num;
    num++;
    var minusStatus = num < 1 ? 'disabled' : 'normal';
    this.setData({
      num: num,
      minusStatus: minusStatus
    });
  },
  //bindManual: function (e) {
    //var num = e.detail.value;
    //this.setData({
      //num: num
   // });
  //},

  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
  bindMultiPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    })
  },
  bindMultiPickerColumnChange: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        switch (data.multiIndex[0]) {
          case 0:
            data.multiArray[1] =['上海'];
            break;
          case 1:
            data.multiArray[1] = ['南京', '南通', '扬州', '镇江', '江阴', '张家港', '泰州', '靖江', '常州', '常熟', '太仓'];
            break;
        }
        data.multiIndex[1] = 0;
        data.multiIndex[2] = 0;
        break;
        data.multiIndex[2] = 0;
        console.log(data.multiIndex);
        break;
    }
    this.setData(data);
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
  }
})