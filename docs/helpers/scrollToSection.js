
function scrollToSection($el, sectionTitle){
    if(sectionTitle){
      setTimeout(function(){
        var $section = $el.find('[data-section="'+sectionTitle+'"]');
        if($section.length < 1){ return; }
        var bounds = $section.offset();
        document.body.scrollTop = bounds.top - 55;
      });
    }
}

module.exports = scrollToSection;