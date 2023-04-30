import { keycloak, authenticateLogin } from './keycloakauth.js';

$(async function () {
  await authenticateLogin();
  if (keycloak.authenticated) {
    console.log('User is authenticated');
    // Display the design page button if user is manager
    if (keycloak.hasRealmRole('manager')) {
      document.getElementById('design-page-btn').style.display = 'flex';
    } else {
      // Display library button
      document.getElementById('library-page-btn').style.display = 'flex';
    }
  } else {
    console.log('User is not authenticated! Calling authenticate function');
    console.log('Authentication status: ', keycloak.authenticated);
  }
  await initialize();
  setTimeout(function () {
    $('#spinner-container').fadeOut();
  }, 500);
});

async function initialize(){
  addClickListeners();
}
function addClickListeners(){
  const tabs = document.querySelectorAll('.btn-outline-secondary');
  const panels = document.querySelectorAll('.tab-panel');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // remove active class from all tabs and panels
      tabs.forEach(tab => tab.classList.remove('active'));
      panels.forEach(panel => panel.classList.remove('active'));
      
      // add active class to the clicked tab and panel
      const target = tab.dataset.tab;
      const panel = document.querySelector(`.tab-panel[data-tab="${target}"]`);
      tab.classList.add('active');
      panel.classList.add('active');
    });
  });
}

