
var htmlRegex = /<\s*(\w+)(?:[^>]|[^"]"[^"]"|[^']'[^']')*>[^<>]*<\/\s*\1\s*>|<\s*(?:area|base|br|col|command|embed|hr|img|input|link|meta|param|source|body|colgroup|dd|dt|head|html|li|optgroup|option|p|tbody|td|tfoot|th|thead|tr)\s*(?:[^>\/]|[^"]"[^"]"|[^']'[^']')*\/?>/i;

function isHtml(pattern){
  return htmlRegex.test(pattern);
}

var htmlWrappedRegex = /^<\s*(\w+)(?:[^>]|[^"]"[^"]"|[^']'[^']')*>.*<\/\s*\1\s*>$/i;

function isHtmlWrapped(pattern){
  return htmlWrappedRegex.test(pattern);
}

isHtml.wrapped = isHtmlWrapped;

module.exports = isHtml;