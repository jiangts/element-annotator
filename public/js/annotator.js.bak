$(function() {

  var frameDoc = document.getElementById('iframe').contentDocument
  var frameWin = document.getElementById('iframe').contentWindow

  var renderPage = function(page) {
    frameDoc.documentElement.innerHTML = page.processedhtml
  }

  var moveBox = function(el) {
    var box = frameDoc.getElementById('ANNOTATIONBOX');
    if (!box) {
      box = $('<div id="ANNOTATIONBOX" style="border: 2px solid red; position: absolute; pointer-events: none; z-index: 2147483647"></div>')[0]
      frameDoc.body.appendChild(box)
    }
    console.log(el);
    var rect = el.getBoundingClientRect();
    box.style.top=rect.top
    box.style.left=rect.left
    box.style.height=rect.height
    box.style.width=rect.width
  }

  var hackPage = function() {
    frameWin.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
    })
    frameWin.addEventListener('keypress', function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
    })
    var currentElement = null;
    frameWin.addEventListener('mouseover', function(e) {
      if (currentElement !== e.target) {
        moveBox(e.target)
        currentElement = e.target;
      }
    })
  }

  var QueryString = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i) {
      var p=a[i].split('=', 2);
      if (p.length == 1)
        b[p[0]] = "";
      else
        b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
  })(window.location.search.substr(1).split('&'));

  $.ajax({
    url: '/pages/' + QueryString.id,
  }).done(function(page) {
    renderPage(page)
    hackPage()
  })

})
