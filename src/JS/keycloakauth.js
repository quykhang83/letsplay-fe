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
        console.log(keycloak.authenticated);
        // connectSSE();
      }
    })
    .catch((error) => {
      alert("Something went wrong due to \n" + error);
    });
}

export { keycloak, authenticateLogin };

keycloak.onTokenExpired = () => {
  var kc_updateToken = keycloak.updateToken(300);
  kc_updateToken.then(() => {});
  kc_updateToken.catch(() => {
    console.error("Failed to refresh token at " + new Date());
  });
};
// function logoutKeycloak(){
//   keycloak.logout({ redirectUri: window.location.origin + "/index.html" });
//   authenticateLogin();
// }

// function connectSSE() {
//   console.log("CALLING SSEVENT...");
//   const evtSource = new EventSource("/ssevent");
//   evtSource.onmessage = (e) => {
//     console.log(e.data);
//     if (e.data === "new request") {
//       getAllRequests(keycloak.token);
//     }
//   };
// }
$(() => {
  $("#logout_btn").on("click", () => {
    keycloak.logout({ redirectUri: window.location.origin + "/index.html" });
  });
  $("#change_pass_btn").on("click", () => {
    keycloak.login({ action: "UPDATE_PASSWORD" });
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
