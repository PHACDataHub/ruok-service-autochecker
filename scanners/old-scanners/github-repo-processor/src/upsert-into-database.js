// const samplePayload = {"payload":{"project_name":"django-phac_aspc-helpers","repo_name":"django-phac_aspc-helpers","description":"Provides a series of helpers to provide a consistent experience accross  PHAC-ASPC's Django based projects.","visibility":"public","updated_at":"2023-01-09T22:09:59Z","pushed_at":"2023-09-11T23:00:16Z","default_branch":"main","has_license":true,"license_name":"MIT License","has_github_pages":false,"language":"Python","languages_all":{"all-languages":{"Python":64649,"CSS":18943,"HTML":3797}},"gitignore_details":[{"repoScopedPath":".gitignore","hasDotenv":true,"hasDoubleStarSlashStarDotenv":false,"hasDoubleStarSlashDotenvStar":false}],"has_security_md":false,"unit_test_details":[{"repoScopedPath":"testapp/tests"}],"has_api_directory":false,"has_dependabot_yaml":true}}


export async function formatPayloadForDatabase(payload) {
    pass
}

export async function upsertIntoDatabase(payload){
    pass
}

export async function insertIntoDatabase(payload, collectionName, db ) {
    try {
        const collection = db.collection(collectionName);
        collection.save(payload).then(
        meta => console.log('Document saved:', meta._rev),
        err => console.error('Failed to save document:', err)
        );
    
    } catch (err) {
        console.error(err.message);
    }
}