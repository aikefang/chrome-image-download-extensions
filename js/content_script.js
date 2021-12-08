var source = {
  headImages: [],
  video: '',
  videoPoster: '',
  skuImages: [],
  descriptionImages: [],
  title: document.title
}

// 获取style
function getStyle(x, styleProp) {
  if (x.currentStyle) {
    var y = x.currentStyle[styleProp];
  } else if (window.getComputedStyle) {
    var y = document.defaultView.getComputedStyle(x, null).getPropertyValue(styleProp);
  }
  return y;
}

// 主图
document.querySelectorAll('#J_UlThumb img').forEach(data => {
  if (data.src) {
    source.headImages.push(data.src.split('.jpg_')[0] + '.jpg')
  }
})

// sku图
document.querySelectorAll('.tb-sku ul.tb-img a').forEach(data => {
  var bgImg = getStyle(data, 'background')
  if (bgImg && bgImg !== 'none') {
    var bgImgReg = /url\(['"]?([^")]+)/.exec(bgImg) || []
    if (bgImgReg[1]) {
      source.skuImages.push(bgImgReg[1].split('.jpg_')[0] + '.jpg')
    }
  }
})

// 视频
var videoDom = document.querySelector('.tm-video-box video')
if (videoDom) {
  source.videoPoster = videoDom.poster
  source.video = videoDom.querySelector('source').src
}

window.scrollTo(0, 1000)
setTimeout(() => {
  // 获取详情图
  document.querySelectorAll('#description .content p img').forEach(data => {
    source.descriptionImages.push(data.dataset.ksLazyload || data.src)
  })
}, 600)
setTimeout(() => {
  chrome.extension.sendRequest(source)
}, 1000)

