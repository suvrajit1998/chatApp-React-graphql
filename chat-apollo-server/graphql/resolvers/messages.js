const {
  UserInputError,
  AuthenticationError,
  ForbiddenError,
  withFilter,
} = require("apollo-server");

const { User, Message, Reaction } = require("../../models");

const { Op } = require("sequelize");

module.exports = {
  Query: {
    getMessages: async (parent, { from }, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");

        const otherUser = await User.findOne({ where: { username: from } });

        if (!otherUser) throw new UserInputError("User not Found");

        const usernames = [user.username, otherUser.username];

        const messages = await Message.findAll({
          where: {
            from: { [Op.in]: usernames },
            to: { [Op.in]: usernames },
          },
          order: [["createdAt", "DESC"]],
          include: [{ model: Reaction, as: "reactions" }],
        });

        return messages;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  Mutation: {
    sendMessage: async (parent, { to, content }, { user, pubsub }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");

        const recipint = await User.findOne({ where: { username: to } });

        if (!recipint) throw new UserInputError("user not Found");
        else if (recipint.username === user.username)
          throw new UserInputError("You cant message yourself");

        if (content.trim() === "") throw new UserInputError("Message is Empty");

        const message = await Message.create({
          from: user.username,
          to,
          content,
        });

        pubsub.publish("NEW_MESSAGE", { newMessage: message });

        return message;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    reactToMessage: async (_, { uuid, content }, { user, pubsub }) => {
      const reactions = ["❤️", "😆", "😯", "😢", "😡", "👍", "👎"];
      try {
        if (!reactions.includes(content))
          throw new UserInputError("Invalid Reaction");

        const username = user ? user.username : "";

        user = await User.findOne({ where: { username } });

        if (!user) throw new AuthenticationError("Unauthenticated");

        const message = await Message.findOne({ where: { uuid } });

        if (!message) throw new UserInputError("Message not found");

        if (message.from !== user.username && message.to !== user.username)
          throw new ForbiddenError("Unauthorized");

        let reaction = await Reaction.findOne({
          where: { messageId: message.id, userId: user.id },
        });

        if (reaction) {
          reaction.content = content;
          await reaction.save();
        } else {
          reaction = await Reaction.create({
            messageId: message.id,
            userId: user.id,
            content,
          });
        }

        pubsub.publish("NEW_REACTION", { newReaction: reaction });

        return reaction;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        (_, __, { pubsub, user }) => {
          if (!user) throw new AuthenticationError("Unauthenticated!");
          return pubsub.asyncIterator("NEW_MESSAGE");
        },
        ({ newMessage }, _, { user }) => {
          if (
            newMessage.from === user.username ||
            newMessage.to === user.username
          )
            return true;

          return false;
        }
      ),
    },
    newReaction: {
      subscribe: withFilter(
        (_, __, { pubsub, user }) => {
          if (!user) throw new AuthenticationError("Unauthenticated!");
          return pubsub.asyncIterator("NEW_REACTION");
        },
        async ({ newReaction }, _, { user }) => {
          const message = await newReaction.getMessage();
          if (message.from === user.username || message.to === user.username)
            return true;

          return false;
        }
      ),
    },
  },
};
