// Item dynamic price
$(function () {
  loadAllProducts(afterLoadAllProducts);
});

function loadAllProducts(callback) {
  $('#product-result').html('');

  // Make a ajax request call
  var request = $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/jsons',
    },
    url: '/product-types',
    method: 'GET',
  });

  request.done((data) => {
    // Sort the data by productTypeName
    data.sort((a, b) => a.productTypeName.localeCompare(b.productTypeName));

    const promises = [];

    // Loop through the sorted data and add each $.ajax call to promises array
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      const encodedProductTypeName = encodeURIComponent(element.productTypeName);

      if (element.productTypeName != '#') {
        const promise = new Promise((resolve, reject) => {
          var out = '';
          out += "<div class='item_set_container'>";
          out += "<h3 class='set_label'>" + element.productTypeName + '</h3>' + "<div class='set_item'>";

          // Call to get products by type api
          $.ajax({
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/jsons',
            },
            url: '/products?type=' + encodedProductTypeName,
            method: 'GET',
            success: function (product_data) {
              product_data.forEach((product_element) => {
                var product_out = '';

                //Format product price to have dot according to VND
                const formattedproductPrice = product_element.productPrice.toLocaleString('vi-VN');

                product_out +=
                "<div class='item_ctn'><a href='product.html?product-id=" 
                + product_element.productId + "' " 
                + "style='text-decoration: none'>" +
                  "<div class='item'>" +
                  "<img src='/images/god_of_war_rng.jpg' alt='' />" +
                  '</div>' +
                  "<div class='item_name'>" +
                  '<h3>' +
                  product_element.productName +
                  '</h3>' +
                  '</div>' +
                  "<div class='item_price'>" +
                  "<h3 class='item_original_price'>" +
                  formattedproductPrice +
                  'đ</h3>' +
                  "<h3 class='item_discount_price'>150.000đ</h3>" +
                  '</div>' +
                  '</a></div>';

                out += product_out;
              });

              // Close set-item
              out += '</div>';

              // Close item-set-container
              out += '</div>';

              resolve(out);
            },
            error: function (jqXHR, textStatus, errorThrown) {
              console.log('Error: ' + textStatus + ' - ' + errorThrown);
              reject(errorThrown);
            },
          });
        });
        promises.push(promise);
      }
    }

    // Use Promise.all() to ensure that the promises are executed in the correct order
    Promise.all(promises)
      .then((results) => {
        results.forEach((result) => {
          $('#product-result').append(result);
        });
        callback();
      })
      .catch((error) => {
        console.log('Error: ' + error);
      });
  });
}

function getAllProducts() {
  var request = $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    url: '/products',
    method: 'GET',
  });
  request.done((data) => {
    // console.log('Get products');
    data.forEach((element) => {
      console.log(element);
    });
  });
  request.fail((err) => {
    console.log(err);
  });
}

function afterLoadAllProducts() {
  const originalPrices = document.querySelectorAll('.item_original_price');
  const discountPrices = document.querySelectorAll('.item_discount_price');

  for (let i = 0; i < originalPrices.length; i++) {
    if (discountPrices[i].innerText !== '0đ') {
      originalPrices[i].classList.add('discount');
      discountPrices[i].classList.add('has_discount_price');
    }
  }
}
