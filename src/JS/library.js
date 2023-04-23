import { keycloak, authenticateLogin } from './keycloakauth.js';
$(async function () {
  await authenticateLogin();
  if (keycloak.authenticated) {
    console.log('User is authenticated');
    // Display the design page button if user is manager
    if (keycloak.hasRealmRole('manager')) {
      document.getElementById('design-page-btn').style.display = 'flex';
    }
  } else {
    console.log('User is not authenticated! Calling authenticate function');
    console.log('Authentication status: ', keycloak.authenticated);
  }
  await initialized();
});
async function initialized() {
  await loadGameList();
  await addClickListener();
}

async function addClickListener() {
  // console.log("add click listener");
  const tabs = document.querySelectorAll('.game-container');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach((tab) => {
    console.log(tab);
    console.log('add click listener for this button');
    tab.addEventListener('click', () => {
      console.log('clicked');
      // remove active class from all tabs and panels
      tabs.forEach((tab) => tab.classList.remove('active'));
      panels.forEach((panel) => panel.classList.remove('active'));

      // add active class to the clicked tab and panel
      const target = tab.dataset.tab;
      const panel = document.querySelector(`.tab-panel[data-tab="${target}"]`);
      tab.classList.add('active');
      panel.classList.add('active');
    });
  });
}

async function loadGameList() {
  console.log('Loading game list');
  var product = $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + keycloak.token,
    },
    url: '/users' + '/library',
    method: 'GET',
  });

  await product
    .then((data) => {
      if (data.length > 0) {
        const gameContainer = document.getElementById('lib-game-container');
        gameContainer.style.height = 'fit-content';
        $('#game-list-result').html('');
        $('#lib-game-info-result').html('');
        // console.log(data);
        var out = '';
        var out2 = '';
        for (let i = 0; i < data.length; i++) {
          const header_image = data[i].productDemos.find(function (demo) {
            return demo.productDemoTitle === 'header';
          });

          var header_image_url;
          if (header_image) {
            header_image_url = header_image.productDemoUrl;
          } else {
            header_image_url = '';
          }

          out +=
            "<div class='game-container' data-tab='" +
            (i + 1) +
            "'>" +
            "<div class='game-inlist-img'>" +
            "<img src='" +
            header_image_url +
            "'>" +
            '</div>' +
            "<div class='game-inlist-title'>" +
            '<h3>' +
            data[i].productName +
            '</h3>' +
            '</div> </div>';

          if (i==0){
            out2 += "<div class='tab-panel active' data-tab='" + (i + 1) + "'>";
          } else {
            out2 += "<div class='tab-panel' data-tab='" + (i + 1) + "'>";
          }
          out2 +=
            "<div id='game-info-1'>" +
            "<div id='game-info-1-container'>" +
            "<div id='game-info-1-left'>" +
            "<div class='play-game-block'>" +
            "<h1 id='game-title-cart'>Play " +
            data[i].productName +
            '</h1>' +
            "<div class='game_purchase_action'>" +
            "<a href='#' class='btn_cart'>Play</a>" +
            '</div>' +
            '</div> </div>' +
            "<div id='game-info-1-right'>" +
            "<div id='game-header-image'>" +
            "<img src='" +
            header_image_url +
            "' alt='' />" +
            '</div> </div> </div> </div>' +
            "<div id='game-info-2'>" +
            "<div id='game-info-2-container'>" +
            "<div class='game-info-container'>" +
            '<h3>Capacity: ' +
            data[i].productCapacity +
            '</h3>' +
            '</div>' +
            "<div class='game-info-container'>" +
            '<h3>Played Time: 0 hours</h3>' +
            '</div>' +
            "<div class='game-info-container'>" +
            '<h3>Downloaded: ' +
            data[i].productDownloads +
            '</h3>' +
            '</div> </div> </div>' +
            "<div id='game-info-3'></div>" +
            '</div>';
        }
        $('#game-list-result').append(out);
        $('#lib-game-info-result').append(out2);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
