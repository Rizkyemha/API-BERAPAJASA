const {
    getUser,
    addUser,
    loginUser,
    newLoan,
    updateStatusLoan,
    deleteLoan,
  } = require('./handler');
  
  const routes = [
    {
      method: 'GET',
      path: '/profile/{user_id}',
      handler: getUser,
    },
    {
      method: 'POST',
      path: '/login',
      handler: loginUser,
    },
    {
      method: 'POST',
      path: '/register',
      handler: addUser,
    },
    {
      method: 'POST',
      path: '/new-loan/{user_id}',
      handler: newLoan,
    },
    {
      method: 'PATCH',
      path: '/profile/{user_id}',
      handler: updateStatusLoan,
    },
    {
      method: 'DELETE',
      path: '/profile/{user_id}',
      handler: deleteLoan,
    }
  ];
  
  module.exports = routes;
  