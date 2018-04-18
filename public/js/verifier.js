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

  var NUM_QUESTIONS = 5;
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

  function clean(text, cleanNewlines) {
    var answer = [];
    text.split(/\n/).forEach(function (x) {
      x = x.replace(/\s+/g, ' ').replace(/^ | $/g, '');
      if (x.length) answer.push(x);
    });
    return answer.join(cleanNewlines ? " " : "\n");
  }

  function countHighlights() {
    var count = 0;
    for (let i = 0; i < NUM_QUESTIONS; i++) {
      let box = frameDoc.getElementById('ANNOTATIONBOX' + i);
      if (box.style.borderColor === 'green') {
        count++;
      }
    }
    return count;
  }

  function checkAnswers() {
    for (let i = 0; i < NUM_QUESTIONS; i++) {
      $('#a' + i).val(clean($('#a' + i).val(), true));
    }
    for (let i = 0; i < NUM_QUESTIONS; i++) {
      if (!$('#a' + i).val().length) {
        return 'Command ' + (i+1) + ' is missing';
      }
      let box = frameDoc.getElementById('ANNOTATIONBOX' + i);
      if (box.style.borderColor !== 'green') {
        return 'Command ' + (i+1) + ' does not have a highlighted element';
      }
    }
    return true;
  }

  $('form').submit(function() {
    if (!iWillSubmit) return false;
    // Check if all text fields are filled.
    var check = checkAnswers();
    if (check === true) {
      $('#validationWarning').hide();
      $('#submitButton').prop('disabled', true);
      return true;
    } else {
      $('#validationWarning').text('ERROR: ' + check).show();
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
        'color': 'black',
        'font-size': '30px',
        'font-weight': 'bold',
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

  function refreshAllBoxes() {
    for (let i = 0; i < NUM_QUESTIONS; i++) {
      xid = $('#e' + i).val();
      if (xid !== '' && !(isSelectionMode && i == currentQuestion)) {
        moveBox($(frameDoc).find("[data-xid='" + xid + "']")[0], 'green', i);
      }
    }
  }
  $(window).resize(refreshAllBoxes);

  function enableSelectMode() {
    isSelectionMode = true;  
    $('#answerForm textarea, #answerForm button').prop('disabled', true);
  }

  function selectElement(element) {
    moveBox(element, 'green');
    $('#e' + currentQuestion).val($(element).data('xid'));
    isSelectionMode = false;
    currentElement = null;
    $('#answerForm textarea').prop('disabled', noAssignmentId);
    $('#answerForm button').prop('disabled', false);
    $('#submitButton').prop('disabled', noAssignmentId || countHighlights() !== NUM_QUESTIONS);
  }

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
        moveBox(e.target, 'red')
      }
    })
  }

  ////////////////////////////////////////////////////////////////
  // Load data

  var DUMMY_DATA = [
    'click on store',
    'click on gmail',
    'Activate voice search',
    'in the search box, type birds',
    'go directly to first search result',
    ];

  function createQuestionDiv(i) {
    var questionDiv = $('<div class=question>');
    questionDiv.append($('<input type=hidden>')
        .attr('id', 'e' + i).attr('name', 'e' + i));
    // Command
    $('<h2>').text('Command ' + (i+1)).appendTo(questionDiv);
    questionDiv.append($('<p class=answerRow>')
        //.append($('<textarea disabled>')
        //  .attr('id', 'a' + i).attr('name', 'a' + i)
        //  .val(noAssignmentId ? 'PREVIEW MODE' : ''))
        .append($('<div class=phrase>').text(DUMMY_DATA[i]))
        );
    // Highlight
    questionDiv.append($('<p class=buttonRow>')
        .append($('<button type=button class=selectElementButton>')
          .text('Highlight Element')
          .click(function () {
            currentQuestion = i;
            enableSelectMode();
          }))
        .append(' ')
        .append($('<button type=button class=selectElementButton>')
          .text('Element Not Present')
          .click(function () {
            // TODO
          }))
        );
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

  // Load the page!
  $.get('pages/' + dataId + '.html', function (data) {
    //frameDoc.documentElement.innerHTML = data;
    frameDoc.open()
    frameDoc.write(data);
    frameDoc.close();
    hackPage();
    for (let i = 0; i < NUM_QUESTIONS; i++) {
      questionDivs.push(createQuestionDiv(i).appendTo('#questionWrapper'));
      buildBox(i);
    }
    finalizeLoading();
    setInterval(refreshAllBoxes, 1000);
  }).fail(function () {
    alert('Bad URL: "' + dataId + '" -- Please contact the requester');
  });

});
