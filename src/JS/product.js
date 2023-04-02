$(function () {

  getProductById();

});

function getProductById() {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  let value = params.product_id;
  console.log("Product id: "+value);

  var request = $.ajax({
    headers: {
      // Accept: "text/event-stream",
      Accept: "application/json",
      "Content-Type": "application/jsons",
    },
    url: "/products/"+value,
    method: "GET",
  });
  request.done((data) => {
    console.log(data)
    $("#game_description").html("");
    $("#game_description").append(data.productDescription);


    // $("#req_result").append(out);
    // var lastUpdate = convertTime(new Date());
    // $("#ft_lastUpd").html("");
    // $("#ft_lastUpd").html(lastUpdate);
    // $("#ft_totalReq").html("");
    // $("#ft_totalReq").html(data.length);
  });
  request.fail((err) => {
    console.log(err);
  });
}