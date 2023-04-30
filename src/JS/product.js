import { keycloak, authenticateLogin } from './keycloakauth.js';
import * as common from './common.js';

var user_avatar;
var user_name;
$(async function () {
  await keycloak
    .init({
      onLoad: 'check-sso',
      checkLoginIframe: false,
    })
    .then(async (authenticated) => {
      const loginBtn = document.getElementById('login_btn');
      if (keycloak.authenticated) {
        console.log('User is authenticated');
        // Display profile button
        document.getElementById('profile-page-btn').style.display = 'flex';
        // Display the design page button if user is manager
        if (keycloak.hasRealmRole('manager')) {
          document.getElementById('design-page-btn').style.display = 'flex';
        }
        // Display user info button
        document.getElementById('user-info-btn').style.display = 'flex';
        // Display the comment input section
        document.getElementById('cmt-input-section').style.display = 'flex';
        await loadUserInfoBar();

        // Set user avatar and name to comment input section
        document.getElementById('current-user-cmt-avatar').src = user_avatar;
        document.getElementById('current-user-cmt-username').textContent = user_name;

        if (keycloak.hasRealmRole('manager')) {
        } else {
          // Display library button
          document.getElementById('library-page-btn').style.display = 'flex';
          // Display go-to-cart icon
          document.getElementById('cart-btn').style.display = 'flex';
          common.loadCartNumber();
        }
      } else {
        // Display login button
        loginBtn.style.display = 'flex';
      }
    })
    .catch((err) => {
      console.log(err);
    });
  await initialized();
  setTimeout(function () {
    $('#spinner-container').fadeOut();
  }, 500);
});

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
let productId = params['product-id'];

async function initialized() {
  await Promise.all([getProductById(), loadAllComments()]);
  addClickListener();
}

async function loadUserInfoBar() {
  var user_info = await $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/jsons',
      Authorization: 'Bearer ' + keycloak.token,
    },
    url: '/get-user-info',
    method: 'GET',
  });

  user_avatar = user_info.userAvt;
  user_name = user_info.username;
  document.getElementById('user-name').textContent = user_info.username;
  document.getElementById('user-avatar').src = user_info.userAvt;
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
  } catch (error) {
    console.log(error);
  }
}
async function loadAllComments() {
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
      // console.log(comment.createdTime);
      var recommended_icon = '';
      if (comment.commentRecommend == true) {
        recommended_icon = 'thump_up.png';
      } else recommended_icon = 'thump_down.png';
      cmt_html +=
        "<div class='cmt_section'>" +
        "<div class='cmt_section_left'>" +
        "<img class='cmt_avatar' src='" +
        comment.user.userAvt +
        "' alt='' />" +
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
}

function addClickListener() {
  // Add to cart button
  const cart_btn = document.getElementById('btn_cart');
  cart_btn.addEventListener('click', async () => {
    const cart_block = document.getElementById('game-title-cart');
    cart_block.classList.add('product-in-cart');
    $('#game-title-cart').html('');
    $('#game-title-cart').append("This game is in your cart <i class='fas fa-shopping-cart' style='margin-left: 10px'></i>");

    document.getElementById('game_purchase_action').style.display = 'none';

    // const params = new Proxy(new URLSearchParams(window.location.search), {
    //   get: (searchParams, prop) => searchParams.get(prop),
    // });
    // let productId = params['product-id'];

    // var add_product = await $.ajax({
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json',
    //     Authorization: 'Bearer ' + keycloak.token,
    //   },
    //   url: '/users' + '/library/product/' + productId + '/save',
    //   method: 'POST',
    // });

    // Reload cart button
  });
  // Comment thumb up, down
  const thumbsUpIcon = document.getElementById('thumb-up');
  const thumbsDownIcon = document.getElementById('thumb-down');

  thumbsUpIcon.addEventListener('click', () => {
    thumbsUpIcon.classList.toggle('active');
    thumbsDownIcon.classList.remove('active');
    document.getElementById('thumb-up-img').src = './resources/img/materials/thumb_up_trans_active.png';
    document.getElementById('thumb-down-img').src = './resources/img/materials/thumb_up_trans.png';
  });

  thumbsDownIcon.addEventListener('click', () => {
    thumbsDownIcon.classList.toggle('active');
    thumbsUpIcon.classList.remove('active');
    document.getElementById('thumb-down-img').src = './resources/img/materials/thumb_up_trans_active.png';
    document.getElementById('thumb-up-img').src = './resources/img/materials/thumb_up_trans.png';
  });
  // Post review button
  const cmt_submit_btn = document.getElementById('cmt-submit-btn');
  cmt_submit_btn.addEventListener('click', async () => {
    let cmt_content = document.getElementById('cmt-input-area').value;

    if (cmt_content == '') {
      document.getElementById('cmt-empty-warning').style.display = 'flex';
    } else {
      let rcmd = true;
      if (thumbsDownIcon.classList.contains('active')) rcmd = false;

      const data = {
        commentContent: cmt_content,
        commentRecomment: rcmd,
      };

      var add_comment = await $.ajax({
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + keycloak.token,
        },
        url: '/comments' + '/product/' + productId,
        method: 'POST',
        dataType: 'json',
        data: JSON.stringify(data),
      });

      var recommended_icon = '';
      if (rcmd == true) {
        recommended_icon = 'thump_up.png';
      } else recommended_icon = 'thump_down.png';

      const date = new Date();
      const dateString = date.toLocaleString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit', year: 'numeric' });
      const timeString = date.toLocaleString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const formattedDateTime = `${dateString}, ${timeString}`;
      // console.log(formattedDateTime); // "Fri, 04/28/2023, 14:51"

      var cmt_html = '';
      cmt_html +=
        "<div class='cmt_section' style='background-color: #868d9f' >" +
        "<div class='cmt_section_left'>" +
        "<img class='cmt_avatar' src='" +
        user_avatar +
        "' alt='' />" +
        "<div id='cmt_username' class='cmt_username'>" +
        user_name +
        '</div>' +
        '</div>' +
        " <div class='cmt_section_right'>" +
        "<div class='cmt_info'>" +
        " <div class='cmt_favor_container'>" +
        "<img id='cmt_favor_item' src='/images/materials/" +
        recommended_icon +
        "' alt='' />";

      if (rcmd == true) {
        cmt_html += "<div class='cmt_favor'>RECOMMENED</div>";
      } else cmt_html += "<div class='cmt_favor'>NOT RECOMMENED</div>";

      cmt_html +=
        '</div>' +
        "<div class='cmt_from_date'>" +
        formattedDateTime +
        '</div>' +
        "<div class='cmt_content_container'>" +
        "<div class='cmt_content'>" +
        cmt_content +
        '</div>' +
        '</div> </div> </div> </div>';

      $('#comment-result').prepend(cmt_html);
      const new_comment = $('#comment-result .cmt_section').first();
      setTimeout(function () {
        new_comment.addClass('new-comment');
      }, 100);

      // Disable post review button for 2 seconds to avoid problems
      cmt_submit_btn.disabled = true;
      setTimeout(function () {
        cmt_submit_btn.disabled = false;
      }, 2000);
      // Remove no comment notify if existed
      const comment_result_check = document.getElementById('no-cmt-container');
      console.log(comment_result_check);
      if (comment_result_check) {
        comment_result_check.style.display = 'none';
      }
      // Clear comment input text area
      document.getElementById('cmt-input-area').value = '';
    }
  });
}
