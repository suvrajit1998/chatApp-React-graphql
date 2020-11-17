const { ApolloServer, gql } = require("apollo-server");

const { sequelize } = require("./models");

const resolvers = require("./graphql/resolvers");
const typeDefs = require("./graphql/typeDefs");
const contextMiddleWare = require("./util/contextMiddleWare");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: contextMiddleWare,
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);

  sequelize
    .authenticate()
    .then(() => console.log("Database connected!!"))
    .catch((err) => console.log(err));
});
