const { ApolloServer, gql } = require("apollo-server");

require("dotenv").config();

const { sequelize } = require("./models");

const resolvers = require("./graphql/resolvers");
const typeDefs = require("./graphql/typeDefs");
const contextMiddleWare = require("./util/contextMiddleWare");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: contextMiddleWare,
  subscriptions: { path: "/" },
});

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log(`🚀 Subscription ready at ${subscriptionsUrl}`);

  sequelize
    .authenticate()
    .then(() => console.log("Database connected!!"))
    .catch((err) => console.log(err));
});
