# Appy [![Build Status](https://travis-ci.org/spatools/appy.png)](https://travis-ci.org/spatools/appy) [![Bower version](https://badge.fury.io/bo/appy.png)](http://badge.fury.io/bo/appy) [![NuGet version](https://badge.fury.io/nu/appy.png)](http://badge.fury.io/nu/appy)

Set of tools to help Single Page Application development

## Installation

Using Bower:

```console
$ bower install appy --save
```

Using NuGet: 

```console
$ Install-Package Appy
```

## Usage

You could use appy in different context.

### Browser (AMD from source)

#### Configure RequireJS.

```javascript
requirejs.config({
    paths: {
        jquery: 'path/to/jquery',
        underscore: 'path/to/underscore',
        appy: 'path/to/appy'
    }
});
```

#### Load modules

```javascript
define(["appy/cache"], function(cache) {
    cache.loadScript("myScriptKey", "http://url.to/my/script.js").then(function() {
        // my code
    });
});
```

### Browser (with built file)

Include built script in your HTML file.

```html
<script type="text/javascript" src="path/to/jquery.js"></script>
<script type="text/javascript" src="path/to/underscore.js"></script>
<script type="text/javascript" src="path/to/appy.min.js"></script>
```

## Documentation

For now documentation can be found in code.