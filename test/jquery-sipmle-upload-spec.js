describe('jquery-simple-upload', () => {
  beforeEach(() => {
    document.body.innerHTML = __html__['index.html'];
    eval($('script').text());
  });

  function change(files) {
    return $.Event('change', {
      target: {
        files: files
      }
    });
  }

  function dragenter() {
    return $.Event('dragenter', {
      preventDefault: () => {},
      stopPropagation: () => {},
    });
  }

  function dragover() {
    return $.Event('dragover', {
      preventDefault: () => {},
      stopPropagation: () => {},
    });
  }

  function dragleave() {
    return $.Event('dragleave', {
      preventDefault: () => {},
      stopPropagation: () => {},
    });
  }

  function drop(files) {
    return $.Event('drop', {
      originalEvent: {
        dataTransfer: {
          files: files
        }
      },
      preventDefault: () => {},
      stopPropagation: () => {},
    });
  }

  function dragdrop($elem, files) {
    $(document).trigger(dragover())
               .trigger(drop(files));
    $elem.trigger(dragenter())
         .trigger(dragenter())
         .trigger(dragleave())
         .trigger(dragleave())
         .trigger(drop(files));
  }

  describe('input', () => {
    beforeEach((done) => {
      let $upload = $('#basic').on('upload:after', done);
      $upload.trigger(change([
        { name: 'file1.txt', type: 'text/plain', size: 1 },
        { name: 'file2.txt', type: 'text/plain', size: 1 }
      ]));
    });

    it('files', () => {
      let $message = $('#basic_message');
      expect($message.text()).toContain('done: file1.txt');
      expect($message.text()).toContain('done: file2.txt');
    });
  });

  describe('dropZone', () => {
    beforeEach((done) => {
      let $upload = $('#basic').on('upload:after', done);
      let $dropZone = $('#basic_drop_zone');
      dragdrop($dropZone, [
        { name: 'file1.txt', type: 'text/plain', size: 1 },
        { name: 'file2.txt', type: 'text/plain', size: 1 }
      ]);
    });

    it('drag and drop', () => {
      let $message = $('#basic_message');
      expect($message.text()).toContain('done: file1.txt');
      expect($message.text()).toContain('done: file2.txt');
    });
  });

  describe('validate', () => {
    beforeEach((done) => {
      spyOn(window, 'alert');
      let $upload = $('#limit').on('upload:over', done);
      $upload.trigger(change([
        { name: 'file1.txt', type: 'text/plain', size: 1 },
        { name: 'file2.txt', type: 'text/plain', size: 1 },
        { name: 'file3.txt', type: 'text/plain', size: 1 },
        { name: 'file4.txt', type: 'text/plain', size: 1 },
        { name: 'file5.txt', type: 'text/plain', size: 1 }
      ]));
    });

    it('number of files', () => {
      expect(window.alert).toHaveBeenCalledWith('Number of files is over');
    });
  });

  describe('validate', () => {
    beforeEach((done) => {
      spyOn(window, 'alert');
      let $upload = $('#limit').on('upload:invalid', done);
      $upload.trigger(change([
        { name: 'file1.txt', type: 'text/plain', size: 1000 },
        { name: 'file2.jpg', type: 'text/plain', size: 1 },
        { name: 'file3.txt', type: 'image/jpeg', size: 1 }
      ]));
    });

    it('file properties', () => {
      expect(window.alert).toHaveBeenCalledWith('Invalid size: file1.txt');
      expect(window.alert).toHaveBeenCalledWith('Invalid name: file2.jpg');
      expect(window.alert).toHaveBeenCalledWith('Invalid type: file3.txt');
    });
  });

  describe('validate', () => {
    beforeEach(() => {
      spyOn(window, 'alert');
      let $upload = $('#limit');
      $upload.trigger(change([
        { name: 'test.txt', type: 'text/plain', size: 1 }
      ]));
    });

    it('custom validator', () => {
      expect(window.alert).toHaveBeenCalledWith("can't upload test.txt");
    });
  });

  describe('destroy', () => {
    let $basic;

    beforeEach(() => {
      eval($('script').text());
      $basic = $('#basic');
      $basic.data('simple-upload').destroy();
    });

    it('destroys existing object', () => {
      expect($basic.hasClass('simple-upload')).toEqual(false);
      expect($._data($basic.get(0), 'events')).toEqual(undefined);
    });
  });
});
