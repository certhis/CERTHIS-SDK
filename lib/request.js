module.exports = function (axios, api_url) {
  const api = axios.create({
    baseURL: api_url,
    timeout: 3000,
  });

  return {
    async get(url, params, debug = false) {
      var getResponse = await api
        .get(url, { params: params })
        .then((response) => {
          if (debug) {
            console.log(response);
          }

          return response.data.data;
        })
        .catch((err) => {
          if (debug) {
            console.log(err);
          }
          return err.response.data;
        });

      return getResponse;
    },
    async post(url, params) {
      var postResponse = await api
        .post(url, params)
        .then((response) => {
          return response.data.data;
        })
        .catch((err) => {

    
          return err.response.data;
        });

      return postResponse;
    },
  };
};
