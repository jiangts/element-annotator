$(function() {

  // Get URL Parameters (GUP)
  function gup (name) {
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(window.location.href);
    return (results === null) ? "" : results[1];
  }

  var batchId = gup("batchId");
  var dataId = gup("dataId");

  ////////////////////////////////////////////////////////////////
  // Globals

  var frame = document.getElementById('webpage')
  var frameDoc = frame.contentDocument;
  var frameWin = frame.contentWindow;

  var NUM_QUESTIONS;
  var questionDivs = [], currentQuestion;

  ////////////////////////////////////////////////////////////////
  // Web page interaction

  function buildBox(index) {
    var box = $('<div>')
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
      }).hide();
    frameDoc.body.appendChild(box[0]);
    return box;
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

  var specialBox = null;
  function showSpecialBox(xid) {
    if (specialBox === null) {
      specialBox = buildBox('spc').text('S');
      specialBox.css({'color': 'transparent', 'border': '2px solid cyan',
          'box-shadow': '0 0 30px 20px #0ff, 0 0 0 100000px rgba(0, 0, 0, 20%)'});
    }
    if (xid === -1) {
      specialBox.hide();
    } else {
      moveBox($(frameDoc).find("[data-xid='" + xid + "']")[0], 'green', 'spc');
      // If off-screen, scroll to that element
      if (specialBox.offset().top < $(frameWin).scrollTop()) {
        $(frameDoc).scrollTop(specialBox.offset().top - 100);
      } else if (specialBox.offset().top + specialBox.height() >
          $(frameWin).scrollTop() + frameWin.innerHeight) {
        $(frameDoc).scrollTop(specialBox.offset().top - 100);
      }
      moveBox($(frameDoc).find("[data-xid='" + xid + "']")[0], 'green', 'spc');
    }
  }

  function refreshAllBoxes(event) {
    for (let i = 0; i < NUM_QUESTIONS; i++) {
      xid = $('#e' + i).val();
      if (xid !== '') {
        moveBox($(frameDoc).find("[data-xid='" + xid + "']")[0], 'green', i);
      }
    }
  }
  $(window).resize(refreshAllBoxes);

  var currentFocus = -1;
  function focusBox(index) {
    currentFocus = index;
    for (let i = 0; i < NUM_QUESTIONS; i++) {
      var box = $(frameDoc.getElementById('ANNOTATIONBOX' + i));
      if (index === -1) {
        box.css({'color': 'black', 'border': '5px solid green', 'box-shadow': ''});
      } else if (index === i) {
        box.css({'color': 'transparent', 'border': '1px solid red',
          'box-shadow': '0 0 30px 10px #ff0, 0 0 0 100000px rgba(0, 0, 0, 20%)'});
        // If off-screen, scroll to that element
        if (box.offset().top < $(frameWin).scrollTop()) {
          $(frameDoc).scrollTop(box.offset().top - 100);
        } else if (box.offset().top + box.height() >
            $(frameWin).scrollTop() + frameWin.innerHeight) {
          $(frameDoc).scrollTop(box.offset().top - 100);
        }
      } else {
        box.css({'color': 'transparent', 'border': '', 'box-shadow': ''});
      }
    }
    refreshAllBoxes();
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
    $('<h2>').text('Command ' + (i+1)).appendTo(questionDiv);
    // result.answers.forEach(function (answer) {
    //   if (answer.type !== undefined) {
    //     // Special command
    //     $('<p class=special>').text(answer.type).appendTo(questionDiv)
    //       .attr('title', answer.xid)
    //       .mousemove(function (e) {
    //         $(this).addClass('focused');
    //         showSpecialBox(+answer.xid);
    //       }).mouseout(function (e) {
    //         $(this).removeClass('focused');
    //         showSpecialBox(-1);
    //       }).click(function (e) {
    //         fillInfo(+answer.xid, '#fef');
    //         e.stopPropagation()
    //       });
    //   } else {
    //     // Normal command
    //     $('<p>').text(answer.phrase).appendTo(questionDiv);
    //   }
    // });
    function hoverQuestion (e) {
      questionDiv.addClass('focused');
      focusBox(i);
    };
    function unhoverQuestion(e) {
      $('.question').removeClass('focused');
      if (currentFocus == i) {
        focusBox(-1);
      }
    }


    $('<p>').text(result.phrase+' ('+result.xid+') ').appendTo(questionDiv);
    result.predictions.forEach(function (answer) {
      // Special command
      var text = frameDoc.querySelector("[data-xid='"+answer.xid+"']").textContent
      var scoretext = answer.xid
      // +' f1: '+answer.f1
        +' score: '+answer.score.toFixed(2)
      +' '+text
      var thing = $('<p class=special>').text(scoretext).appendTo(questionDiv)
        .css('display', 'block')
        .attr('title', answer.xid)
        .hover(function (e) {
          $(this).addClass('focused');
          showSpecialBox(+answer.xid);
        }, function (e) {
          $(this).removeClass('focused');
          showSpecialBox(-1);
          hoverQuestion()
        }).click(function (e) {
          fillInfo(+answer.xid, '#fef');
          e.stopPropagation()
        });
      if(answer.match) {
        thing.css('background-color', 'green');
      }
    });
    var predxids = result.predictions.map(m=>m.xid+'')
    if (predxids[0] === ''+result.xid) {
      questionDiv.css('background-color', 'lightgreen')
    }
    else if (predxids.indexOf(''+result.xid) > 0) {
      questionDiv.css('background-color', 'lightyellow')
    } else {
      questionDiv.css('background-color', 'salmon')
    }
    // Event
    questionDiv.hover(hoverQuestion, unhoverQuestion).click(function (e) {
      fillInfo(result.xid, '#ffe');
    });
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
    //frameDoc.documentElement.innerHTML = data;
    frameDoc.open()
    frameDoc.write(data);
    frameDoc.close();
    hackPage();

    // $.get('results/ans-' + dataId + '.json', function (results) {
    //   NUM_QUESTIONS = results.length;
    //   console.log('INDI', typeof results)
    //   results.forEach(function (result, i) {
    //     questionDivs.push(createViewDiv(i, result).appendTo('#questionWrapper'));
    //     buildBox(i);
    //   });
    //   refreshAllBoxes();
    //   setInterval(refreshAllBoxes, 250);
    // });

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
      refreshAllBoxes();
      setInterval(refreshAllBoxes, 250);
    });
  }).fail(function () {
    alert('Bad URL: "' + dataId + '" -- Please contact the requester');
  });

});
