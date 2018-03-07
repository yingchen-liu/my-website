/**
 * Featured project
 */
$('.featured.project').on('mouseenter', function() {
  $(this).find('.overlay').transition('fade up');
});
$('.featured.project').on('mouseleave', function() {
  $(this).find('.overlay').transition('fade up');
});