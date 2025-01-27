const { User } = require("../models/User");

const updateUser = async ({ id, onSuccess, body, onError, ctx }) => {
  try {
    await User.updateOne(
      {
        _id: id,
      },
      body
    );
    onSuccess();
  } catch (e) {
    console.log(e);

    onError();
  }
};

module.exports = { updateUser };
