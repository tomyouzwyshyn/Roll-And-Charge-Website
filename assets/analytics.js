// Roll & Charge analytics scaffold. Inert until a GTM/GA4 snippet with a real ID
// is added to <head>. Events push to dataLayer; see docs/ANALYTICS.md.
window.dataLayer = window.dataLayer || [];
window.rcTrack = function (event, params) {
  window.dataLayer.push(Object.assign({ event: event }, params || {}));
};
(function () {
  // preserve UTM attribution across the session
  try {
    var qs = new URLSearchParams(location.search);
    if (qs.get('utm_source')) {
      sessionStorage.setItem('rc_utm', JSON.stringify({
        source: qs.get('utm_source'), medium: qs.get('utm_medium'),
        campaign: qs.get('utm_campaign'), landed: location.pathname
      }));
    }
    var utm = sessionStorage.getItem('rc_utm');
    if (utm) window.dataLayer.push(Object.assign({ event: 'rc_attribution' }, JSON.parse(utm)));
  } catch (e) { /* storage unavailable — fine */ }

  // call / text / booking-intent clicks
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) rcTrack('call_click', { page: location.pathname });
    else if (href.indexOf('sms:') === 0) rcTrack('text_click', { page: location.pathname });
    else if (href.indexOf('#booking') !== -1) rcTrack('booking_intent_click', { page: location.pathname, cta: (a.textContent || '').trim().slice(0, 40) });
  }, { passive: true });

  // form start (first interaction with the request form)
  var started = false;
  document.addEventListener('focusin', function (e) {
    if (started) return;
    if (e.target.closest && e.target.closest('#rc-request')) { started = true; rcTrack('form_start', { page: location.pathname }); }
  });
})();
