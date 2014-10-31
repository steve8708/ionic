IonicModule

.controller('$ionHeaderBar', [
  '$scope',
  '$element',
  '$attrs',
  '$animate',
  '$q',
  '$ionicConfig',
  '$ionicHistory',
function($scope, $element, $attrs, $animate, $q, $ionicConfig, $ionicHistory) {
  var TITLE = 'title';
  var BACK_TEXT = 'back-text';
  var BACK_BUTTON = 'back-button';
  var DEFAULT_TITLE = 'default-title';
  var PREVIOUS_TITLE = 'previous-title';
  var HIDE = 'hide';

  var self = this;
  var titleText = '';
  var previousTitleText = '';
  var titleLeft = 0;
  var titleRight = 0;
  var titleCss = '';
  var isBackShown;
  var titleTextWidth = 0;


  self.title = function(newTitleText) {
    if (arguments.length && newTitleText !== titleText) {
      getEle(TITLE).innerHTML = newTitleText;
      titleText = newTitleText;
      titleTextWidth = 0;
    }
    return titleText;
  };


  self.showBack = function(shouldShow) {
    if (arguments.length && shouldShow !== isBackShown) {
      var backBtnEle = getEle(BACK_BUTTON);
      if (backBtnEle) {
        backBtnEle.classList[ shouldShow ? 'remove' : 'add' ](HIDE);
        isBackShown = shouldShow;
      }
    }
    return isBackShown;
  };


  self.titleTextWidth = function() {
    if (!titleTextWidth) {
      var bounds = ionic.DomUtil.getTextBounds( getEle(TITLE) );
      titleTextWidth = Math.min(bounds && bounds.width || 30);
    }
    return titleTextWidth;
  };


  self.titleWidth = function() {
    var titleWidth = self.titleTextWidth();
    var offsetWidth = getEle(TITLE).offsetWidth;
    if (offsetWidth < titleWidth) {
      titleWidth = offsetWidth + (titleLeft - titleRight - 5);
    }
    return titleWidth;
  };


  self.titleTextX = function() {
    return ($element[0].offsetWidth / 2) - (self.titleWidth() / 2);
  };


  self.titleLeftRight = function() {
    return titleLeft - titleRight;
  };


  self.backButtonTextLeft = function() {
    var offsetLeft = 0;
    var ele = getEle(BACK_TEXT);
    while(ele) {
      offsetLeft += ele.offsetLeft;
      ele = ele.parentElement;
    }
    return offsetLeft;
  };


  self.stage = function(val) {
    $element[0].classList[ val ? 'add' : 'remove' ]('nav-bar-stage');
  };


  self.resetBackButton = function() {
    if ( $ionicConfig.backButton.previousTitleText() ) {
      var previousTitleEle = getEle(PREVIOUS_TITLE);
      if (previousTitleEle) {
        previousTitleEle.classList.remove(HIDE);

        var newPreviousTitleText = $ionicHistory.backTitle();

        if (newPreviousTitleText !== previousTitleText) {
          previousTitleText = previousTitleEle.innerHTML = newPreviousTitleText;
        }
      }
      var defaultTitleEle = getEle(DEFAULT_TITLE);
      if (defaultTitleEle) {
        defaultTitleEle.classList.remove(HIDE);
      }
    }
  };


  self.alignTitle = function(align) {
    var titleEle = getEle(TITLE);

    align = align || $attrs.alignTitle || $ionicConfig.navBar.alignTitle();

    var widths = self.calcWidths(align, false);

    if ( isBackShown && previousTitleText && $ionicConfig.backButton.previousTitleText() ) {
      var previousTitleWidths = self.calcWidths(align, true);

      var availableTitleWidth = $element[0].offsetWidth - previousTitleWidths.titleLeft - previousTitleWidths.titleRight;

      if (self.titleTextWidth() <= availableTitleWidth) {
        widths = previousTitleWidths;
      }
    }

    return self.updatePositions(titleEle, widths.titleLeft, widths.titleRight, widths.buttonsRight, widths.css, widths.showPrevTitle);
  };


  self.calcWidths = function(align, isPreviousTitle) {
    var titleEle = getEle(TITLE);
    var backBtnEle = getEle(BACK_BUTTON);
    var x, y, z, b, c, d, childSize, bounds;
    var childNodes = $element[0].childNodes;
    var buttonsLeft = 0;
    var buttonsRight = 0;
    var isCountRightOfTitle;
    var updateTitleLeft = 0;
    var updateTitleRight = 0;
    var updateCss = '';
    var backButtonWidth = 0;

    // Compute how wide the left children are
    // Skip all titles (there may still be two titles, one leaving the dom)
    // Once we encounter a titleEle, realize we are now counting the right-buttons, not left
    for (x = 0; x < childNodes.length; x++) {
      c = childNodes[x];

      childSize = 0;
      if (c.nodeType == 1) {
        // element node
        if (c === titleEle) {
          isCountRightOfTitle = true;
          continue;
        }

        if (c.classList.contains(HIDE)) {
          continue;
        }

        if (isBackShown && c === backBtnEle) {

          for (y = 0; y < c.children.length; y++) {
            b = c.children[y];

            if (b.classList.contains(BACK_TEXT)) {
              for (z = 0; z < b.children.length; z++) {
                d = b.children[z];

                if (isPreviousTitle) {
                  if ( d.classList.contains(DEFAULT_TITLE) ) continue;
                  backButtonWidth += d.offsetWidth;
                } else {
                  if ( d.classList.contains(PREVIOUS_TITLE) ) continue;
                  backButtonWidth += d.offsetWidth;
                }
              }

            } else {
              backButtonWidth += b.offsetWidth;
            }

          }
          childSize = backButtonWidth;

        } else {
          // not the title, not the back button, not a hidden element
          childSize = c.offsetWidth;
        }

      } else if (c.nodeType == 3 && c.nodeValue.trim()) {
        // text node
        bounds = ionic.DomUtil.getTextBounds(c);
        childSize = bounds && bounds.width || 0;
      }

      if (isCountRightOfTitle) {
        buttonsRight += childSize;
      } else {
        buttonsLeft += childSize;
      }
    }

    // Size and align the header titleEle based on the sizes of the left and
    // right children, and the desired alignment mode
    if (align == 'left') {
      updateCss = 'title-left';
      if (buttonsLeft) {
        updateTitleLeft = buttonsLeft + 15;
      }
      updateTitleRight = buttonsRight + 15;

    } else if (align == 'right') {
      updateCss = 'title-right';
      if (buttonsRight) {
        updateTitleRight = buttonsRight + 15;
      }
      updateTitleLeft = buttonsLeft + 15;

    } else {
      // center the default
      var margin = Math.max(buttonsLeft, buttonsRight) + 10;
      if (margin > 10) {
        updateTitleLeft = updateTitleRight = margin;
      }
    }

    return {
      backButtonWidth: backButtonWidth,
      buttonsLeft: buttonsLeft,
      buttonsRight: buttonsRight,
      titleLeft: updateTitleLeft,
      titleRight: updateTitleRight,
      showPrevTitle: isPreviousTitle,
      css: updateCss
    };
  };


  self.updatePositions = function(titleEle, updateTitleLeft, updateTitleRight, buttonsRight, updateCss, showPreviousTitle) {
    var deferred = $q.defer();

    // only make DOM updates when there are actual changes
    if (updateTitleLeft !== titleLeft) {
      titleEle.style.left = updateTitleLeft ? updateTitleLeft + 'px' : '';
      titleLeft = updateTitleLeft;
    }
    if (updateTitleRight !== titleRight) {
      titleEle.style.right = updateTitleRight ? updateTitleRight + 'px' : '';
      titleRight = updateTitleRight;
    }

    if (updateCss !== titleCss) {
      updateCss && titleEle.classList.add(updateCss);
      titleCss && titleEle.classList.remove(titleCss);
      titleCss = updateCss;
    }

    if ($ionicConfig.backButton.previousTitleText()) {
      var prevTitle = getEle(PREVIOUS_TITLE);
      var defaultTitle = getEle(DEFAULT_TITLE);

      prevTitle && prevTitle.classList[ showPreviousTitle ? 'remove' : 'add'](HIDE);
      defaultTitle && defaultTitle.classList[ showPreviousTitle ? 'add' : 'remove'](HIDE);
    }

    ionic.requestAnimationFrame(function(){
      if (titleEle.offsetWidth < titleEle.scrollWidth) {
        titleRight = buttonsRight + 5;
        titleEle.style.right = titleRight ? titleRight + 'px' : '';
      }
      deferred.resolve();
    });

    return deferred.promise;
  };


  self.setCss = function(elementClassname, css) {
    var ele = getEle(elementClassname);
    if (ele) {
      for (var prop in css) {
        if (ele['$style_' + prop] !== css[prop]) {
          ele['$style_' + prop] = ele.style[prop] = css[prop];
        }
      }
    }
  };


  var eleCache = {};
  function getEle(className) {
    if (!eleCache[className]) {
      eleCache[className] = $element[0].querySelector('.' + className);
    }
    return eleCache[className];
  }


  $scope.$on('$destroy', function() {
    for(var n in eleCache) eleCache[n] = null;
  });

}]);

