/**
 * Builds a standardised API response object.
 *
 * @param {boolean} success
 * @param {*}       data
 * @param {string}  [message]
 * @param {number}  [statusCode=200]
 */
export const apiResponse = (res, { success = true, data = null, message = '', statusCode = 200 }) => {
  return res.status(statusCode).json({ success, data, message });
};
