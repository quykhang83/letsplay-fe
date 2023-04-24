import { keycloak, authenticateLogin } from './keycloakauth.js';
$(async function () {
  await keycloak
    .init({
      onLoad: 'check-sso',
      checkLoginIframe: false,
    })
    .then((authenticated) => {
      if (keycloak.authenticated) {
        console.log('User is authenticated');
        // Display profile button
        document.getElementById('profile-page-btn').style.display = 'flex';
        // Display library button
        document.getElementById('library-page-btn').style.display = 'flex';
        // Display the design page button if user is manager
        if (keycloak.hasRealmRole('manager')) {
          document.getElementById('design-page-btn').style.display = 'flex';
        }
      } else {
        console.log('Authentication status: ', keycloak.authenticated);
      }
    })
    .catch((err) => {
      console.log(err);
    });
  await initialized();
});

async function initialized() {
  await getProductById();
  addClickListener();
}

var date_options = [{ month: '2-digit', day: '2-digit', year: 'numeric' }];
var hour_options = [{ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }];
function convertTime(timeString) {
  var time = new Date(timeString);
  function format(m) {
    let f = new Intl.DateTimeFormat('en', m);
    return f.format(time);
  }
  var result = new Intl.DateTimeFormat('en', { weekday: 'short' }).format(time);
  result += ', ' + date_options.map(format).join('/');
  result += ', ' + hour_options.map(format).join(':');
  return result;
}

async function getProductById() {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  let productId = params['product-id'];
  console.log('Product id: ' + productId);
  try {
    var product = await $.ajax({
      headers: {
        // Accept: "text/event-stream",
        Accept: 'application/json',
        'Content-Type': 'application/jsons',
      },
      url: '/products/' + productId,
      method: 'GET',
    });

    // console.log(product);
    $('#game-title').html('');
    $('#game-title').append(product.productName);
    document.title = product.productName + " on Let's Play";

    $('#game_description').html('');
    $('#game_description').append(product.productDescription);

    const formattedproductPrice = product.productPrice.toLocaleString('vi-VN');
    $('#game-purchase-price').html('');
    $('#game-purchase-price').append(formattedproductPrice + 'đ');

    $('#game-title-cart').html('');
    $('#game-title-cart').append('Buy ' + product.productName);

    // Getting game header image
    const header_image = product.productDemos.find(function (demo) {
      return demo.productDemoTitle === 'header';
    });

    var header_image_url;
    if (header_image) {
      header_image_url = header_image.productDemoUrl;
    } else {
      header_image_url = '';
    }
    const gameImage = document.getElementById('game-image');
    gameImage.src = header_image_url;

    // Getting game trailer video
    const trailer_video = product.productDemos.find(function (demo) {
      return demo.productDemoTitle === 'video';
    });
    var trailer_video_url;
    if (trailer_video) {
      trailer_video_url = trailer_video.productDemoUrl;
    } else {
      trailer_video_url = '';
    }

    $('#game-trailer-video').html('');
    $('#game-trailer-video').append(trailer_video_url);

    var comments = await $.ajax({
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/jsons',
      },
      url: '/comments/' + 'product/' + productId,
      method: 'GET',
    });

    comments.sort(function (a, b) {
      var dateA = new Date(a.createdTime);
      var dateB = new Date(b.createdTime);
      return dateB - dateA;
    });

    // console.log(comments);
    // console.log(comments.length);
    if (comments.length > 0) {
      $('#comment-result').html('');
      var cmt_html = '';
      for (var i = 0; i < comments.length; i++) {
        var comment = comments[i];
        console.log(comment.createdTime);
        var recommended_icon = '';
        if (comment.commentRecommend == true) {
          recommended_icon = 'thump_up.png';
        } else recommended_icon = 'thump_down.png';
        cmt_html +=
          "<div class='cmt_section'>" +
          "<div class='cmt_section_left'>" +
          "<img class='cmt_avatar' src='/images/User/avatar.jpg' alt='' />" +
          "<div id='cmt_username' class='cmt_username'>" +
          comment.user.username +
          '</div>' +
          '</div>' +
          " <div class='cmt_section_right'>" +
          "<div class='cmt_info'>" +
          " <div class='cmt_favor_container'>" +
          "<img id='cmt_favor_item' src='/images/materials/" +
          recommended_icon +
          "' alt='' />";

        if (comment.commentRecommend == true) {
          cmt_html += "<div class='cmt_favor'>RECOMMENED</div>";
        } else cmt_html += "<div class='cmt_favor'>NOT RECOMMENED</div>";

        cmt_html +=
          '</div>' +
          "<div class='cmt_from_date'>" +
          convertTime(comment.createdTime) +
          '</div>' +
          "<div class='cmt_content_container'>" +
          "<div class='cmt_content'>" +
          comment.commentContent +
          '</div>' +
          '</div> </div> </div> </div>';
      }
      $('#comment-result').append(cmt_html);
    }
  } catch (error) {
    console.log(error);
  }
}

function addClickListener() {
  const cart_btn = document.getElementById('btn_cart');
  cart_btn.addEventListener('click', async () => {
    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });
    let productId = params['product-id'];

    var add_product = await $.ajax({
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/jsons',
        Authorization: 'Bearer ' + keycloak.token,
      },
      url: '/users' + '/library/product/' + productId + '/save',
      method: 'POST',
    });

    // Reload cart button
  });
}
