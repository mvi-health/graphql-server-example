  "use strict"

  const {
    ApolloServer,
    gql
  } = require('apollo-server');
  const uuidv4 = require('uuid/v4');
  // This is a (sample) collection of persons we'll be able to query
  // the GraphQL server for.  A more complete example might fetch
  // from an existing data source like a REST API or database.
  let persons = [{
      email: 'abc@def.com',
      userId: uuidv4(),
    },
    {
      email: 'abc@def.com',
      userId: uuidv4(),
    },
  ];

  // Type definitions define the "shape" of your data and specify
  // which ways the data can be fetched from the GraphQL server.
  const typeDefs = gql `
    # Comments in GraphQL are defined with the hash (#) symbol.

    # This "Person" type can be used in other type declarations.
    type Person {
      email: String
      userId: String
    }

    # The "Query" type is the root of all GraphQL queries.
    # (A "Mutation" type will be covered later on.)
    type Query {
      persons: [Person]
    }

    input persons_insert_input {
      email: String
      userId: String    
    }
    
    type persons_mutation_response {
      # number of affected rows by the mutation
      affected_rows: Int!
    
      # data of the affected rows by the mutation
      returning: [Person!]!
    }
    
    type Mutation {
      insert_person(email: String!): Person!

      insert_persons(objects: [persons_insert_input!]!): persons_mutation_response
    }
  
  `;

  // here we would call azure ad 
  const makePerson = (email) => {
    const userId = uuidv4(); // replace with AD callwhich will return us a user id;
    
    // populate our database. either via postgres or use hasura client

    return {
      email,
      userId
    }
  };

  // Resolvers define the technique for fetching the types in the
  // schema.  We'll retrieve persons from the "persons" array above.
  const resolvers = {
    Query: {
      persons: () => persons,
    },
    Mutation: {
      insert_person: (parent, args) => {
        const newPerson = makePerson(args.email);
        persons.push(newPerson);
        return newPerson;
      },

      insert_persons: (parent, {
        objects
      }) => {
        const newPersons = objects.map(p => makePerson(p.email));
        persons = persons.concat(newPersons);
        return {
          affected_rows: newPersons.length,
          returning: newPersons
        }
      }
    },
  };

  const context = ({
    req
  }) => {
    console.log(`Query ${req.body.query} variables ${req.body.variables}`);
    return {
      authScope: req.headers
    }
  }

  // In the most basic sense, the ApolloServer can be started
  // by passing type definitions (typeDefs) and the resolvers
  // responsible for fetching the data for those types.
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context
    // engine: process.env.ENGINE_API_KEY && {
    // apiKey: process.env.ENGINE_API_KEY,
    // },
  });

  // This `listen` method launches a web-server.  Existing apps
  // can utilize middleware options, which we'll discuss later.
  server.listen().then(({
    url
  }) => {
    console.log(`🚀  Server ready at ${url}`);
  });



  //GraphiQl queries
  /*
    {
      persons {
        email
        userId
      }
    }
    
  mutation {
    insert_persons(objects:[
      {
        email: "howie@myself.com"
      },
      {
        email: "binky@here.com"
      }
    ]) {
      affected_rows
      returning {
        email
        userId
      }
    }  
  }

  */