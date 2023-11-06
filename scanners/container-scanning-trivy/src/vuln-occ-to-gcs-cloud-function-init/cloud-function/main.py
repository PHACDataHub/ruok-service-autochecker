# From https://medium.com/google-cloud/centrally-managing-artifact-registry-container-image-vulnerabilities-on-google-cloud-part-one-d86fb4791601
import base64
import os
import json
from google.cloud.devtools import containeranalysis_v1
from google.cloud import storage

def write_vuln_to_bucket(bucket_name, vuln_text, destination_object_name):
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    obj = bucket.blob(destination_object_name)
    obj.upload_from_string(vuln_text)

def image_vuln_pubsub_handler(event, context):
    #get the Pub/Sub message containing the vulnerability occurrence id
    data = json.loads(base64.b64decode(event['data']).decode('utf-8'))

    if data.get('kind') == 'VULNERABILITY' and 'name' in data:
        occurrence_id = data['name']
    else:
        return

    #load in environment variables for GCS bucket.  
    bucket_name = os.environ.get("BUCKET_NAME", "")

    if bucket_name == '':
        print("Bucket name not set")
        return

    print('Bucket name:', bucket_name)

    # #get the occurrence via the grafeas client
    # occurrence_name = (data['name'])
    # client = containeranalysis_v1.ContainerAnalysisClient()
    # grafeas_client = client.get_grafeas_client()
    # o = grafeas_client.get_occurrence(name=occurrence_name)

    # #write to storage
    # write_vuln_to_bucket(bucket_name, str(o), str(o.name))
        # Get the occurrence via the Container Analysis client
    client = containeranalysis_v1.ContainerAnalysisClient()
    occurrence = client.get_occurrence(name=occurrence_id)

    # Extract vulnerability details from the occurrence
    vuln_summary = client.get_occurrence_vulnerability_summary(name=occurrence_id)

    # Save vulnerability details to GCS
    if vuln_summary:
        write_vuln_to_bucket(bucket_name, json.dumps(vuln_summary), f"{occurrence_id}.json")



