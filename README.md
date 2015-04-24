# angular-xhr-src — request images and stylesheets via XHR due to CSP constraints

## Usage

```
angular.module('myApp', ['xhrSrc'])
```

```
<img xhr-src="http://placehold.it/400x250/000000/ff0000/&text=xhr-src%20works!">
```

```
<link rel="stylesheet" xhr-href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.4/css/bootstrap.css">
```