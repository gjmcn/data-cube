(() => {

  'use strict';

  //load data-cube and plugins
  window.dc = require('@gjmcn/data-cube');
  window.qa = require('@gjmcn/data-cube-html');
  require('@gjmcn/data-cube-print-html');

  //load markdown-it - individual local files until fix bundling issue
  const md = require('./markdown-it-8.4.2.min.js')({ html: true })
          .use(require('./markdown-it-attrs-2.3.2.min.js'));

  const panel = document.getElementById('panel');

  //current content file and anchor
  let filename, anchor;

  window.deleteVariables = (...names) => names.forEach(nm => delete window[nm]);

  //local storage for scroll position
  let saveScrollPosn, loadScrollPosn;
  {
    //from: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
    function storageAvailable(type) {
      var storage;
      try {
          storage = window[type];
          var x = '__storage_test__';
          storage.setItem(x, x);
          storage.removeItem(x);
          return true;
      }
      catch(e) {
        return e instanceof DOMException && (
          e.code === 22 || e.code === 1014 || e.name === 'QuotaExceededError' ||
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED') && (storage && storage.length !== 0);
      }
    }
    if (storageAvailable('localStorage')) {
      saveScrollPosn = () => localStorage[`page_${filename}`] = panel.scrollTop;
      loadScrollPosn = () => localStorage[`page_${filename}`];
    }
    else {
      saveScrollPosn = () => {};
      loadScrollPosn = () => {};
    }
  }

  //load content into main panel
  async function loadPanel(span, returning) {

    //save scroll position before change contents
    if (filename && !anchor) saveScrollPosn();

    const oldFilename = filename;
    filename = location.search.slice(1) || 'about';
    anchor = location.hash;
 
    if (filename !== oldFilename) {

      //clear panel and highlight sidebar link
      panel.innerHTML = '';
      qa('#sidebar span').removeClass('selected');
      (span || qa(`#sidebar span[data-file="${filename}"]`)).addClass('selected');

      //load content and highlight code
      const content = await fetch(`contents/${filename}.md`)
        .then(response => response.text())
        .then(text => md.render(text + '\n\n<br><br><br>'));
      panel.innerHTML = content;
      const preCodes = qa('pre > code');
      for (let elm of preCodes) {
        if (elm.classList.contains('no-input')) {
          elm.parentNode.classList.add('d-none');
          continue;
        }
        else if (!elm.classList.contains('html')) {
          elm.classList.add('javascript');
        }
        hljs.highlightBlock(elm);
      }

      //internal links: call load panel directly
      [panel].qa('a.internal').on('click', evt => {
        history.pushState(null, '', evt.target.href);
        loadPanel();
        evt.preventDefault();
        return false;
      });

      //run examples
      preCodes.filter(elm => !elm.classList.contains('no-exec'))
        .forEach(elm => {
          const wrapper = document.createElement('div');
          wrapper.classList.add('output');
          let result;
          try {
            result = (1, eval)(elm.textContent);
          }
          catch (err) {
            wrapper.classList.add('scalar', `scalar-error`);
            wrapper.textContent = err;
            elm.parentNode.parentNode.insertBefore(wrapper, elm.parentNode.nextSibling);
            return;
          }
          if (!elm.classList.contains('no-output')) {
            elm.parentNode.parentNode.insertBefore(wrapper, elm.parentNode.nextSibling);
            if (elm.classList.contains('custom-html')) {
              [wrapper].insert(Array.isArray(result) ? result[0] : result);
            }
            else if (Array.isArray(result)) {
                result.print({to: wrapper});
            }
            else {
              let cls = 'other';
              if (['number', 'boolean', 'string'].includes(typeof result)) cls = typeof result;
              else if (result === null || result === undefined) cls = result;
              else if (result instanceof Date) cls = 'date';
              wrapper.classList.add('scalar', `scalar-${cls}`);
              wrapper.textContent = '' + result;
            }
          }
      });
    
    }

    //scroll
    if (anchor) {  //to section
      qa(anchor)[0].scrollIntoView();
    }
    else if (returning) {  //to previous scroll posn if arrive via back/forward button
      panel.scrollTop = loadScrollPosn(); 
    }
  };

  //navigation
  {
    //backward and forward buttons
    window.onpopstate = () => loadPanel(null, true);

    //side bar links
    qa('#sidebar span').on('click', evt => {
      history.pushState(null, '', `?${evt.target.getAttribute('data-file')}`);
      loadPanel(evt.me);
    });

    //data-cube link in navbar
    qa('#data-cube-link').on('click', () => qa('#sidebar span')[0].click());

    //pageshow
    window.addEventListener('pageshow', evt => loadPanel(null, evt.persisted));

    //pagehide
    window.addEventListener('pagehide', () => saveScrollPosn());
  }

})();