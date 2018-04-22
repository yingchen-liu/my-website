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
    }).fail(function(jqXHR) {
      $form.removeClass('loading');
      showFormError($form, getError(jqXHR));
    });
  });

  $('.btn-save-skill').click(function() {
    var $that = $(this);
    var $form = $that.closest('form');
    $form.addClass('loading');

    var id = $form.find('[name=id]').val();
    var icon = $form.find('[name=icon]').val();
    var name = $form.find('[name=name]').val();
    var link = $form.find('[name=link]').val();
    var fluency = $form.find('[name=fluency]').val();

    $.post(base + '/skills/' + id, {
      icon: icon,
      name: name,
      website: link,
      fluency: fluency
    }).done(function(data) {
      
    }).fail(function(jqXHR) {
      showFormError($form, getError(jqXHR));
    }).always(function() {
      $form.removeClass('loading');
    })
  });

  $('.btn-add-skill').click(function() {
    var $that = $(this);
    var $form = $that.closest('form');
    $form.addClass('loading');

    var type = $form.find('[name=type]').val();
    var icon = $form.find('[name=icon]').val();
    var name = $form.find('[name=name]').val();
    var link = $form.find('[name=link]').val();
    var fluency = $form.find('[name=fluency]').val();

    $.post(base + '/skills/' + id, {
      type: type,
      icon: icon,
      name: name,
      website: link,
      fluency: fluency
    }).done(function(data) {
      
    }).fail(function(jqXHR) {
      showFormError($form, getError(jqXHR));
    }).always(function() {
      $form.removeClass('loading');
    })
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

  $('.skill-icon-dropzone').each(function() {
    var $that = $(this);

    $that.dropzone({
      url: base + '/uploads?type=skills',
      previewsContainer: $that.first().getPath(),
      maxFiles: 1,
      init: function() {
        this.on('maxfilesexceeded', function(file) {
          this.removeAllFiles();
          this.addFile(file);
        });
        
        this.on('success', function (file) {
          var response = JSON.parse(file.xhr.response);
  
          $that.parent().find('[name=icon]').val(response.path);
          $that.attr('src', response.url + '?' + Date.now());
        });
      }
    });
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