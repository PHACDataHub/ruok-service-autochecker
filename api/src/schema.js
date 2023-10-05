import { createSchema } from 'graphql-yoga'
import { GraphQLJSON } from 'graphql-type-json';
import { aql } from "arangojs";

// #TODO use schema first definition - ie. "export const schema = new GraphQLSchema({"with fields and definitions & resolvers for this once working 
// upsertService(data: JSON): JSON

export const schema = createSchema({
    typeDefs: /* GraphQL */ `
        scalar JSON

        type Query {
            hello: String
            getProjectByName(projectName: String!): Project
            getProjectIDByName(projectName: String!): String
            getAllProjects: [Project]
            getSourceCodeRepositoryByServiceName(serviceName: String!): String
        }

        type Mutation {
            createDataService(serviceName: String!, domain: String!): DataService
            
            upsertService(
                projectName: String! = ""
                sourceCodeRepository: String = ""
                _key: String
                containerRegistries: String = ""
                serviceEndpointUrls: String = ""
                domains: [String] = ""
              ): JSON

              upsertGitHubScan(
                _key: String! 
                gitHubRepository: String!
                scanResults: JSON
                timestamp: Int
                ): JSON
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
    `,
    // upsertProjectWithGitHubRepoScan(project_name: String!, project_scan)
    resolvers: {
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
            
            getSourceCodeRepositoryByServiceName: async (_, args, context) => {
                const { db } = context;
                const { serviceName } = args;
                try {
                    const cursor = await context.db.query(aql`
                        FOR doc IN services
                        FILTER doc._key == ${serviceName}
                        RETURN doc.sourceCodeRepository
                    `);
                    return await cursor.next()

                } catch (err) {
                    console.error(err.message);
                }
            },
            // example
            // query {
            //     getSourceCodeRepositoryByServiceName(serviceName: "epicenter")
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
                const {_key, projectName, sourceCodeRepository, containerRegistries, serviceEndpointUrls, domains } = args;
                const upsertQuery = aql `
                    INSERT { _key: ${_key},
                        projectName: ${projectName},
                        sourceCodeRepository: ${sourceCodeRepository},
                        containerRegistries: ${containerRegistries},
                        serviceEndpointUrls: ${serviceEndpointUrls},
                        domains: ${domains}
                    }
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
                return _key
            },
            // example
            // mutation {
            //     upsertService(
            //       _key: "test_service",
            //       projectName: "test Project Name",
            //       sourceCodeRepository: "https://github.com/example/project",
            //       containerRegistries: "registry.example.com",
            //       serviceEndpointUrls: "https://example.com/service",
            //       domains: ["example.com", "sub.example.com"]
            //     ) 
            //   }

            upsertGitHubScan: async (_, args, context) => {
                const { db } = context;
                const { _key, serviceName, gitHubRepository, scanResults } = args;

                console.log(_key, gitHubRepository, scanResults) // note the _key is the serviceName
       
                const timestamp = Date.now()
                const upsertQuery = aql`
                    INSERT { _key: ${_key},
                        gitHubRepository: ${gitHubRepository},
                        scanResults: ${scanResults},
                        timestamp: ${timestamp}
                    }
                    IN gitHubScan
                    OPTIONS { overwriteMode: "update" }
                    `;
                
                try {
                    const upsertResult = await context.db.query(upsertQuery);
                    console.log("Inserted/updated GitHub Scan results:", upsertResult);
                } catch (error) {
                    console.error("Error creating/updating GitHub Scan record:", error);
                    throw new Error("Failed to create/update service.");
                }
                return {
                    _key,
                    gitHubRepository,
                    scanResults,
                    timestamp
                };
            }
            // example: 
                // mutation {
                //     upsertGitHubScan(
                //             _key: "https",
                //                     gitHubRepository: "sehsdfoh",
                //             serviceName: "example-service",
                //             scanResults: {
                //                 hasAPI : true,
                //             }
                //         ) 
                //         }
        
        }
    }
})

// export const schema = makeExecutableSchema({
//   resolvers: [resolvers],
//   typeDefs: [typeDefinitions],
// });