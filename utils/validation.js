// utils/validation.js
const allowedStatuses = ["pending", "approved", "assigned", "completed"];

const isValidStatus = (status) => {
  return allowedStatuses.includes(status);
};

module.exports = {
  isValidStatus,
  allowedStatuses,
};
