import { makeExecutableSchema } from "@graphql-tools/schema";
import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
  } from 'graphql'
import { aql } from "arangojs";

// #TODO use schema first definition - ie. "export const schema = new GraphQLSchema({"with fields and definitions & resolvers for this once working 

const typeDefinitions = /* GraphQL */ `
    type Query {
        hello: String
    }

    type Mutation {
        createDataService(serviceName: String!, domain: String!): DataService
    }

    type DataService {
        serviceName: String
        domain: String
    }
    `;

const resolvers = {

    Query: {
        hello: () => 'Hello, world!',
    },

    Mutation: {
        createDataService: async (_, args, context) => {
            const { db } = context;
            const { serviceName, domain } = args;

            console.log(serviceName)
            console.log(domain);
            
            const insertQuery = aql ` 
                INSERT {
                    "serviceName": ${serviceName},
                    "domain": ${domain}
                    } INTO dataServicesCollection
                `;
            // OPTIONS { exclusive: true }
            try {
                const insertResult = await context.db.query(insertQuery);
                console.log("Inserted new service:", insertResult);
                // insertNewServiceDB(serviceName, domain)

                // retrieve back doc - to ensure insert success (won't need in future - use tests instead! )
                const fetchQuery = aql`
                    FOR doc IN dataServicesCollection
                    FILTER doc.serviceName == ${serviceName}
                    RETURN doc
                `;
                const cursor = await context.db.query(fetchQuery);
                const insertedDocument = await cursor.next();
                console.log("Fetched inserted service:", insertedDocument);

                return insertedDocument;

              } catch (error) {
                console.error("Error creating service:", error);
                console.log(error);
                throw new Error("Failed to create service.");
              }
            return { serviceName, domain };
        },
        // example:
        //  mutation {
        //     createDataService(serviceName: "testService", domain: "something.alpha.phac.ca") {
        //       serviceName
        //       domain
        //     }
        //   }
      },
    };

export const schema = makeExecutableSchema({
  resolvers: [resolvers],
  typeDefs: [typeDefinitions],
});