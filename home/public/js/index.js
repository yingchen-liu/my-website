var base = $('#var-base').val();

editormd.emoji = {
  path: base + '/emojis/',
  ext: '.png'
};

editormd.markdownToHTML('introduction-body', {
  markdown: $('#introduction-content').val(),
  path: base + '/js/markdown/lib/',
  htmlDecode: 'style,script,iframe',
  emoji: true
});

if ($('#var-editing-mode').val() === 'true') {
  Dropzone.autoDiscover = false;

  var editor = editormd('introduction-editor', {
    height: 353,
    watch: false,
    dialogLockScreen: false,
    path: base + '/js/markdown/lib/',
    pluginPath: base + '/js/markdown/plugins/',
    htmlDecode: 'style,script,iframe', 
    emoji: true,
    toolbarIcons: 'mini'
  });

  $('.btn-save').click(function() {
    var $that = $(this);
    var $form = $that.closest('form');
    $form.addClass('loading');

    var featuredProject = $('[name=featured-project]').parent().dropdown('get value');
    var introduction = editor.getMarkdown();

    $.post(base + '/', {
      introduction: introduction,
      featuredProject: featuredProject
    }).done(function(data) {
      window.location = base + '/'
    }).fail(function (jqXHR) {
      $form.removeClass('loading');
      showFormError($form, getError(jqXHR));
    });
  });

  $('[name=featured-project]').change(function() {
    var $that = $(this);
    var id = $that.val();
    var $option = $that.parent().find('[data-value=' + id + ']');
    var name = $option.text().trim();
    var cover = $option.attr('data-project-cover');
    var slug = $option.attr('data-project-slug');

    $('.featured-project-name').text(name);
    $('.featured-project-cover').attr('src', base + '/' + process(cover, 'w1500', 'c3.5', Date.now()));
    $('.featured-project-link').attr('href', base + '/projects/' + slug).css({ display: 'block' });
  });
}

/**
 * Featured project
 */
$('.featured.project').on('mouseenter', function() {
  $(this).find('.overlay').transition('fade up');
});
$('.featured.project').on('mouseleave', function() {
  $(this).find('.overlay').transition('fade up');
});