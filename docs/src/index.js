(() => {

  'use strict';

  const panel = document.getElementById('panel');

  const md = markdownit({ html: true })
    .use(markdownItAttrs);

  vz.Vizsla.prototype.plot = function() {
    return this.prep();
  };

  window.deleteVariables = (...names) => names.forEach(nm => delete window[nm]);

  async function loadPanel(span) {

    const filename = location.search.slice(1) || 'about';
 
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
          if (elm.classList.contains('vl-plot')) {
            const subWrapper = [wrapper].insert('div')[0];  //extra wrapper needed to get x-scrollbar if required
            vegaEmbed(subWrapper, result, {
              actions: false,
              padding: {top: 1, right: 0, bottom: 0, left: 0}
            }).catch(err => {
              wrapper.classList.add('scalar', `scalar-error`);
              wrapper.textContent = err;
            });
          }
          else if (elm.classList.contains('custom-html')) {
            [wrapper].insert(Array.isArray(result) ? result[0] : result);
          }
          else {
            if (Array.isArray(result)) {
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
        }
    });

    //scroll to section
    if (location.hash) qa(location.hash)[0].scrollIntoView();

  };

  //navigation
  {

    //backward and forward buttons
    window.onpopstate = () => loadPanel();

    //side bar links
    qa('#sidebar span').on('click', evt => {
      history.pushState(null, '', `index.html?${evt.target.getAttribute('data-file')}`);
      loadPanel(evt.me);
    });

    //data-cube link in navbar
    qa('#data-cube-link').on('click', evt => qa('#sidebar span')[0].click());

    //on window load
    window.onload = () => loadPanel();

  }


})();