describe('jquery-simple-upload', () => {
  describe('params', () => {
    it('set callback', () => {
      let params = $.SimpleUpload.makeParams(() => {
        return { 'name': 'value' };
      });
      expect(params['name']).toEqual('value');
    });

    it('set array', () => {
      let params = $.SimpleUpload.makeParams([{name: 'name', value: 'value' }]);
      expect(params['name']).toEqual('value');
    });

    it('set object', () => {
      let params = $.SimpleUpload.makeParams({ name: 'value' });
      expect(params['name']).toEqual('value');
    });
  });
});
