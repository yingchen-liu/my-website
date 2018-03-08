var base = $('#var-base').val();

editormd.emoji     = {
  path  : base + '/emojis/',
  ext   : '.png'
};

editormd.markdownToHTML('markdown-body', {
  markdown        : $('#markdown-content').val(),
  path            : base + '/js/markdown/lib/',
  htmlDecode      : 'style,script,iframe',  // you can filter tags decode
  //toc             : false,
  tocm            : true,    // Using [TOCM]
  //tocContainer    : "#custom-toc-container", // 自定义 ToC 容器层
  //gfm             : false,
  //tocDropdown     : true,
  // markdownSourceCode : true, // 是否保留 Markdown 源码，即是否删除保存源码的 Textarea 标签
  emoji           : true,
  taskList        : true,
  tex             : true,  // 默认不解析
  flowChart       : true,  // 默认不解析
  sequenceDiagram : true,  // 默认不解析
});

if ($('#var-editing-mode').val() === 'true') {
  var editor = editormd('markdown-editor', {
    height: 600,
    dialogLockScreen: false,
    path            : base + '/js/markdown/lib/',
    pluginPath: base + '/js/markdown/plugins/',
    htmlDecode      : 'style,script,iframe', 
    tex             : true,
    emoji           : true,
    taskList        : true,
    flowChart       : true, 
    sequenceDiagram : true
  });

  $('.btn-save').click(function() {
    var $that = $(this);
    var $form = $that.closest('form');

    var id = $form.attr('data-id');
    var name = $form.find('[name=name]').val();
    var brief = $form.find('[name=brief]').val();
    var label = $form.find('[name=label]').val();
    var responsibilities = $form.find('[name=responsibilities]').val();
    var fromMonth = $form.find('[name=from-month]').val();
    var fromYear = $form.find('[name=from-year]').val();
    var toMonth = $form.find('[name=to-month]').val();
    var toYear = $form.find('[name=to-year]').val();
    var technologies = $form.find('[name=technologies]').val();
    var content = editor.getMarkdown();

    $.post(base + '/projects/' + id, {
      name: name,
      brief: brief,
      label: label,
      responsibilities: responsibilities,
      fromMonth: fromMonth,
      fromYear: fromYear,
      toMonth: toMonth,
      toYear: toYear,
      technologies: technologies,
      content: content
    }).done(function(data) {
      $form.removeClass('loading');
    }).fail(function (jqXHR) {
      $form.removeClass('loading');
      showFormError($form, getError(jqXHR));
    });
  });
}