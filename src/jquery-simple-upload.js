import $ from 'jquery';

import { NAMESPACE } from './consts';
import SimpleUpload from './simple-upload';

$.fn.simpleUpload = function(options) {
  return this.each((i, elem) => {
    let $elem = $(elem);
    if ($elem.data(NAMESPACE)) $elem.data(NAMESPACE).destroy();
    $elem.data(NAMESPACE, new SimpleUpload($elem, options));
  });
};

$.SimpleUpload = SimpleUpload;
