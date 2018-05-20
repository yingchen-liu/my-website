var base = $('#var-base').val();

editormd.emoji = {
  path: base + '/emojis/',
  ext: '.png'
};

editormd.markdownToHTML('markdown-body', {
  markdown: $('#markdown-content').val(),
  path: base + '/js/markdown/lib/',
  htmlDecode: 'style,script,iframe',
  tocm: true,
  emoji: true,
  taskList: true,
  tex: true,
  flowChart: true,
  sequenceDiagram: true,
});

$('.ui.embed').embed();

if ($('#var-editing-mode').val() === 'true') {
  Dropzone.autoDiscover = false;
  
  var editor = editormd('markdown-editor', {
    height: 600,
    dialogLockScreen: false,
    path: base + '/js/markdown/lib/',
    pluginPath: base + '/js/markdown/plugins/',
    htmlDecode: 'style,script,iframe', 
    tex: true,
    emoji: true,
    taskList: true,
    flowChart: true, 
    sequenceDiagram: true,
    imageUpload: true,
    imageFormats: ['jpg', 'jpeg', 'gif', 'png', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'mp3', 'mp4', 'avi', 'wmv'],
    imageUploadURL: base + '/uploads?type=projects',
  });

  $('[name=name]').on('input', function() {
    var $that = $(this);
    var $form = $that.closest('form');
    var slug = getSlug($that.val());
    $form.find('[name=slug]').val(slug);
  });

  $('.btn-save').click(function() {
    var $that = $(this);
    var $form = $that.closest('form');
    $form.addClass('loading');

    var id = $form.find('[name=id]').val();
    var type = $form.find('[name=type]').val();
    var cover = $form.find('[name=cover]').val();
    var name = $form.find('[name=name]').val();
    var brief = $form.find('[name=brief]').val();
    var label = $form.find('[name=label]').val();
    var responsibilities = $form.find('[name=responsibilities]').val();
    var fromMonth = $form.find('[name=from-month]').val();
    var fromYear = $form.find('[name=from-year]').val();
    var toMonth = $form.find('[name=to-month]').val();
    var toYear = $form.find('[name=to-year]').val();
    var technologies = $form.find('[name=technologies]').val();
    var slug = $form.find('[name=slug]').val();
    var showInResume = $form.find('[name=show-in-resume]').parent().checkbox('is checked');
    var isDraft = $form.find('[name=is-draft]').parent().checkbox('is checked');
    var content = editor.getMarkdown();

    $.post(base + '/projects/' + id, {
      name: name,
      type: type,
      cover: cover,
      brief: brief,
      label: label,
      responsibilities: responsibilities,
      fromMonth: fromMonth,
      fromYear: fromYear,
      toMonth: toMonth,
      toYear: toYear,
      technologies: technologies,
      content: content,
      slug: slug,
      showInResume: showInResume,
      isDraft: isDraft
    }).done(function(data) {
      window.location = base + '/projects/' + data.project.slug;
    }).fail(function (jqXHR) {
      $form.removeClass('loading');
      showFormError($form, getError(jqXHR));
    });
  });

  $('#project-cover-dropzone').dropzone({
    url: base + '/uploads?type=projects',
    previewsContainer: '#project-cover-dropzone',
    maxFiles: 1,
    init: function() {
      this.on('maxfilesexceeded', function(file) {
				this.removeAllFiles();
        this.addFile(file);
      });
      
      this.on('success', function (file) {
        var response = JSON.parse(file.xhr.response);

        $('[name=cover]').val(response.path);
        $('#project-cover-dropzone').attr('src', response.url + '?' + Date.now());
      });
    }
  })
}