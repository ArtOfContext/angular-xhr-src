# angular-xhr-src

Request IMG src and LINK href via XHR and serve as Blob URL. Useful for apps running under Content Security Policy (CSP) such as Chrome Apps.  Uses [this approach: Referencing External Content](https://developer.chrome.com/apps/app_external#external).

## Usage

```
// dependency on xhrSrc
angular.module('myApp', ['xhrSrc'])
```

```
<!-- use xhr-src instead of src and request will be made via XHR -->
<img xhr-src="http://placehold.it/400x250/000000/ff0000/&text=xhr-src%20works!">
```

```
<!-- use xhr-href instead of href and request will be made via XHR -->
<link rel="stylesheet" xhr-href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.4/css/bootstrap.css">
```