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
  // Form submission

  var iWillSubmit = false;

  $('#submitButton').click(function () {
    iWillSubmit = true;
    $('#answerForm').submit();
  });

  $('#submitButton').keyup(function(e) {
    var keyCode = e.keyCode || e.which;
    if (keyCode === 13 || keyCode === 32) {
      iWillSubmit = true;
      $('#answerForm').submit();
    }
  });

  function countHighlights() {
    return $('.question button.chosen').length;
  }

  function checkAnswers() {
    for (let i = 0; i < NUM_QUESTIONS; i++) {
      if (!$('#e' + i).val().length) {
        return 'Answer ' + (i+1) + ' is missing';
      }
    }
    return true;
  }

  $('form').submit(function (e) {
    if (!iWillSubmit) {
      e.preventDefault();
      return false;
    }
    // Check if all answers are filled
    var check = checkAnswers();
    if (check === true) {
      $('#validationWarning').hide();
      $('#submitButton').prop('disabled', true);
      return true;
    } else {
      $('#validationWarning').text('ERROR: ' + check).show();
      e.preventDefault();
      return false;
    }
  });


  ////////////////////////////////////////////////////////////////
  // Instructions

  function toggleInstructions(state) {
    $("#showingInstruction").toggle(!!state);
    $("#hidingInstruction").toggle(!state);
  }

  $("#showInstructionButton").click(function () {
    toggleInstructions(true);
  });

  $("#hideInstructionButton").click(function () {
    toggleInstructions(false);
  });

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
        'color': 'red',
        'font-size': '30px',
        'font-weight': 'bold',
        'text-shadow': '0 0 5px yellow, 0 0 10px yellow',
        'overflow': 'visible',
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center',
      }).hide()[0]);
  }

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

  function hideBox(index) {
    var box = frameDoc.getElementById('ANNOTATIONBOX' + index);
    $(box).hide();
  }

  function refreshAllBoxes() {
    for (let i = 0; i < NUM_QUESTIONS; i++) {
      xid = $('#e' + i).val();
      if (xid !== '' && +xid !== -1 && !(isSelectionMode && i == currentQuestion)) {
        moveBox($(frameDoc).find("[data-xid='" + xid + "']")[0], '#7f0', i);
      }
    }
  }
  $(window).resize(refreshAllBoxes);

  function enableSelectMode() {
    isSelectionMode = true;
    $('#answerForm textarea, #answerForm button').prop('disabled', true);
  }

  function selectElement(element) {
    moveBox(element, '#7f0');
    $('#e' + currentQuestion).val($(element).data('xid'));
    isSelectionMode = false;
    currentElement = null;
    $('#answerForm textarea').prop('disabled', noAssignmentId);
    $('#answerForm button').prop('disabled', false);
    $('#submitButton').prop('disabled', noAssignmentId || countHighlights() !== NUM_QUESTIONS);
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
    frameWin.addEventListener('mouseover', function(e) {
      if (isSelectionMode && e.target !== currentElement) {
        moveBox(e.target,' red');
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
        .attr('id', 'e' + i).attr('name', 'e' + i));
    // Command
    $('<h2>').text('Command ' + (i+1))
      .appendTo(questionDiv);
    $('<p>').text(result.phrase)
      .appendTo(questionDiv);
    $('<button type=button>').text('Choose Element ' + (i+1))
      .click(function() {
        currentQuestion = i;
        enableSelectMode();
        $(this).parent().find('button').removeClass('chosen');
        $(this).addClass('chosen');
      }).appendTo(questionDiv);
    $('<button type=button>').text('Not Found')
      .click(function () {
        $('#e' + i).val(-1);
        hideBox(i);
        $(this).parent().find('button').removeClass('chosen');
        $(this).addClass('chosen');
        $('#submitButton').prop('disabled', noAssignmentId || countHighlights() !== NUM_QUESTIONS);
      }).appendTo(questionDiv);
    return questionDiv;
  }

  function finalizeLoading() {
    // Show / Hide instructions
    $("#hideInstructionButton").text("Hide").prop('disabled', false);
    toggleInstructions(noAssignmentId);
    if (!noAssignmentId) {
      $('.question textarea, .question input').prop('disabled', false);
      $('#a1').focus();
    }
  }

  // Load the data
  $.get('inputs/' + dataId + '.json', function (inputData) {
    // Load page
    url = inputData.code[1];
    $.get('pages/' + url + '.html', function (data) {
      frameDoc.open()
      frameDoc.write(data);
      frameDoc.close();
      hackPage();
      // Display questions
      NUM_QUESTIONS = inputData.examples.length;
      inputData.examples.forEach(function (result, i) {
        questionDivs.push(createViewDiv(i, result).appendTo('#questionWrapper'));
        buildBox(i);
      });
      finalizeLoading();
      setInterval(refreshAllBoxes, 1000);
    }).fail(function () {
      alert('Bad URL: "' + url + '" -- Please contact the requester');
    });
  }).fail(function () {
    alert('Bad Data ID: "' + dataId + '" -- Please contact the requester');
  });

});
