var $ = require('jquery');

function generatePermalinks($el, base){
  var $sections = $el.find('[data-section]');
  $sections.each(function(){
    var $section = $(this);
    if($section.find('.permalink').length > 0){ return; }
    var sectionTitle = $section.data('section');
    $section.prepend('<a href="#/'+base+'/'+sectionTitle+'" class="permalink"><i class="glyphicon glyphicon-link"></i></a>');
  });
}

module.exports = generatePermalinks;