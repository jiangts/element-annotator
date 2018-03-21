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

  var frameDoc = document.getElementById('webpage').contentDocument
  var frameWin = document.getElementById('webpage').contentWindow

  const NUM_QUESTIONS = 5;
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

  $('form').submit(function() {
    if (!iWillSubmit) return false;
    // Check if all text fields are filled.
    var ok = true;
    $('#questionWrapper textarea').each(function (i, elt) {
      var text = clean($(elt).val());
      $(elt).val(text);
      if (!text.length && i < questionDivs.length - 1) ok = false;
    });
    if (ok) {
      $('#validationWarning').hide();
      $('#submitButton').prop('disabled', true);
      return true;
    } else {
      $('#validationWarning').show();
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
  // Load data

  function moveBox(el) {
    var box = frameDoc.getElementById('ANNOTATIONBOX');
    if (!box) {
      box = $('<div id="ANNOTATIONBOX" style="border: 2px solid red; position: absolute; pointer-events: none; z-index: 999999; background-color: rgba(255,255,255,0.5);"></div>')[0]
      frameDoc.body.appendChild(box)
    }
    var rect = el.getBoundingClientRect();
    console.log(el, rect);
    box.style.top = '' + rect.top + 'px';
    box.style.left = '' + rect.left + 'px';
    box.style.height = '' + rect.height + 'px';
    box.style.width = '' + rect.width + 'px';
  }

  function hackPage() {
    frameWin.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
    })
    frameWin.addEventListener('mousedown', function(e) {
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

  // Load the page!
  $.get('/pages/' + dataId, function (data) {
    if (data.processedhtml === undefined) {
      alert('Bad URL: "' + dataId + '" -- Please contact the requester');
      return;
    } 
    frameDoc.documentElement.innerHTML = data.processedhtml;
    hackPage();
    // Add question divs
    for (let i = 0; i < NUM_QUESTIONS; i++) {
      questionDivs.push(
        $('<div class=question>').hide()
          .appendTo('#questionWrapper')
      );
    }
    // Show / Hide instructions
    $("#hideInstructionButton").text("Hide").prop('disabled', false);
    toggleInstructions(noAssignmentId);
    if (!noAssignmentId) {
      $('.question textarea, .question input, #submitButton').prop('disabled', false);
      $('#a1').focus();
    }
    goToQuestion(0);
  }).fail(function () {
    alert('Bad URL: "' + dataId + '" -- Please contact the requester');
  });

});
