/* Baybasi ContentStore — localStorage-backed image override system.
   Pages call ContentStore.img(key, defaultSrc) to get a URL.
   Admin page writes overrides; pages auto-reflect within the same browser. */

;(function () {
  var STORAGE_KEY = 'baybasi_content_v1';

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch (e) { return {}; }
  }

  function save(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch (e) { console.warn('ContentStore: localStorage write failed', e); }
  }

  window.ContentStore = {
    /* Return overridden URL for key, or fall back to defaultSrc */
    img: function (key, defaultSrc) {
      var data = load();
      return data[key] || defaultSrc;
    },

    /* Write a base64 data-URL or blob URL for a key */
    setImg: function (key, dataUrl) {
      var data = load();
      data[key] = dataUrl;
      save(data);
    },

    /* Remove override for a key (reverts to default) */
    resetImg: function (key) {
      var data = load();
      delete data[key];
      save(data);
    },

    /* Return all stored keys */
    keys: function () {
      return Object.keys(load());
    },

    /* Read file input → base64, call callback(key, dataUrl) */
    readFile: function (file, key, callback) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var dataUrl = e.target.result;
        window.ContentStore.setImg(key, dataUrl);
        if (callback) callback(key, dataUrl);
      };
      reader.readAsDataURL(file);
    },

    /* Export all overrides as JSON download */
    exportJSON: function () {
      var data = load();
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'baybasi-content-backup.json';
      a.click();
    },

    /* Import JSON file produced by exportJSON */
    importJSON: function (file, callback) {
      var reader = new FileReader();
      reader.onload = function (e) {
        try {
          var incoming = JSON.parse(e.target.result);
          var existing = load();
          Object.assign(existing, incoming);
          save(existing);
          if (callback) callback(Object.keys(incoming).length);
        } catch (err) {
          alert('Import failed: ' + err.message);
        }
      };
      reader.readAsText(file);
    },
  };
})();
