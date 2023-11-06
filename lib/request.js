module.exports = function (axios, api_url, headers_request = null) {
  const api = axios.create({
    baseURL: api_url,
    timeout: 10000,
    maxRequests: 2,
    perMilliseconds: 1000,
    maxRPS: 2,
    headers: headers_request
  });

  return {
    async get(url, params, debug = false, data_disable = null) {
      return await api
        .get(url, { params: params })
        .then((response) => {
          if (debug) {
            console.log(response);
          }
          if (data_disable != null) {
            return response.data;
          } else {
            return response.data.data;
          }
        })
        .catch((err) => {
          if (debug) {
            console.log(err);
          }
          return err;
        });
    },
    async post(url, params) {
      return await api
        .post(url, params, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          return response.data.data;
        })
        .catch((err) => {
          return err;
        });
    },
  };
};
