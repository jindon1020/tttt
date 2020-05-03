// pages/selectBorder/selectBorder.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    borderArrImgs:['/assets/img/temp1.png', '/assets/img/temp2.png', '/assets/img/temp3.png'],
    title:''
  },
  onLoad(){
    wx.showLoading({
      title: '一大波头像框来袭',
      mask:true
    })
    let that = this
    // wx.request({
    //   url: '/assets/img',
    //   success:function(res){
    //     if(res.data.code === 200){
    //       that.setData({
    //         borderArrImgs: res.data.data,
    //         title: res.data.title
    //       })
    //     }
    //     wx.hideLoading()
    //   }
    // })
    wx.hideLoading()
  },
  selectBorder(e){
    if (!e.currentTarget.dataset.url){
      wx.showModal({
        title: '提示',
        content: '头像框无法找到了哦!'
      })
    }else{
      // 选择头像框路径 存入全局
      app.globalData.borderImgs = e.currentTarget.dataset.url
      wx.showToast({
        title: '选择头像框成功',
        icon:'none',
        duration:1000,
        success:function(){
          // 然后返回上一页
          wx.navigateBack()
        }
      })
    }
  }
})