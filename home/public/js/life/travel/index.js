/* ---- Map ---- */

mapboxgl.accessToken = 'pk.eyJ1IjoieXR4aXV4aXUiLCJhIjoiY2l4NnByYTZkMDEyOTJ5bXN2OGNyMzU0YSJ9.2XjIDOvVVsT4-WWcdNuBIA';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/ytxiuxiu/cj5nwzw7s4s112rmeirleuql4',
  maxZoom: 4,
  minZoom: 1.5,
  center: [22, 5]
});

map.scrollZoom.disable();
map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

map.on('load', function() {
  var popup = null;

  // add markers to map
  geojson.features.forEach(function(marker) {

    // create a HTML element for each feature
    var el = $('<div></div>')
      .addClass('marker ' + marker.properties.type + ' anchor item')
      .attr('data-coordinates', JSON.stringify(marker.geometry.coordinates))
      .attr('data-name', marker.properties.name)
      .attr('data-anchor', marker.properties.anchorName)
      .click(function() {
        var that = this;
        setTimeout(function() {
          $('a[name="' + $(that).attr('data-anchor') + '"]').next()
            .transition('shake');
        }, 200);
      })
      .on('mouseover', function() {
        popup = new mapboxgl.Popup({
          closeOnClick: false,
          closeButton: false,
          offset: [0, -30]
        })
          .setLngLat(JSON.parse($(this).attr('data-coordinates')))
          .setHTML($(this).attr('data-name'))
          .addTo(map);
      })
      .on('mouseleave', function() {
        popup.remove();
      })

    // make a marker for each feature and add to the map
    var marker = new mapboxgl.Marker(el[0], { 
      offset: [-30 / 2, -30] 
    })
      .setLngLat(marker.geometry.coordinates)
      .addTo(map);
  });
});

/* ---- Post ---- */
$('.selection.dropdown').dropdown();

/* ---- Feed Image ---- */
$('.travel.event .extra.images .image img').click(function() {
  // var $event = $(this).parents('.travel.event');
  
  var $modal = $('.ui.image.modal');
  var $image = $modal.find('.content img');
  $image.attr('src', $(this).attr('data-ori'));
  $modal
    .modal({
      observeChanges: true,
      blurring: true
    })
    .modal('show');
  
  $image.on('load', function() {
    $modal.modal('refresh');
    $image.height($(window).height() - 140);
  }).each(function() {
    if (this.complete) $(this).load();
  });
});

/* ---- Like ---- */
var storageKeyTravelLikes = 'travelLikes'
if (!localStorage.getItem(storageKeyTravelLikes)) {
  localStorage.setItem(storageKeyTravelLikes, JSON.stringify([]));
}
var travelLikes = JSON.parse(localStorage.getItem(storageKeyTravelLikes));
travelLikes.forEach(function(like) {
  $like = $('.like[data-travel-id="' + like + '"]');
  $like.addClass('active');
});

$('.like').click(function() {
  var $this = $(this);
  var id = $this.attr('data-travel-id');
  var $numberOfLikes = $this.find('.number.of.likes');

  if (travelLikes.indexOf(id) < 0) {
    $numberOfLikes.text(parseInt($numberOfLikes.text()) + 1);
    $this.addClass('active');

    travelLikes.push(id);
    console.log(travelLikes)
    localStorage.setItem(storageKeyTravelLikes, JSON.stringify(travelLikes));
  } else {
    $numberOfLikes.text(parseInt($numberOfLikes.text()) - 1);
    $this.removeClass('active');

    travelLikes.splice(travelLikes.indexOf(id));
    console.log(travelLikes)
    localStorage.setItem(storageKeyTravelLikes, JSON.stringify(travelLikes));
  }
})