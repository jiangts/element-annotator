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
  var taskName = gup("taskName").replace(/_/g, ' ') || '(unknown)';
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

  var frameDoc = document.getElementById('webpage').contentDocument;
  var frameWin = document.getElementById('webpage').contentWindow;

  const NUM_QUESTIONS = 5, NUM_INPUTS_PER_QUESTION = 3;
  var questionDivs = [], currentQuestion = 0;

  ////////////////////////////////////////////////////////////////
  // Navigation

  function goToQuestion(questionNum) {
    $('.question').hide();
    questionDivs[questionNum].show();
    $('#qNum').text('' + (questionNum + 1) + ' / ' + questionDivs.length);
    $('#prevButton').prop('disabled', questionNum === 0);
    $('#nextButton').toggle(questionNum !== questionDivs.length - 1);
    $('#submitButton').toggle(questionNum === questionDivs.length - 1);
    currentQuestion = questionNum;
    $('#qNum').trigger('questionChanged');
  }

  $('#prevButton').click(function () {
    goToQuestion(currentQuestion - 1);
  });
  
  $('#nextButton').click(function () {
    goToQuestion(currentQuestion + 1);
  });

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

  function checkAnswers() {
    for (let i = 0; i < NUM_QUESTIONS; i++) {
      let box = frameDoc.getElementById('ANNOTATIONBOX' + i);
      if (box.style.borderColor !== 'green') {
        goToQuestion(i);
        return 'Question ' + (i+1) + ' does not have a selected element';
      }
      for (let j = 0; j < NUM_INPUTS_PER_QUESTION; j++) {
        let text = clean($('#a' + i + '' + j).val());
        $('#a' + i + '' + j).val(text);
        if (!text.length) {
          goToQuestion(i);
          return 'Question ' + (i+1) + ' is missing answer ' + (j+1);
        }
        for (let k = 0; k < j; k++) {
          if ($('#a' + i + '' + k).val() == text) {
            goToQuestion(i);
            return 'Question ' + (i+1) + ' has repeated answers';
          }
        }
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
        'position': 'absolute',
        'pointer-events': 'none',
        'z-index': 999999999,
        'background-color': 'rgba(255,255,255,0.5)',
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
    $(box).show().css({
      'top': rect.top,
      'left': rect.left,
      'height': rect.height,
      'width': rect.width,
      'border-color': color,
    });
    currentElement = el;
  }

  function enableSelectMode() {
    isSelectionMode = true;  
    $('#answerForm input, #answerForm button').prop('disabled', true);
  }

  function selectElement(element) {
    moveBox(element, 'green');
    $('#e' + currentQuestion).val($(element).data('xid'));
    isSelectionMode = false;
    currentElement = null;
    $('#answerForm input').prop('disabled', noAssignmentId);
    $('#answerForm button').prop('disabled', false);
    $('#prevButton').prop('disabled', currentQuestion === 0);
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

  function createQuestionDiv(i) {
    var questionDiv = $('<div class=question>').hide();
    questionDiv.append($('<input type=hidden>')
        .attr('id', 'e' + i).attr('name', 'e' + i));
    for (let j = 0; j < NUM_INPUTS_PER_QUESTION; j++) {
      questionDiv.append($('<p class=answerRow>')
          .append($('<span class=numbering>').text('' + (j+1) + '.'))
          .append($('<input type=text disabled>')
            .attr('id', 'a' + i + '' + j).attr('name', 'a' + i + '' + j)
            .val(noAssignmentId ? 'PREVIEW MODE' : '')));
    }
    questionDiv.append($('<button type=button class=selectElementButton>')
        .text('Highlight Element')
        .click(enableSelectMode));
    return questionDiv;
  }

  function createQuestionDivFromDatum(datum, i) {
    var questionDiv = $('<div class=question>').hide();
    datum.answers.forEach(function (answer, j) {
      questionDiv.append($('<p class=answerRow>')
          .append($('<span class=numbering>').text('' + (j+1) + '.'))
          .append($('<span class=view-answer>').text(answer)));
    });
    return questionDiv;
  }

  function finalizeLoading() {
    // Show / Hide instructions
    $("#hideInstructionButton").text("Hide").prop('disabled', false);
    toggleInstructions(noAssignmentId);
    if (!noAssignmentId) {
      $('.question textarea, .question input, #submitButton').prop('disabled', false);
      $('#a1').focus();
    }
    goToQuestion(0);
  }

  // Load the page!
  $.get('pages/' + dataId + '.json', function (data) {
    if (data.processedhtml === undefined) {
      if (data.html) {
        data.processedhtml = data.html
      } else {
        alert('Bad URL: "' + dataId + '" -- Please contact the requester');
        return;
      }
    } 
    $('input[name="url"]').val(data.url);
    $('#taskName').text('Task: ' + taskName);
    $('input[name="task"]').val(taskName);
    frameDoc.documentElement.innerHTML = data.processedhtml;
    hackPage();
    // Add question divs
    if (assignmentId === 'view') {
      $.get('results/' + 'ans-' + dataId + '.json', function (viewData) {
        viewData.forEach(function (datum, i) {
          questionDivs.push(createQuestionDivFromDatum(datum).appendTo('#questionWrapper'));
          buildBox(i);
          moveBox($(frameDoc).find("[data-xid='" + datum.xid + "']")[0], 'green', i);
        });
        finalizeLoading();
        $('#submitButton').remove();
        $('#taskName').after($('<button type=button class=selectElementButton>')
            .text('Relocate Elements')
            .click(function () {
              viewData.forEach(function (datum, i) {
                moveBox($(frameDoc).find("[data-xid='" + datum.xid + "']")[0], 'green', i);
              });
            }));
      });
    } else {
      for (let i = 0; i < NUM_QUESTIONS; i++) {
        questionDivs.push(createQuestionDiv(i).appendTo('#questionWrapper'));
        buildBox(i);
      }
      finalizeLoading();
    }
  }).fail(function () {
    alert('Bad URL: "' + dataId + '" -- Please contact the requester');
  });

});
