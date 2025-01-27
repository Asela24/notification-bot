const { User } = require('../models/User');

const getUser = async (id) => await User.findById(String(id));

module.exports = { getUser };
