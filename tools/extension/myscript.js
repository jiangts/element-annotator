
/*
var params = {
  url: location.href,
  html: document.documentElement.outerHTML
};

var headers = {
  'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
}

var formData = new FormData();

for (var k in params) {
  formData.append(k, encodeURIComponent(params[k]));
}

var request = {
  method: 'POST',
  headers: headers,
  body: formData
};

fetch('https://localhost:3030/api/page/archive', request)
  .then(response => {
    console.log(response.text())
  }).catch(err => {
    console.error(err)
  })
*/


function POST(url, data, done) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 /*&& this.status == 200*/) {
      done(this)
    }
  };
  xhttp.open("POST", url, true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  body = []
  for(key in data) {
    body.push(key + '=' + encodeURIComponent(data[key]))
  }
  xhttp.send(body.join('&'));
}



// var host = 'https://localhost:3030'
var host = 'https://motif.gq'
setTimeout(function () {
  POST(host+'/api/page/archive', {
    url: location.href,
    html: document.documentElement.outerHTML
  }, function(xhr) {
    var result = JSON.parse(xhr.responseText)
    var wnd = window.open("about:blank", "", "_blank");
    wnd.document.write(result.html);
    wnd.console.log(result.html)
  })
}, 1000);