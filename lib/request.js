module.exports = function (axios, api_url) {
  const api = axios.create({
    baseURL: api_url,
    timeout: 3000,
  });

  return {
    async get(url, params) {
      var getResponse = await api
        .get(url, { params: params })
        .then((response) => {
          return response.data.data ;
        })
        .catch((err) => {
          return err.response.data ;
        });

      return getResponse;

    },
  };
};
