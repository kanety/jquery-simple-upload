import $ from 'jquery';

import { NAMESPACE } from './consts';

const DEFAULTS = {
  url: '',
  method: 'post',
  headers: {},
  dataType: null,
  params: {},
  timeout: 0,
  async: true,
  dropZone: null,
  progress: null,
  maxFileSize: null,
  maxFileNum: null,
  allowedFileName: null,
  allowedMimeType: null
};

export default class SimpleUpload {
  constructor(input, options = {}) {
    this.options = $.extend({}, DEFAULTS, options);

    this.$input = $(input);
    this.$dropZone = $(this.options.dropZone);
    this.$progress = $(this.options.progress);

    this.uid = new Date().getTime() + Math.random();
    this.namespace = `${NAMESPACE}-${this.uid}`;

    this.dragCounter = 0;

    this.init();
  }

  init() {
    this.$input.addClass(NAMESPACE);
    this.$dropZone.addClass(NAMESPACE).addClass('upload-droppable');
    this.$progress.addClass(NAMESPACE);

    this.unbind();
    this.bind();
  }

  destroy() {
    this.$input.removeClass(NAMESPACE);
    this.$dropZone.removeClass(NAMESPACE).removeClass('upload-droppable');
    this.$progress.removeClass(NAMESPACE);

    this.unbind();
  }

  bind() {
    this.$input.on(`change.${this.namespace}`, (e) => {
      this.process(e.target.files);
      e.target.value = '';
    });

    if (this.$dropZone.length) {
      this.$dropZone.on(`drop.${NAMESPACE}`, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dragCounter = 0;
        this.$dropZone.removeClass('upload-dragover');
        this.process(e.originalEvent.dataTransfer.files);
      }).on(`dragenter.${NAMESPACE}`, (e) => {
        e.preventDefault();
        this.dragCounter++;
        this.$dropZone.addClass('upload-dragover');
      }).on(`dragleave.${NAMESPACE}`, (e) => {
        e.preventDefault();
        this.dragCounter--;
        if (this.dragCounter == 0) {
          this.$dropZone.removeClass('upload-dragover');
        }
      });

      $(document).on(`drop.${this.namespace}`, (e) => {
        e.preventDefault();
      }).on(`dragover.${this.namespace}`, (e) => {
        e.preventDefault();
      });
    }
  }

  unbind() {
    this.$input.off(`.${this.namespace}`);
    this.$dropZone.off(`.${this.namespace}`);
    $(document).off(`.${this.namespace}`);

    let events = $._data(this.$input.get(0), 'events');
    if (events) {
      let names = Object.keys(events).filter(name => name.match(/^upload:/));
      this.$input.off(names.join(' '));
    }
  }

  process(files) {
    if (this.$input.prop('disabled')) return;

    if (this.options.maxFileNum && files.length > this.options.maxFileNum) {
      this.$input.trigger('upload:over', [files]);
      return;
    }

    let [passed, rejected] = this.validate(files)

    if (rejected.length > 0) {
      this.$input.trigger('upload:invalid', [rejected]);
    }
    if (passed.length > 0) {
      this.uploadFiles(passed);
    }
  }

  validate(files) {
    let passed = [], rejected = [];

    for (let i=0; i<files.length; i++) {
      let file = files[i];
      if (this.options.maxFileSize && file.size > this.options.maxFileSize) {
        file.reason = 'size';
        rejected.push(file);
      } else if (this.options.allowedFileName && !file.name.match(this.options.allowedFileName)) {
        file.reason = 'name';
        rejected.push(file);
      } else if (this.options.allowedMimeType && !file.type.match(this.options.allowedMimeType)) {
        file.reason = 'type';
        rejected.push(file);
      } else {
        passed.push(file);
      }
    }

    return [passed, rejected];
  }

  uploadFiles(files) {
    this.$input.prop('disabled', true);
    this.before(files);

    let d = (new $.Deferred()).resolve();
    for (let i=0; i<files.length; i++) {
      d = d.then(() => {
        return this.uploadFile(files[i], i)
      });
    }
    d.then(() => {
      this.after(files);
      this.$input.prop('disabled', false);
    })
  }

  uploadFile(file, index) {
    let d = new $.Deferred();
    $.ajax({
      url: this.options.url,
      method: this.options.method,
      headers: this.options.headers,
      dataType: this.options.dataType,
      data: this.buildFormData(file),
      timeout: this.options.timeout,
      async: this.options.async,
      processData: false,
      contentType: false,
      beforeSend: () => {
        this.start(file, index);
      },
      xhr: () => {
        let xhr = $.ajaxSettings.xhr();
        if (xhr.upload) {
          xhr.upload.addEventListener('progress', (e) => {
            this.progress(file, index, e.loaded, e.total);
          }, false);
        }
        return xhr;
      },
    }).done((data, status, xhr) => {
      this.done(file, index, data, status, xhr);
    }).fail((xhr, status, error) => {
      this.fail(file, index, xhr, status, error);
    }).always(() => {
      this.end(file, index);
      d.resolve();
    });
    return d.promise();
  }

  before(files) {
    if (this.$progress.length) {
      files.forEach((file, index) => {
        this.buildProgress(file, index);
      });
    }

    this.$input.trigger('upload:before', [files]);
  }

  after(files) {
    this.$input.trigger('upload:after', [files]);
  }

  start(file, index) {
    this.$input.trigger('upload:start', [file, index]);
  }

  progress(file, index, loaded, total) {
    this.findProgress(index).find('.upload-percent').text(Math.ceil((loaded/total)*100) + '%');

    this.$input.trigger('upload:progress', [file, index, loaded, total]);
  }

  done(file, index, data, status, xhr) {
    this.$input.trigger('upload:done', [file, index, data, status, xhr]);
  }

  fail(file, index, xhr, status, error) {
    this.$input.trigger('upload:fail', [file, index, xhr, status, error]);
  }

  end(file, index) {
    this.findProgress(index).hide('fast', (elem) => $(elem).remove());

    this.$input.trigger('upload:end', [file, index]);
  }

  buildProgress(file, index) {
    let $p = $('<div>').addClass('upload-progress').data('upload-index', index);
    $('<span>').addClass('upload-filename').text(file.name).appendTo($p);
    $('<span>').addClass('upload-percent').text('...').appendTo($p);
    this.$progress.append($p);
  }

  findProgress(index) {
    return this.$progress.find('.upload-progress').filter((i, elem) => {
      return $(elem).data('upload-index') == index;
    });
  }

  buildFormData(file) {
    let data = new FormData();
    data.append(this.$input.attr('name'), file);
    for (let key in this.options.params) {
      data.append(key, this.options.params[key]);
    }
    return data;
  }

  static getDefaults() {
    return DEFAULTS;
  }

  static setDefaults(options) {
    return $.extend(DEFAULTS, options);
  }
}
