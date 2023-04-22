$(function () {
  getProductById();
});

var date_options = [{ month: "2-digit", day: "2-digit", year: "numeric" }];
var hour_options = [
  { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" },
];
function convertTime(timeString) {
  var time = new Date(timeString);
  function format(m) {
    let f = new Intl.DateTimeFormat("en", m);
    return f.format(time);
  }
  var result = new Intl.DateTimeFormat("en", { weekday: "short" }).format(time);
  result += ", " + date_options.map(format).join("/");
  result += ", " + hour_options.map(format).join(":");
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

    console.log(product);
    $('#game-title').html('');
    $('#game-title').append(product.productName);
    document.title = product.productName + " on Let's Play";

    $('#game_description').html('');
    $('#game_description').append(product.productDescription);

    $('#game-trailer-video').html('');
    // $("#game-trailer-video").append();

    const formattedproductPrice = product.productPrice.toLocaleString('vi-VN');
    $('#game-purchase-price').html('');
    $('#game-purchase-price').append(formattedproductPrice + 'đ');

    $('#game-title-cart').html('');
    $('#game-title-cart').append('Buy ' + product.productName);

    var comments = await $.ajax({
      headers: {
        // Accept: "text/event-stream",
        Accept: 'application/json',
        'Content-Type': 'application/jsons',
      },
      url: '/comments/' + 'product/' + productId,
      method: 'GET',
    });

    console.log(comments);
    if (comments.length > 0){
      $('#comment-result').html('');
    }
    var cmt_html = "";
    for (var i = 0; i < comments.length; i++) {
      var comment = comments[i];
      cmt_html += "<div class='cmt_section'>"
      + "<div class='cmt_section_left'>"
      + "<img class='cmt_avatar' src='/images/User/avatar.jpg' alt='' />"
      + "<div id='cmt_username' class='cmt_username'>"+  comment.user.username  +"</div>"
      + "</div>"
      + " <div class='cmt_section_right'>"
      + "<div class='cmt_info'>"
      + " <div class='cmt_favor_container'>"
      + "<img id='cmt_favor_item' src='/images/materials/thump_up.png' alt='' />"
      + "<div class='cmt_favor'>RECOMMENED</div>"
      + "</div>"
      + "<div class='cmt_from_date'>"+ convertTime(comment.createdTime) +"</div>"
      + "<div class='cmt_content_container'>"
      + "<div class='cmt_content'>"+ comment.commentContent +"</div>"
      + "</div> </div> </div> </div>"

    }
    $('#comment-result').append(cmt_html);
  } catch (error) {
    console.log(error);
  }
}
