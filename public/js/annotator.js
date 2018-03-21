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

  $.ajax({
    url: '/pages/RUC5BqHQobkyhOak'
    // url: '/pages/sSTirzzKQ4puXs2t'
    // url: '/pages/k6Hd39aBAVYPbkJ5'
  }).done(function(page) {
    renderPage(page)
    hackPage()
  })

})
