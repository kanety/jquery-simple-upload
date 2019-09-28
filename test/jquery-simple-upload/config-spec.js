describe('jquery-simple-upload', () => {
  it('config', () => {
    let defaults = $.SimpleUpload.getDefaults();
    expect(defaults.url).toEqual('');

    defaults = $.SimpleUpload.setDefaults({url: 'test'});
    expect(defaults.url).toEqual('test');
  });
});
