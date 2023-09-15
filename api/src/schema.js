import { makeExecutableSchema } from "@graphql-tools/schema";
import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
  } from 'graphql'
import { GraphQLJSON } from 'graphql-type-json';
import { aql } from "arangojs";

// #TODO use schema first definition - ie. "export const schema = new GraphQLSchema({"with fields and definitions & resolvers for this once working 

const typeDefinitions = /* GraphQL */ `
    scalar JSON

    type Query {
        hello: String
        getProjectByName(projectName: String!): Project
        getProjectIDByName(projectName: String!): String
        getAllProjects: [Project]
    }

    type Mutation {
        createDataService(serviceName: String!, domain: String!): DataService
        upsertService(payload: JSON): JSON

    }

    type Project {
        _key: ID
        projectName: String
        projectOwnerDivisionAcronym: String
        serviceURLs: [String]
        gitHubRepository: String
        internalTool: Boolean
    }

    type DataService {
        serviceName: String
        domain: String
    }
    `;
    // upsertProjectWithGitHubRepoScan(project_name: String!, project_scan)
const resolvers = {
    JSON: GraphQLJSON,

    Query: {
        hello: () => 'Hello, world!',

        getProjectByName: async (_, args, context) => {
            const { db } = context;
            const { projectName } = args;
            try {
                const cursor = await context.db.query(aql`
                    FOR doc IN dataServicesCollection
                    FILTER doc.projectName == ${projectName}
                    RETURN doc
                `);
                const project = await cursor.next()
                console.log("Found project:", project);
                return project;

              } catch (err) {
                console.error(err.message);
              }
            },
            // // example
            // query {
            //     getProjectByName(projectName: "epicenter") {
            //       _id
            //       projectName
            //       projectOwnerDivisionAcronym
            //       serviceURLs
            //       gitHubRepository
            //       internalTool
            //     }
            //   }

        
        getAllProjects: async (_, args, context) => {
            try {
                const cursor = await context.db.query(aql`
                    FOR doc IN dataServicesCollection
                    RETURN doc
                `);
                const projects = await cursor.all()
                console.log(projects);
                return projects;
            } catch (err) {
                console.error(err.message);
                throw new Error('Error fetching projects');
            }
        },
        // // example
        // {
        //     getAllProjects {
        //       projectName
        //       projectOwnerDivisionAcronym
        //       serviceURLs
        //       gitHubRepository
        //       internalTool
        //     }
        //   }
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
        upsertService: async (_, args, context) => {
            const { db } = context;
            const { payload } = args;
            const {_key} = payload;
            const upsertQuery = aql `
                INSERT { _key: ${_key}, payload: ${payload} }
                IN services 
                OPTIONS { overwriteMode: "update" }
                `;
    
            try {
                const upsertResult = await context.db.query(upsertQuery);
                console.log("Inserted new service:", upsertResult);
                // insertNewServiceDB(serviceName, domain)
            } catch (error) {
                console.error("Error creating service:", error);
                console.log(error);
                throw new Error("Failed to create service.");
              }
            return { _key }
        }
        // example
        // mutation {
        //     upsertService(payload: {stuff: "things", _key:"356"})
        //   }    
      
    }
}

export const schema = makeExecutableSchema({
  resolvers: [resolvers],
  typeDefs: [typeDefinitions],
});