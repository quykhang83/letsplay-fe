// Item dynamic price

const originalPrices = document.querySelectorAll('.item_original_price');
const discountPrices = document.querySelectorAll('.item_discount_price');
console.log(originalPrices);

for (let i = 0; i < originalPrices.length; i++) {
    if (discountPrices[i].innerText !== '0đ') {
        console.log('Discount price is not zero:', discountPrices[i].innerText);
        originalPrices[i].classList.add('discount');
        discountPrices[i].classList.add('has_discount_price');
    } else {
        console.log('Discount price is zero:', discountPrices[i].innerText);
    }
}

// AJAX

function getAllProducts(token) {
    var request = $.ajax({
      headers: {
        Accept: "application/json",
        "Content-Type": "application/jsons",
        Authorization: "Bearer " + token,
      },
      url: "url: 'http://localhost:8080/letsplay/api/products/all'",
      method: "GET",
    });
    request.done((data) => {
        console.log("Get products");
        data.forEach((element) => {
            console.log(element);
        });
    });
    request.fail((err) => {
      console.log(err);
    });
  }