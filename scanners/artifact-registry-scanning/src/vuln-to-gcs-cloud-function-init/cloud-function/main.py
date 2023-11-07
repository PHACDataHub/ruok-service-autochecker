# # From https://medium.com/google-cloud/centrally-managing-artifact-registry-container-image-vulnerabilities-on-google-cloud-part-one-d86fb4791601
# From https://medium.com/google-cloud/centrally-managing-artifact-registry-container-image-vulnerabilities-on-google-cloud-part-one-d86fb4791601
# https://googleapis.dev/python/grafeas/0.4.1/gapic/v1/api.html
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

    #load in environment variables for GCS bucket.  
    bucket_name = os.environ.get("BUCKET_NAME", "")

    if bucket_name == '':
        print("Bucket name not set")
        return

    print('Bucket name:', bucket_name)
    #get the occurrence via the grafeas client
    occurrence_name = (data['name'])

    # initialize client
    client = containeranalysis_v1.ContainerAnalysisClient()
    grafeas_client = client.get_grafeas_client()

    occurrence = grafeas_client.get_occurrence(name=occurrence_name)
    # occurrence = grafeas_client.get_occurrence_note(name=occurrence_name)
    # occurrence = grafeas_client.list_occurrences(name=occurrence_name)
    # occurrence = grafeas_client.get_note(name=occurrence_name)
    # list_notes
    # list_occurrences (for project)

    # if occurrence.kind == 'VULNERABILITY':
    #     # Extract subset of info from the occurrence
    occurrence_info = {
        "name": occurrence.name,
        "resource_uri": occurrence.resource_uri,
        # "note_name": occurrence.note_name,
        "kind": occurrence.kind,
        "short_description": getattr(occurrence.vulnerability, 'short_description', None),
        "related_url": getattr(occurrence.vulnerability.related_url, 'url', None),
        "package_type": getattr(occurrence.vulnerability, 'package_type', None),
        "effective_severity": getattr(occurrence.vulnerability, 'effective_severity', None),
        "fix_available": getattr(occurrence.vulnerability, 'fix_available', None),
        "cvss_score": getattr(occurrence.vulnerability, 'cvss_score, None),
        "create_time": str(occurrence.create_time),
        "update_time": str(occurrence.update_time),
    }

    #     # Convert the extracted information to a string (JSON format)
    occurrence_info_str = json.dumps(occurrence_info)

    
        #write to storage
    # write_vuln_to_bucket(bucket_name, str(occurrence), str(occurrence.name))
    short_description = occurrence.vulnerability.short_description if hasattr(occurrence.vulnerability, 'short_description') else None

    write_vuln_to_bucket(bucket_name, occurrence_info_str, f"{occurrence.name}_{occurrence.vulnerability.short_description}.json")
    # f"{occurrence.name}_occurrence_info.json"
    # write_vuln_to_bucket(bucket_name, str(data), str(occurrence.name))
        # write_vuln_to_bucket(bucket_name, occurrence_info_str, str(occurrence.name))

# image_vuln_pubsub_handler(event, context)

# # From https://medium.com/google-cloud/centrally-managing-artifact-registry-container-image-vulnerabilities-on-google-cloud-part-one-d86fb4791601
