# angular-xhr-src

Request IMG src and LINK href via XHR and serve as Blob URL. Useful for apps running under Content Security Policy (CSP) such as Chrome Apps.  Uses [this approach: Referencing External Content](https://developer.chrome.com/apps/app_external#external).

## Usage

```
// dependency on xhrSrc
angular.module('myApp', ['xhrSrc'])
```

```
<!-- use xhr-src instead of src and request will be made via XHR -->
<img xhr-src="http://cdn.jsdelivr.net/emojione/assets/png/1F414.png?v=1.2.4">
```
[Live demo](http://artofcontext.github.io/angular-xhr-src/demo/xhr-src/index.html)

```
<!-- use xhr-href instead of href and request will be made via XHR -->
<link rel="stylesheet" xhr-href="http://getbootstrap.com/dist/css/bootstrap.min.css">
```
[Live demo](http://artofcontext.github.io/angular-xhr-src/demo/xhr-href/index.html)