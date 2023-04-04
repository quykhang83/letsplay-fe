// Item dynamic price
$(function () {
    loadAllProducts();
  
    const originalPrices = document.querySelectorAll(".item_original_price");
    const discountPrices = document.querySelectorAll(".item_discount_price");
    console.log(originalPrices);
  
    for (let i = 0; i < originalPrices.length; i++) {
      if (discountPrices[i].innerText !== "0đ") {
        // console.log('Discount price is not zero:', discountPrices[i].innerText);
        originalPrices[i].classList.add("discount");
        discountPrices[i].classList.add("has_discount_price");
      } else {
        // console.log('Discount price is zero:', discountPrices[i].innerText);
      }
    }
  });

// AJAX

function loadAllProducts() {
$("#product-result").html("");

// Make a ajax request call
var request = $.ajax({
    headers: {
    Accept: "application/json",
    "Content-Type": "application/jsons",
    },
    url: "/product-types",
    method: "GET",
});

request.done((data) => {
    data.forEach((element) => {
    var out = "";
    out += "<div class='item_set_container'>";
    out += "<h3 class='set_label'>" + element.productTypeName + "</h3>" + "<div class='set_item'>";

    out += "<div class='new_item_ctn'>";
    out += "<div class='new-item'>"
    out += "<img src='/images/materials/plus.png' alt='' />";
    out += "</div> </div>";

    // Call to get products by type api
    var encodedProductTypeName = encodeURIComponent(element.productTypeName);

    $.ajax({
        headers: {
        Accept: "application/json",
        "Content-Type": "application/jsons",
        },
        url: "/products?type=" + encodedProductTypeName,
        method: "GET",
        async: false, // set async to false
        success: function (product_data) {
        product_data.forEach((product_element) => {
            var product_out = "";

            //Format product price to have dot according to VND
            const formattedproductPrice = product_element.productPrice.toLocaleString("vi-VN");

            product_out +=
            "<div class='item_ctn'><a href='product.html' style='text-decoration: none'>" +
            "<div class='item'>" +
            "<img src='/images/god_of_war_rng.jpg' alt='' />" +
            "</div>" +
            "<div class='item_name'>" +
            "<h3>" +
            product_element.productName +
            "</h3>" +
            "</div>" +
            "<div class='item_price'>" +
            "<h3>" +
            formattedproductPrice +
            "đ</h3>" +
            "</div>" +
            "</a></div>";

            out += product_out;
        });
        },
        error: function (jqXHR, textStatus, errorThrown) {
        console.log("Error: " + textStatus + " - " + errorThrown);
        },
    });

    // Close set-item
    out += "</div>";
    // Close item-set-container
    out += "</div>";

    $("#product-result").append(out);
    });
});
}
  
function getAllProducts() {
var request = $.ajax({
    headers: {
    Accept: "application/json",
    "Content-Type": "application/jsons",
    },
    url: "/products",
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
  