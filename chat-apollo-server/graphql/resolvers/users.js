const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const { UserInputError, AuthenticationError } = require("apollo-server");

const { User, Message } = require("../../models");

module.exports = {
  Query: {
    getUsers: async (_, __, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");

        let users = await User.findAll({
          attributes: ["username", "imageUrl", "createdAt"],
          where: { username: { [Op.ne]: user.username } },
        });

        const allUserMessages = await Message.findAll({
          where: {
            [Op.or]: [{ from: user.username }, { to: user.username }],
          },
          order: [["createdAt", "DESC"]],
        });

        users = users.map((otherUser) => {
          const letestMessage = allUserMessages.find(
            (m) => m.from === otherUser.username || m.to === otherUser.username
          );
          otherUser.letestMessage = letestMessage;

          return otherUser;
        });

        return users;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    login: async (_, args) => {
      const { username, password } = args;
      let error = {};

      try {
        if (username.trim() === "")
          error.username = "username must not be empty";
        if (password.trim() === "")
          error.password = "password must not be empty";

        if (Object.keys(error).length > 0)
          throw new UserInputError("bad input", { error });

        const user = await User.findOne({ where: { username } });

        if (!user) {
          error.username = "user not found";
          throw new UserInputError("user not Found", { error });
        }

        const correctPassword = await bcrypt.compare(password, user.password);

        if (!correctPassword) {
          error.password = "password is incorrect";
          throw new UserInputError("password is incorrect", { error });
        }

        const token = jwt.sign({ username }, process.env.JWT_SECRET, {
          expiresIn: 60 * 60,
        });

        return {
          ...user.toJSON(),
          token,
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  Mutation: {
    register: async (_, args) => {
      let { username, email, password, confirmPassword, imageUrl } = args;
      let error = {};

      try {
        if (email.trim() === "") error.email = "email must not be empty!";
        if (username.trim() === "")
          error.username = "username must not be empty!";
        if (password.trim() === "")
          error.password = "password must not be empty!";
        if (confirmPassword.trim() === "")
          error.confirmPassword = "confirmPassword must not be empty!";

        if (password !== confirmPassword)
          error.confirmPassword = "passwords must match";

        // const userByUsername = await User.findOne({ where: { username } });
        // const userByEmail = await User.findOne({ where: { email } });

        // if (userByUsername) error.username = "Username has taken";
        // if (userByEmail) error.email = "Email has taken";

        if (Object.keys(error).length > 0) throw error;

        password = await bcrypt.hash(password, 6);

        const user = await User.create({
          username,
          email,
          password,
          imageUrl,
        });

        return user;
      } catch (err) {
        console.log(err);
        if (err.name === "SequelizeUniqueConstraintError") {
          err.errors.forEach(
            (er) => (error[er.path] = `${er.path} is already taken`)
          );
        } else if (err.name === "SequelizeValidationError") {
          err.errors.forEach((er) => (error[er.path] = er.message));
        }
        throw new UserInputError("Bad input", { error });
      }
    },
  },
};
