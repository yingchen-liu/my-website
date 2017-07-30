$('.dropdown.item').dropdown();

$('.ui.sticky').sticky({
  context: '.main.area',
  offset: $('.ui.top.fixed.menu').height()
});

var $anchors = $('a.anchor-auto');

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
    $('.anchor-items .active.anchor-item').removeClass('active');
    $('.anchor-items .anchor-item[data-anchor="' + anchorName + '"]').addClass('active');
  };

  $(window).on('scroll', function() {
    if (!autoDetectAnchor) return;
    switchActive(getCurrentAnchorName($anchors));
  });

  $(document).delegate('.anchor-item', 'click', function() {
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