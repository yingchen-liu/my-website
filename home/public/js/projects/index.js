var base = $('#var-base').val();

if ($('#var-editing-mode').val() === 'true') {
  $('.btn-change-type-icon').popup({
    on: 'click'
  });

  $('.btn-sort-project-type').mousedown(function() {
    if (event.which === 1) {  // left
      $('.projects.items').hide();
      $('html, body').scrollTop($(this).closest('form').offset().top - $('.project-list form[data-role=project-type]:first').offset().top);
    }
  }).mouseup(function() {
    if (event.which === 1) {  // left
      $('.projects.items').show();
    }
  })

  $('.project-list').sortable({
    opacity: 0.5,
    axis: 'y',
    cursorAt: {
      top: 40
    },
    handle: '.btn-sort-project-type'
  }).on('sortstop', function(e, ui) {
    $('.projects.items').show();

    var $form = ui.item.find('form');

    var sort = [];
    $('.project-list').find('[data-role=project-type]').each(function(i, type) {
      var id = $(type).attr('data-id');
      sort.push(id);
    });
    
    $.post(base + '/projects/types/sort', {
      sort: JSON.stringify(sort)
    }).done(function(data) {
      $form.removeClass('loading');
    }).fail(function (jqXHR) {
      $form.removeClass('loading');
      showFormError($form, getError(jqXHR));
    });
  });

  $('.project-list').delegate('.change-icon.popup [name=icon-name]', 'input', function() {
    var $that = $(this);
    var $icon = $that.closest('.change-icon.popup').prev();
    var iconName = $that.val();
    $icon.removeClass();
    $icon.addClass(iconName + ' icon btn-change-type-icon').attr('data-icon', iconName);
  });

  $('.btn-add-project-type').click(function() {
    var $form = $(this).closest('form');
    $form.addClass('loading');
    clearFormError($form);

    var icon = $form.find('.btn-change-type-icon').attr('data-icon');
    var name = $form.find('[name=type-name]').val();
    var subtitle = $form.find('[name=type-subtitle]').val();
    var slug = $form.find('[name=type-slug]').val();

    $.post(base + '/projects/types', {
      icon: icon,
      name: name,
      slug: slug,
      subtitle: subtitle
    }).done(function(data) {
      // show the new one
      var $template = $('[data-role=project-type-template]');
      var tabIndex = parseInt($form.find('[name=type-name]').attr('tabindex'));
      var $new = $template.clone()
        .attr('data-role', 'project-type')
        .attr('data-id', data.projectType.id);
      $new.find('.anchor').attr('name', data.projectType.slug);
      $new.find('[name=type-name]').val(data.projectType.name)
        .attr('tabindex', tabIndex);
      $new.find('[name=type-subtitle]').val(data.projectType.subtitle)
        .attr('tabindex', tabIndex + 1);
      $new.find('.btn-edit-project-type').attr('tabindex', tabIndex + 2);
      $new.find('.btn-delete-project-type').attr('tabindex', tabIndex + 3);
      $new.find('[name=type-slug]').val(data.projectType.slug);
      $new.find('.btn-change-type-icon').addClass(data.projectType.icon).popup({
        on: 'click'
      });
      $template.after($new.show());

      // clear the form
      $form.find('input').val('');
      $form.find('[name=type-name]').attr('tabindex', tabIndex + 4);
      $form.find('[name=type-subtitle]').attr('tabindex', tabIndex + 5);
      $form.find('.btn-add-project-type').attr('tabindex', tabIndex + 6);
      $form.find('.btn-change-type-icon').attr('data-icon', '').removeClass().addClass('btn-change-type-icon');
      $form.removeClass('loading');
    }).fail(function (jqXHR) {
      $form.removeClass('loading');
      showFormError($form, getError(jqXHR));
    });
  });

  $('.project-list').delegate('.btn-edit-project-type', 'click', function() {
    var $form = $(this).closest('form');
    $form.addClass('loading');
    clearFormError($form);

    var id = $form.attr('data-id');
    var icon = $form.find('.btn-change-type-icon').attr('data-icon');
    var name = $form.find('[name=type-name]').val();
    var subtitle = $form.find('[name=type-subtitle]').val();
    var slug = $form.find('[name=type-slug]').val();

    $.post(base + '/projects/types/' + id, {
      icon: icon,
      name: name,
      slug: slug,
      subtitle: subtitle
    }).done(function(data) {
      $form.removeClass('loading');
    }).fail(function (jqXHR) {
      $form.removeClass('loading');
      showFormError($form, getError(jqXHR));
    });
  });

  $('.project-list').delegate('.btn-delete-project-type', 'click', function() {
    var $that = $(this);
    var $form = $that.closest('form');
    $form.addClass('loading');
    clearFormError($form);
    var id = $form.attr('data-id')

    $.ajax({
      url: base + '/projects/types/' + id,
      method: 'delete'
    }).done(function(data) {
      $form.remove();
    }).fail(function (jqXHR) {
      $form.removeClass('loading');
      showFormError($form, getError(jqXHR));
    });
  });

  $('.new-type-name').on('input', function() {
    var $that = $(this);
    var $form = $that.closest('form');
    var slug = $that.val().toLowerCase().replace(/[^\w\s-]/gi, '').replace(/\s+/gi, '-');
    $form.find('[name=type-slug]').val(slug);
  });
}