# jquery-simple-upload

A jquery plugin for ajax file upload.

## Dependencies

* jquery

## Installation

Install from npm:

    $ npm install @kanety/jquery-simple-upload --save

## Usage

Build file input field:

```html
<input type="file" name="file" multiple="true" id="input">
```

Then run:

```javascript
$('#input').simpleUpload({
  url: 'YOUR_BACKEND_URL',
  method: 'post'
});
```

### Options

Add drop zone and progress message:

```html
<div id="drop_zone"></div>
<div id="progress"></div>
```

```javascript
$('#input').simpleUpload({
  ...
  dropZone: '#drop_zone',
  progress: '#progress'
});
```

Set ajax options:

```javascript
$('#input').simpleUpload({
  ...
  headers: {
    'HEADER_KEY': 'HEADER_VALUE'
  },
  dataType: 'application/json',
  timeout: 0,
  async: true
});
```

Set query parameters:

```javascript
$('#input').simpleUpload({
  // object
  params: {
    'KEY': 'VALUE'
  },
});

$('#input').simpleUpload({
  // callback
  params: function() {
    return { 'KEY': 'VALUE' };
  },
});
```

### Validations

```javascript
$('#input').simpleUpload({
  ...
  maxFileNum: 4,
  maxFileSize: 10 * 1024 * 1024, // Bytes
  allowedFileName: /\.txt$/,
  allowedMimeType: /^text\//
}).on('upload:over', function(e, files) {
  ...
}).on('upload:invalid', function(e, files) {
  // files[i].reason contains the rejected reason
  ...
});
```

### Callbacks

```javascript
$('#input').simpleUpload({
  ...
}).on('upload:before', function(e, files) {
  ...
}).on('upload:after', function(e, files) {
  ...
}).on('upload:start', function(e, file, i) {
  ...
}).on('upload:progress', function(e, file, i, loaded, total) {
  ...
}).on('upload:end', function(e, file, i) {
  ...
}).on('upload:done', function(e, file, i) {
  ...
}).on('upload:fail', function(e, file, i) {
  ...
});
```

## License

The library is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
