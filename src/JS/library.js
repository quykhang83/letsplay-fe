
// keycloak
//   .init({
//     onLoad: 'login-required',
//     checkLoginIframe: false,
//     promiseType: 'native',
//   })
//   .then(() => {
//     // localStorage.setItem('isLoggedIn', true);
//   })
//   .catch((error) => {
//     alert('Something went wrong due to \n' + error);
//   });
import { keycloak, authenticateLogin } from './keycloakauth.js';
$(async function () {
  await authenticateLogin();
  if (keycloak.authenticated) {
    console.log("User is authenticated");
  } else {
    console.log("User is not authenticated! Calling authenticate function");
    console.log("Authentication status: ", keycloak.authenticated);
  }
});