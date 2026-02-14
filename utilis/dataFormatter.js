const formatResponse = (error, data, successMessage) => {
  if (error) {
    return {
      status: "error",
      message: error?.includes('"') ? error.replace(/"/g, "") : error,
      data: null,
    };
  } else {
    return {
      status: "success",
      message: successMessage,
      data: data,
    };
  }
};

module.exports = { formatResponse };
