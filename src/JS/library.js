import { keycloak, authenticateLogin } from './keycloakauth.js';
import * as common from './common.js';

$(async function () {
  await authenticateLogin();
  if (keycloak.authenticated) {
    console.log('User is authenticated');
    // Display the design page button if user is manager
    if (keycloak.hasRealmRole('manager')) {
    }
    else {
      document.getElementById('cart-btn').style.display = 'flex';
      common.loadCartNumber();
    }
    common.loadUserInfoBar();
  } else {
    console.log('User is not authenticated! Calling authenticate function');
    console.log('Authentication status: ', keycloak.authenticated);
  }
  await initialized();
  setTimeout(function() {
    $("#spinner-container").fadeOut();
  }, 500);
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
          } else header_image_url = '';

          let article_images = data[i].productDemos
            .filter(function (demo) {
              return demo.productDemoTitle === 'image';
            })
            .map(function (demo) {
              return demo.productDemoUrl;
            });

          let article_publishers = ["GameSpot:", "Metacritic:"];
          let article_titles = ["An exceptionally good indie game.", "A fascinating adventure."];

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

          if (i == 0) {
            out2 += "<div class='tab-panel active' data-tab='" + (i + 1) + "'>";
          } else {
            out2 += "<div class='tab-panel' data-tab='" + (i + 1) + "'>";
          }
          out2 +=
            "<div id='game-info-1'>" +
            "<div id='game-info-1-container'>" +
            "<div id='game-info-1-left'>" +
            "<div id='game-description'>" +
            '<h3>' +
            data[i].productDescription +
            '</h3>' +
            '</div>' +
            "<div id='play-block'>" +
            "<button class='play-button'><i class='fas fa-play'></i> PLAY</button>" +
            '</div> </div>' +
            "<div id='game-info-1-right'> <div id='game-header-image'>" +
            "<img src='" +
            header_image_url +
            "' alt='' />" +
            ' </div> </div> </div> </div>' +
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
            "<div id='game-info-3'>" +
            "<div id='acvm-container'>" +
            '<h3>Completion</h3>' +
            "<div id='acvm-bar-container'>" +
            "<div class='progress'>" +
            "<div class='progress-bar progress-bar-striped progress-bar-animated' role='progressbar' aria-valuenow='75' aria-valuemin='0' aria-valuemax='100' style='width: 75%' ></div>" +
            '</div>' +
            "<div id='acvm-percent'>75%</div>" +
            '</div> </div>' +
            "<div id='article-container'>" +
            '<h3>Related Articles</h3>' +
            "<div id='article-list'>";

          for (let i = 0; i < article_images.length; i++) {
            out2 +=
              "<div class='article'>" +
              "<div class='article-info'>" +
              "<div class='article-publisher'>"+ article_publishers[i] +"</div>" +
              "<div class='article-title'>"+ article_titles[i] +"</div>" +
              '</div>' +
              "<img src='" +
              article_images[i] +
              "' class='article-image' />" +
              '</div>';
          }
          out2 += '</div> </div> </div> </div>';
        }
        $('#game-list-result').append(out);
        $('#lib-game-info-result').append(out2);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
