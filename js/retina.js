
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * Determine whether or not `window` is available.
 */
var hasWindow = typeof window !== 'undefined';

/*
 * Get the device pixel ratio per our environment.
 * Default to 1.
 */
var environment = hasWindow ? window.devicePixelRatio || 1 : 1;

/*
 * Define a pattern for capturing src url suffixes.
 */
var srcReplace = /(\.[A-z]{3,4}\/?(\?.*)?)$/;
var inlineReplace = /url\(('|")?([^\)'"]+)('|")?\)/i;

/*
 * Define our selectors for elements to target.
 */
var selector = '[data-rjs]';

/*
 * Define the attribute we'll use to mark an image as having been processed.
 */
var processedAttr = 'data-rjs-processed';

/**
 * Shortcut for turning some iterable object into an array.
 *
 * @param  {Iterable} object Any iterable object.
 *
 * @return {Array}
 */
function arrayify(object) {
  return Array.prototype.slice.call(object);
}

/**
 * Chooses the actual image size to fetch, (for example 2 or 3) that
 * will be used to create a suffix like "@2x" or "@3x".
 *
 * @param  {String|Number} cap The number the user provided indicating that
 *                             they have prepared images up to this size.
 *
 * @return {Number} The number we'll be using to create a suffix.
 */
function chooseCap(cap) {
  var numericCap = parseInt(cap, 10);

  /*
   * If the environment's device pixel ratio is less than what the user
   * provided, we'll only grab images at that size.
   */
  if (environment < numericCap) {
    return environment;

    /*
     * If the device pixel ratio is greater than or equal to what the
     * user provided, we'll use what the user provided.
     */
  } else {
      return numericCap;
    }
}

/**
 * Makes sure that, since we are going to swap out the source of an image,
 * the image does not change size on the page.
 *
 * @param  {Element} image An image element in the DOM.
 *
 * @return {Element} The same element that was passed in.
 */
function forceOriginalDimensions(image) {
  if (!image.hasAttribute('data-no-resize')) {
    if (image.offsetWidth === 0 && image.offsetHeight === 0) {
      image.setAttribute('width', image.naturalWidth);
      image.setAttribute('height', image.naturalHeight);
    } else {
      image.setAttribute('width', image.offsetWidth);
      image.setAttribute('height', image.offsetHeight);
    }
  }
  return image;
}

/**
 * Determines whether the retina image actually exists on the server.
 * If so, swaps out the retina image for the standard one. If not,
 * leaves the original image alone.
 *
 * @param {Element} image  An image element in the DOM.
 * @param {String}  newSrc The url to the retina image.
 *
 * @return {undefined}
 */
function setSourceIfAvailable(image, retinaURL) {
  var imgType = image.nodeName.toLowerCase();

  
  var testImage = document.createElement('img');
  testImage.addEventListener('load', function () {
   
    if (imgType === 'img') {
      forceOriginalDimensions(image).setAttribute('src', retinaURL);
    } else {
      image.style.backgroundImage = 'url(' + retinaURL + ')';
    }
  });

  
  testImage.setAttribute('src', retinaURL);


  image.setAttribute(processedAttr, true);
}


function dynamicSwapImage(image, src) {
  var rjs = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

  var cap = chooseCap(rjs);

 
  if (src && cap > 1) {
    var newSrc = src.replace(srcReplace, '@' + cap + 'x$1');
    setSourceIfAvailable(image, newSrc);
  }
}


function manualSwapImage(image, src, hdsrc) {
  if (environment > 1) {
    setSourceIfAvailable(image, hdsrc);
  }
}


function getImages(images) {
  if (!images) {
    return typeof document !== 'undefined' ? arrayify(document.querySelectorAll(selector)) : [];
  } else {
    return typeof images.forEach === 'function' ? images : arrayify(images);
  }
}


function cleanBgImg(img) {
  return img.style.backgroundImage.replace(inlineReplace, '$2');
}

/**
 * Gets all participating images and dynamically swaps out each one for its
 * retina equivalent taking into account the environment capabilities and
 * the densities for which the user has provided images.
 *
 * @param {Iterable} images  Optional. An Array, jQuery selection, or NodeList
 *                           of elements to affect with retina.js. If not
 *                           provided, retina.js will grab all images on the
 *                           page.
 *
 * @return {undefined}
 */
function retina(images) {
  getImages(images).forEach(function (img) {
    if (!img.getAttribute(processedAttr)) {
      var isImg = img.nodeName.toLowerCase() === 'img';
      var src = isImg ? img.getAttribute('src') : cleanBgImg(img);
      var rjs = img.getAttribute('data-rjs');
      var rjsIsNumber = !isNaN(parseInt(rjs, 10));

      /*
       * If the user provided a number, dynamically swap out the image.
       * If the user provided a url, do it manually.
       */
      if (rjsIsNumber) {
        dynamicSwapImage(img, src, rjs);
      } else {
        manualSwapImage(img, src, rjs);
      }
    }
  });
}

/*
 * If this environment has `window`, activate the plugin.
 */
if (hasWindow) {
  window.addEventListener('load', retina);
  window.retinajs = retina;
}

exports.default = retina;