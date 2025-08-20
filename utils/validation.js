// utils/validation.js
const allowedStatuses = ["pending", "approved", "assigned", "completed"];

const isValidStatus = (status) => {
  return allowedStatuses.includes(status);
};

export default {
  isValidStatus,
  allowedStatuses,
};
