(() => {
  'use strict';
  // Preserve links shared while the website used sections on one long page.
  const legacyPages = {
    themes: 'themes.html', cfp: 'cfp.html', dates: 'timeline.html',
    program: 'program.html', speakers: 'speakers.html', organizers: 'organizers.html',
    committee: 'committee.html', sponsors: 'sponsors.html',
    'submission-types': 'cfp.html', 'author-guidance-title': 'cfp.html', 'submission-review': 'cfp.html'
  };
  function followLegacyLink() {
    if (document.body.dataset.page !== 'index') return;
    const anchor = location.hash.slice(1);
    if (Object.hasOwn(legacyPages, anchor)) location.replace(legacyPages[anchor] + '#' + anchor);
  }
  followLegacyLink();
  window.addEventListener('hashchange', followLegacyLink);
  document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => { document.querySelector('.mobile-menu').open = false; });
  });
})();
