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

  $('body').delegate('.btn-save-skill', 'click', function() {
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
    });
  });

  $('body').delegate('.btn-delete-skill', 'click', function() {
    var $that = $(this);
    var $form = $that.closest('form');
    $form.addClass('loading');

    var id = $form.find('[name=id]').val();

    $.ajax({
      url: base + '/skills/' + id,
      method: 'delete'
    }).done(function(data) {
      $form.parent().remove();
    }).fail(function(jqXHR) {
      showFormError($form, getError(jqXHR));
    }).always(function() {
      $form.removeClass('loading');
    });
  });

  $('body').delegate('.btn-add-skill', 'click', function() {
    var $that = $(this);
    var $form = $that.closest('form');
    $form.addClass('loading');

    var type = $form.find('[name=type]').val();
    var icon = $form.find('[name=icon]').val();
    var name = $form.find('[name=name]').val();
    var link = $form.find('[name=link]').val();
    var fluency = $form.find('[name=fluency]').val();

    $.post(base + '/skills/', {
      type: type,
      icon: icon,
      name: name,
      website: link,
      fluency: fluency
    }).done(function(data) {
      var $mobileTemplate = $form.parent().parent().find('.skill-template.mobile');
      var $desktopTemplate = $form.parent().parent().find('.skill-template.computer');

      var $mobile = $mobileTemplate.clone().insertBefore($mobileTemplate).removeClass('skill-template').show();
      var $desktop = $desktopTemplate.clone().insertAfter($mobile).removeClass('skill-template').show();

      // fill in for mobile
      $mobile.find('img').attr('src', base + '/' + data.skill.icon);
      if (data.skill.website) {
        $mobile.find('[data-param=name]').html('<a href="' + data.skill.website + '" class="header" target="_blank">' + data.skill.name + '</a>');
      } else {
        $mobile.find('[data-param=name]').html('<span class="header">' + data.skill.name + '<span>');
      }
      $mobile.find('[data-param=fluency]').text(data.skill.fluency);

      // fill in for desktop
      $desktop.find('[name=id]').val(data.skill.id);
      $desktop.find('img').attr('src', base + '/' + data.skill.icon);
      $desktop.find('[name=icon]').val(data.skill.icon);
      $desktop.find('[name=name]').val(data.skill.name);
      $desktop.find('[name=link]').val(data.skill.website);
      $desktop.find('[name=fluency]').val(data.skill.fluency);

      initSkillDropzone($desktop.find('img'));

      // empty the form
      $form.find('[name=name]').val('');
      $form.find('[name=icon]').val('');
      $form.find('[name=fluency]').val('');
      $form.find('[name=link]').val('');
      $form.find('img').attr('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAB/0lEQVRYhe3Uy04UYRAF4K8HFBBHHOIlYqILExMNJvoOPDYPYdx4XagxxgtiJIMjMNAuqhrbobtnggs3c5JO+r9VnTp1YY455vjPKKqfra2t89pYwDpWcIwRdqc92t7eBovn9ZoosIEBLiaBw7T7ZRYD/0JgCY9F5KN0vohlXMdtPMv9VvTO6XwFT/L9HsYocSIU2EMfD6cZmpVAleflXN8X0R6o1VENBYa4hjtdhmdJwToeJIkjfM//UYvzOol9kY4PQp0zmKZAH4/S8VDIO5jhXYVjUSurbRemKXBT5HbsT7SHMzqvUKSNRnRFcgGXtOe5wsUp5yXW2g6bFChEkQ3y8VGLgyLf7+Tdtnb7hbu4hXf4Wj9sUmAzL487nJcir+/xWgydvmapiySxIOrpRheBDdE6e2mszfkaPuFj7r3N/y4SY1HI93ClicBAFN3PFscVlvACLyf2XyWR5ckHNYxF2q42EbicxrtGZ08U5aHo74poket9IXdbcVcdcRpgvQiPxLDoapvqfDOj2U3CVeEuCpkbh07a/YtcfbGT32oHgQqj/MqGvTaUomUP8K2JwFjk8Icopp6IrOurY9rdlSTwXKiEs3PgBE+FnH3ROk1q9JzNc7U3eb9K6RBvRJ2comkQlaK/18U0bCNwXDsr8TkJT+a/yLvDSedzzDEH/AYLqHgKIyvGVwAAAABJRU5ErkJggg==');
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

  var initSkillDropzone = function($dropzone) {
    $dropzone.dropzone({
      url: base + '/uploads?type=skills',
      previewsContainer: $dropzone.first().getPath(),
      maxFiles: 1,
      init: function() {
        this.on('maxfilesexceeded', function(file) {
          this.removeAllFiles();
          this.addFile(file);
        });
        
        this.on('success', function (file) {
          var response = JSON.parse(file.xhr.response);
  
          $dropzone.parent().find('[name=icon]').val(response.path);
          $dropzone.attr('src', response.url + '?' + Date.now());
        });
      }
    });
  };

  $('.skill-icon-dropzone').each(function() {
    initSkillDropzone($(this));
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