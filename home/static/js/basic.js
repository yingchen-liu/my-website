var base = $('#var-base').val();

var getError = function(jqXHR) {
  if (jqXHR.responseJSON) {
    return jqXHR.responseJSON.err;
  } else if (jqXHR.responseText) {
    return {
      msg: jqXHR.responseText
    };
  } else {
    return {
      msg: jqXHR.status + '(' + jqXHR.statusText + ')'
    };
  }
};

jQuery.fn.extend({
  getPath: function() {
    var pathes = [];

    this.each(function(index, element) {
      var path, $node = jQuery(element);

      while ($node.length) {
        var realNode = $node.get(0), name = realNode.localName;
        if (!name) break;

        name = name.toLowerCase();
        var parent = $node.parent();
        var sameTagSiblings = parent.children(name);

        if (sameTagSiblings.length > 1)
        {
          allSiblings = parent.children();
          var index = allSiblings.index(realNode) +1;
          if (index > 0) {
            name += ':nth-child(' + index + ')';
          }
        }

        path = name + (path ? ' > ' + path : '');
        $node = parent;
      }

      pathes.push(path);
    });

    return pathes.join(',');
  }
});

var clearFormError = function($form) {
  $form.find('.error.message').hide();
  // $form.find('.field').removeClass('error');
  $form.find('[data-param]').removeClass('error').popup('destroy');
};

var showFormError = function($form, err) {
  clearFormError($form);

  $err = $form.find('.error.message');
  $err.find('p').text(err.msg);
  $err.show();

  if (err.fields) {
    err.fields.map(function(field) {
      $form.find('[data-param=' + field.param + ']')
        .addClass('error').
        attr('data-content', field.msg).popup({ 
          inline: true,
          position: 'bottom right',
          className: {
            popup: 'ui popup error'
          }
        });  //.closest('.field').addClass('error');
    })
  }
};

var process = function(base) {
  var processors = [];
  for (var i = 1; i < arguments.length; i++) {
    processors.push(arguments[i]);
  }
  return base + '?p=' + processors.join('-');
};

$('.message .close').click(function() {
  $(this).closest('.message').transition('fade');
});

/**
 * Nav
 */
$('.ui.dropdown').dropdown();

if ($('.ui.sticky').length > 0) {
  $('.ui.sticky').sticky({
    context: '.main.area',
    offset: $('.ui.top.fixed.menu').height() + 5
  });
}

$('.btn-login-popup').popup({
  on: 'click',
  lastResort: 'bottom right',
});

/**
 * Login
 */
var login = function() {
  var $form = $(this).closest('form');
  $form.addClass('loading');
  clearFormError($form);

  var email = $form.find('[name=email]').val();
  var password = md5(md5($form.find('[name=password]').val()));

  $.post(base + '/users/login', {
    email: email,
    password: password
  }).done(function(data) {
    location.reload();
  }).fail(function(jqXHR, textStatus) {
    $form.removeClass('loading');
    showFormError($form, getError(jqXHR));
  });
};

$('.btn-login').click(function() {
  login.apply(this);
});

$('.form-login [type=password]').keyup(function(e) {
  if (e.keyCode === 13) { // enter
    login.apply(this);
  }
});

/**
 * Editing
 */
$('.checkbox-editing-mode').checkbox({
  onChange: function() {
    $.post(base + '/users/editing-mode').done(function() {
      location.reload();
    }).fail(function(jqXHR, textStatus) {
      console.log(getError(jqXHR));
    });
  }
});

var getSlug = function(name) {
  return name.trim().toLowerCase().replace(/[^\w\d\s-]/gi, '').replace(/\s+/gi, '-');
};

/**
 * Anchors
 */
var $anchors = $('a.anchor.auto');

if ($anchors.length > 0) {
  var autoDetectAnchor = true;

  var getCurrentAnchorName = function($anchors) {
    if ($(window).scrollTop() <= $($anchors.get(0)).offset().top) {
      return $($anchors.get(0)).attr('name');
    }
    for (var i = 0; i < $anchors.length; i++) {
      var $anchor = $($anchors.get(i));
      
      if (i < $anchors.length - 1) {
        if ($(window).scrollTop() > $anchor.offset().top &&
            $(window).scrollTop() <= $($anchors.get(i + 1)).offset().top) {
          return $anchor.attr('name');
        }
      } else {
        return $anchor.attr('name');
      }
    }
  };

  var switchActive = function(anchorName) {
    $('.anchor.items .active.anchor.item').removeClass('active');
    $('.anchor.items .anchor.item[data-anchor="' + anchorName + '"]').addClass('active');
  };

  $(window).on('scroll', function() {
    if (!autoDetectAnchor) return;
    switchActive(getCurrentAnchorName($anchors));
  });

  $(document).delegate('.anchor.item', 'click', function() {
    var anchorName = $(this).attr('data-anchor');
    switchActive(anchorName);

    // scroll to type
    autoDetectAnchor = false;
    $('html, body').animate({
      scrollTop: $('a[name="' + anchorName + '"]').offset().top
    }, 200, function() {
      setTimeout(function() {
        autoDetectAnchor = true;
      }, 100);
    });
  });
}

// footer: current year
$('.current-year').text((new Date()).getFullYear());