// Shared auth guard — included on protected pages (dashboard, account)
// Redirects to login.html if no token is found
(function guardRoute() {
  if (!localStorage.getItem('token')) {
    window.location.href = '/login.html';
  }
})();
