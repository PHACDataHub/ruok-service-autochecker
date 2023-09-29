// from https://mikewilliamson.wordpress.com/2017/03/24/arangodb-and-graphql/
// /src/database.js
import arangojs, { aql } from 'arangojs'
 
export const db = arangojs({
  url: `http://root:yourpassword@0.0.0.0:8529`,
//   databaseName: 'dataServices'
})
 
export async function insertNewServiceDB(serviceName, domain) {
  let query = aql`
    INSERT {
        "serviceName": ${serviceName},
        "domain": ${domain}
        } INTO dataServicesCollection
    `
//   let results = await db.query(query)
    let results =  await db.query(insertQuery);
    console.log("Inserted new service:", insertResult);
    // return results.next()
    return results
}
