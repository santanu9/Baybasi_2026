/* Baybasi ContentStore — localStorage-backed image override system.
   Pages call ContentStore.img(key, defaultSrc) to get a URL.
   Admin page writes overrides; pages auto-reflect within the same browser. */

;(function () {
  var STORAGE_KEY = 'baybasi_content_v1';

  // ── Security limits / validation ──────────────────────────────────────────
  var MAX_UPLOAD_BYTES = 5 * 1024 * 1024;   // 5 MB per image
  var ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];
  var KEY_RE = /^[A-Za-z0-9_-]{1,64}$/;      // override keys are short identifiers
  // A stored value is only ever used as an <img src>. Accept relative site paths
  // and base64 image data-URLs; reject anything with a script-capable scheme or
  // characters that could break out of an attribute / CSS url() later on.
  var DATA_URL_RE = /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,[A-Za-z0-9+/=\s]+$/;
  var PATH_RE = /^[A-Za-z0-9_\-./]+\.(png|jpe?g|gif|webp|svg|avif)$/i;

  function isSafeImageValue(v) {
    if (typeof v !== 'string') return false;
    if (v.length > 8 * 1024 * 1024) return false;          // ~6 MB image as base64
    if (/[<>"'`\\]/.test(v) && !DATA_URL_RE.test(v)) return false;
    if (/^\s*(javascript|vbscript|data:text|data:application)/i.test(v)) return false;
    if (DATA_URL_RE.test(v)) return true;
    if (/:|\/\//.test(v)) return false;                    // no schemes / protocol-relative
    return PATH_RE.test(v);
  }

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

    /* Read file input → base64, call callback(key, dataUrl).
       Validates MIME type and size before accepting. onError(msg) on rejection. */
    readFile: function (file, key, callback, onError) {
      var fail = function (msg) { if (onError) onError(msg); else alert(msg); };
      if (!KEY_RE.test(String(key))) { return fail('Invalid image slot.'); }
      if (!file || ALLOWED_IMAGE_TYPES.indexOf(file.type) < 0) {
        return fail('Unsupported file. Please upload a PNG, JPG, GIF, WebP, or SVG image.');
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        return fail('Image is too large (max ' + (MAX_UPLOAD_BYTES / 1024 / 1024) + ' MB).');
      }
      var reader = new FileReader();
      reader.onerror = function () { fail('Could not read the file.'); };
      reader.onload = function (e) {
        var dataUrl = e.target.result;
        if (!isSafeImageValue(dataUrl)) { return fail('File did not produce a valid image.'); }
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

    /* Import JSON file produced by exportJSON.
       Untrusted input: every entry is validated; unsafe/malformed entries are
       dropped so a tampered backup can never poison the content store. */
    importJSON: function (file, callback, onError) {
      var fail = function (msg) { if (onError) onError(msg); else alert(msg); };
      if (file && file.size > MAX_UPLOAD_BYTES * 10) { return fail('Backup file is too large.'); }
      var reader = new FileReader();
      reader.onerror = function () { fail('Could not read the file.'); };
      reader.onload = function (e) {
        var incoming;
        try { incoming = JSON.parse(e.target.result); }
        catch (err) { return fail('Import failed: not a valid JSON file.'); }
        if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
          return fail('Import failed: unexpected backup format.');
        }
        var existing = load();
        var accepted = 0, rejected = 0;
        Object.keys(incoming).forEach(function (k) {
          if (KEY_RE.test(k) && isSafeImageValue(incoming[k])) {
            existing[k] = incoming[k];
            accepted++;
          } else {
            rejected++;
          }
        });
        save(existing);
        if (callback) callback(accepted, rejected);
      };
      reader.readAsText(file);
    },
  };
})();
