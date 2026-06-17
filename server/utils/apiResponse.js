const success = (data, message = 'Success', statusCode = 200) => ({
  success: true,
  message,
  data,
  statusCode,
});

const error = (message = 'Error', statusCode = 500, errors = null) => ({
  success: false,
  message,
  statusCode,
  ...(errors && { errors }),
});

const paginated = (data, total, page, limit) => ({
  success: true,
  data,
  pagination: {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
  },
});

module.exports = { success, error, paginated };
