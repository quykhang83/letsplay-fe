// import Keycloak from 'keycloak-js';
const keycloak = new Keycloak("http://localhost/keycloak.json");

async function authenticateLogin() {
  await keycloak
    .init({
      onLoad: "login-required",
      // redirectUri: window.location.origin + "/index.html",
      checkLoginIframe: false,
      promiseType: "native",
    })
    .then((authenticated) => {
      if (authenticated) {
        // getAllProducts(keycloak.token);
        getUserInfo();
        // token = keycloak.token;
        // console.log(keycloak.authenticated);
        // connectSSE();
      }
    })
    .catch((error) => {
      alert("Something went wrong due to \n" + error);
    });
}

export { keycloak, authenticateLogin };

keycloak.onTokenExpired = () => {
  var kc_updateToken = keycloak.updateToken(60);
  kc_updateToken.then(() => {});
  kc_updateToken.catch(() => {
    console.error("Failed to refresh token at " + new Date());
  });
};

function getUserInfo() {
  $.ajax({
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + keycloak.token,
    },
    url: "/get-user-info",
    method: "GET",
  });
}

$(() => {
  $("#login_btn").on("click", () => {
    authenticateLogin();
  });
  $("#logout_btn").on("click", () => {
    keycloak.logout({ redirectUri: window.location.origin + "/index.html" });
  });
  $("#change_pass_btn").on("click", () => {
    keycloak.login({ action: "UPDATE_PASSWORD" });
    // window.location.replace("http://localhost:8027/realms/ctu/account/password");
  });

  var $inputSearch = $("#searchBar");
  var $searchResultsCtn = document.getElementById("res_search_result");

  $inputSearch.on("input", function () {
    if ($inputSearch.val() == null || $inputSearch.val().trim().length === 0) {
      $searchResultsCtn.style.display = "none";
    }
  });
  $inputSearch.on("keypress", function (event) {
    if (event.key === "Enter") {
      getSearchResults($inputSearch.val().trim());
    }
  });
});
