$(function() {

  // Get URL Parameters (GUP)
  function gup (name) {
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(window.location.href);
    return (results === null) ? "" : results[1];
  }

  // Get the assignment ID
  var assignmentId = gup("assignmentId");
  var noAssignmentId = (!assignmentId ||
                        assignmentId === "ASSIGNMENT_ID_NOT_AVAILABLE");
  var batchId = gup("batchId");
  var dataId = gup("dataId");
  $("#assignmentId").val(assignmentId);
  $("#batchId").val(batchId);
  $("#dataId").val(dataId);
  if (noAssignmentId) {
    // We are previewing the HIT. Display helpful message
    $("#acceptHITWarning").show();
  }
  if (gup("turkSubmitTo").indexOf("workersandbox") !== -1) {
    // Sandbox mode
    $("#answerForm")
      .attr("action", "https://workersandbox.mturk.com/mturk/externalSubmit");
  } else if (gup("debug") === "true") {
    // Debug mode
    $("#answerForm")
      .attr("action", "javascript:alert('debug!')");
  } else {
    // Real mode
    $("#answerForm")
      .attr("action", "https://www.mturk.com/mturk/externalSubmit");
  }

  ////////////////////////////////////////////////////////////////
  // Globals

  var frame = document.getElementById('webpage')
  var frameDoc = frame.contentDocument;
  var frameWin = frame.contentWindow;

  var NUM_QUESTIONS;
  var questionDivs = [], currentQuestion;

  ////////////////////////////////////////////////////////////////
  // Web page interaction

  var isSelectionMode = false, currentElement = null;

  function buildBox(index) {
    frameDoc.body.appendChild($('<div>')
      .attr('id', 'ANNOTATIONBOX' + index)
      .text(index + 1)
      .css({
        'border': '5px solid red',
        'box-sizing': 'border-box',
        '-moz-box-sizing': 'border-box',
        '-webkit-box-sizing': 'border-box',
        'position': 'absolute',
        'pointer-events': 'none',
        'z-index': 999999999,
        'color': 'black',
        'font-size': '30px',
        'font-weight': 'bold',
        'overflow': 'visible',
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center',
      }).hide()[0]);
  }

  var specialBox = null;

  function moveBox(el, color, index) {
    if (index === undefined) index = currentQuestion;
    var box = frameDoc.getElementById('ANNOTATIONBOX' + index);
    var rect = el.getBoundingClientRect();
    var docRect = frameDoc.body.getBoundingClientRect();
    $(box).show().css({
      'top': $(el).offset().top,
      'left': $(el).offset().left,
      'height': rect.height,
      'width': rect.width,
      'border-color': color,
    });
    currentElement = el;
  }


  function enableSelectMode() {
    isSelectionMode = true;
  }

  function selectElement(element) {
    moveBox(element, 'green');
    isSelectionMode = false;
    currentElement = null;
  }


  var currentFocus = -1;

  function hackPage() {
    frameWin.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
    })
    frameWin.addEventListener('mousedown', function(e) {
      if (isSelectionMode) {
        selectElement(e.target);
      }
      e.preventDefault();
      e.stopImmediatePropagation();
    })
    frameWin.addEventListener('keypress', function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
    })
    var whitelistElements = ['a', 'button', 'input', 'textarea']
    var blacklistElements = ['p', 'style', 'script', 'code', 'pre', 'small', 'center']
    function highlight(target) {
      var tag = target.tagName.toLowerCase()
      if(blacklistElements.indexOf(tag) < 0 &&
        (!target.hasChildNodes() ||
          whitelistElements.indexOf(tag) >= 0 ||
          target.hasAttribute('onclick'))) {
            return moveBox(target, 'red')
          }
      if(target.parentElement) {
        highlight(target.parentElement)
      }
    }

    frameWin.addEventListener('mouseover', function(e) {
      if (isSelectionMode && e.target !== currentElement) {
        highlight(e.target)
      }
    })
  }

  ////////////////////////////////////////////////////////////////
  // Info box

  function showInfoBox() {
    if ($('#infobox').hasClass('hidden'))
      $('#infobox').removeClass('hidden').addClass('top');
    else if ($('#infobox').hasClass('top'))
      $('#infobox').removeClass('top').addClass('bottom');
    else
      $('#infobox').removeClass('bottom').addClass('hidden');
  }

  $(window).keypress(function (e) {
    if (e.key === 'i')
      showInfoBox();
  });

  ////////////////////////////////////////////////////////////////
  // Load data

  function createViewDiv(i, result) {
    var questionDiv = $('<div class=question>');
    questionDiv.append($('<input type=hidden>')
        .attr('id', 'e' + i).attr('name', 'e' + i).val(result.xid));
    questionDiv.attr('title', result.xid);
    // Command
    $('<h2>').text('Command ' + (i+1))
      .appendTo(questionDiv);

    $('<p>').text(result.phrase)
      .appendTo(questionDiv);

    $('<button>').text('Choose element ' + (i+1))
      .click(function() {
        currentQuestion = i;
        enableSelectMode();
      })
      .appendTo(questionDiv);
    return questionDiv;
  }

  function fillInfo(xid, color) {
    if ($('#infobox').hasClass('hidden')) showInfoBox();
    $('#infobox').empty().css('background-color', color);
    function add(key, value) {
      $('#infobox').append($('<p>').append($('<strong>').text(key)).append(': ').append(value));
    }
    element = $(frameDoc).find("[data-xid='" + xid + "']");
    add('tag', element.prop('tagName'));
    add('text', element.text());
    add('dim', ' ' + element.width() + ' ' + element.height());
  }


  // Load the page!
  $.get('pages/' + dataId + '.html', function (data) {
    frameDoc.open()
    frameDoc.write(data);
    frameDoc.close();
    hackPage();

    // Load all results
    $.get('results/all.jsonl', function (results) {
      results = results
        .split('\n')
        .filter(s=>s.trim().length>0)
        .map(JSON.parse)
        .filter(r=>r.webpage===dataId)
      NUM_QUESTIONS = results.length;
      results.forEach(function (result, i) {
        questionDivs.push(createViewDiv(i, result).appendTo('#questionWrapper'));
        buildBox(i);
      });
    });
  }).fail(function () {
    alert('Bad URL: "' + dataId + '" -- Please contact the requester');
  });

});
