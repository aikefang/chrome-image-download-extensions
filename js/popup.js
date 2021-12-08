// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//   chrome.tabs.executeScript(tabs[0].id, { file: 'js/content_script.js', allFrames: true }, _ => {
//     alert(123123123)
//     let e = chrome.runtime.lastError;
//     if (e !== undefined) {
//       console.log(tabs[0].id, _, e);
//     }
//   })
// });

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  // chrome.tabs.executeScript({
  //   file: 'js/jquery-3.5.1.min.js'
  // })
  chrome.tabs.executeScript({
    file: 'js/content_script.js'
  })
})
// 获取url信息
function parseURL(url) {
  var a =  document.createElement('a');
  a.href = url;
  var file = (a.pathname.match(/([^/?#]+)$/i) || [,''])[1]
  var suffix = file.split('.')
  var params = {
    source: url,
    protocol: a.protocol.replace(':',''),
    host: a.hostname,
    port: a.port,
    query: a.search,
    params: (function(){
      var ret = {},
        seg = a.search.replace(/^\?/,'').split('&'),
        len = seg.length, i = 0, s;
      for (;i<len;i++) {
        if (!seg[i]) { continue; }
        s = seg[i].split('=');
        ret[s[0]] = s[1];
      }
      return ret;
    })(),
    file: (a.pathname.match(/([^/?#]+)$/i) || [,''])[1],
    hash: a.hash.replace('#',''),
    path: a.pathname.replace(/^([^/])/,'/$1'),
    relative: (a.href.match(/tps?:\/[^/]+(.+)/) || [,''])[1],
    segments: a.pathname.replace(/^\//,'').split('/')
  }
  if (suffix[1]) {
    params.suffix = suffix[1]
    params.name = suffix[0]
  }
  return params;
}

function appendDom(id, list) {
  var fragment = document.createDocumentFragment();
  list.map((url, index) => {
    var li = document.createElement("li");
    li.className = "img-item";
    var imgBox = document.createElement("div");
    imgBox.className = "img-box";
    var img = document.createElement("img");
    img.src = url + '_100x100.jpg';
    img.onload = function () {
      img.title = `${img.width}*${img.height}`;
    }
    imgBox.appendChild(img)
    li.appendChild(imgBox);
    var span = document.createElement("span");
    span.innerText = "下载";
    span.onclick = function () {
      chrome.downloads.download({
        url: url,
        // filename: `./demo/${index}.${parseURL(url)}`,
        conflictAction: 'uniquify',
        saveAs: false
      }, function (id) {
      });
    }
    li.appendChild(span);
    fragment.append(li);
  })
  document.getElementById(id).append(fragment);
}

// 下载全部
function appendDownLoadAllDom(id, sources) {
  document.getElementById(id).onclick = function () {
    var title = sources.title
    sources.headImages.forEach((data, index) => {
      chrome.downloads.download({
        url: data,
        filename: `./${title}/商品主图/${index + 1}.${parseURL(data).suffix}`,
        conflictAction: 'overwrite', // "uniquify", "overwrite", or "prompt"
        saveAs: false
      }, function (id) {
      });
    })
    sources.skuImages.forEach((data, index) => {
      chrome.downloads.download({
        url: data,
        filename: `./${title}/SKU图片/${index + 1}.${parseURL(data).suffix}`,
        conflictAction: 'overwrite', // "uniquify", "overwrite", or "prompt"
        saveAs: false
      }, function (id) {
      });
    })
    sources.descriptionImages.forEach((data, index) => {
      chrome.downloads.download({
        url: data,
        filename: `./${title}/商详图片/${index + 1}.${parseURL(data).suffix}`,
        conflictAction: 'overwrite', // "uniquify", "overwrite", or "prompt"
        saveAs: false
      }, function (id) {
      });
    })
    if (sources.video) {
      var parseData = parseURL(sources.video)
      chrome.downloads.download({
        url: sources.video,
        filename: `./${title}/视频/${parseData.name}.${parseData.suffix}`,
        conflictAction: 'overwrite', // "uniquify", "overwrite", or "prompt"
        saveAs: false
      }, function (id) {
      });
    }
  }
}



function appendVideoDom(id, url, video) {
  var fragment = document.createDocumentFragment();

  var li = document.createElement("li");
  li.className = "img-item";
  var imgBox = document.createElement("div");
  imgBox.className = "img-box";
  var img = document.createElement("img");
  img.src = url;
  img.onload = function () {
    img.title = `${img.width}*${img.height}`;
  }
  imgBox.appendChild(img)
  li.appendChild(imgBox);
  var span = document.createElement("span");
  span.innerText = "下载";
  span.onclick = function () {
    chrome.downloads.download({
      url: video,
      conflictAction: 'uniquify',
      saveAs: false
    }, function (id) {
    });
  }
  li.appendChild(span);
  fragment.append(li);

  document.getElementById(id).append(fragment);
}

chrome.extension.onRequest.addListener(function (sources) {
  document.querySelector('.spinner-box').style = 'display: none'
  document.querySelector('.content').style = 'display: block'
  appendDom('head-images', sources.headImages)
  if (sources.skuImages.length > 0) {
    document.querySelector('.sku-images-box').style = 'display: block'
    appendDom('sku-images', sources.skuImages)
  }
  appendDom('description-images', sources.descriptionImages)
  if (sources.video) {
    document.querySelector('.head-video-box').style = 'display: block'
    appendVideoDom('head-video', sources.videoPoster, sources.video)
  }

  appendDownLoadAllDom('download-all', sources)
});

