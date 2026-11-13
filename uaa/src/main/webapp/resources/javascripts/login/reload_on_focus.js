// Reloads a stale login page when the user returns to it, so the form and the
// X-Uaa-Csrf cookie are re-issued before credentials are submitted.
// The page is never reloaded while the user has typed something into it.
(function () {
    'use strict';

    // Deliberately unrelated to the 24h cookie max age: the cookie can disappear earlier
    // (logout in another tab, manual cleanup). This only avoids reload churn on quick tab flips.
    var MIN_AGE_MS = 5 * 60 * 1000;
    var loadedAt = Date.now();
    var reloading = false;

    function formIsUntouched() {
        var inputs = document.querySelectorAll('form input.form-control');
        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].value !== '') {
                return false;
            }
        }
        return true;
    }

    function reloadIfStale(restoredFromCache) {
        var stale = restoredFromCache || (Date.now() - loadedAt) > MIN_AGE_MS;
        var offline = typeof navigator.onLine === 'boolean' && !navigator.onLine;
        if (stale && !reloading && !offline && formIsUntouched()) {
            reloading = true;
            window.location.reload();
        }
    }

    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
            reloadIfStale(false);
        }
    });

    window.addEventListener('focus', function () {
        reloadIfStale(false);
    });

    window.addEventListener('pageshow', function (event) {
        // persisted === true: restored from the back/forward cache with old state
        if (event.persisted) {
            reloadIfStale(true);
        }
    });
})();
