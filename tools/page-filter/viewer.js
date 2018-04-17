$(function () {

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

  var SERVER_DEFAULT = 'http://localhost:8032'
  var server = QueryString.server || SERVER_DEFAULT;
  var mode = QueryString.mode || 'graph';

  $.get(server + '/list', function (data) {
    var taskName = null;
    $('#file-column').empty();
    data.filenames.forEach(function (x) {
      $('<p>').appendTo('#file-column')
        .append($('<button type=button>').text('X').data('filename', x))
        .append($('<span>').text(decodeURIComponent(x)).data('filename', x));
    });
  });

  var frame = document.getElementById('webpage')
  var frameDoc = frame.contentDocument;
  var frameWin = frame.contentWindow;

  $('#file-column').on('click', 'span', function (event) {
    var target = $(this);
    $('#file-column span').removeClass('selected');
    $(target).addClass('selected');
    $.get(server + '/view', {'filename': $(target).data('filename')}, function (data) {
      frameDoc.open()
      frameDoc.write(data);
      frameDoc.close();
    });
  });

  $('#file-column').on('click', 'button', function (event) {
    var target = $(this);
    $.post(server + '/bad', {'filename': $(target).data('filename')}, function (data) {
      target.parent().addClass('bad');
    }).fail(function(xhr, status, error) {
      alert('' + xhr + ' ' + status + ' ' + error);
    });
  });

});
