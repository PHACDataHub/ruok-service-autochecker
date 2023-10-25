// fs docs node https://nodejs.org/docs/v0.3.4/api/fs.html
import * as fs from 'fs';
import * as yaml from 'js-yaml'

export async function parseYamlFile(filePath) {
  try {
    const contents = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(contents);
    return data;
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}



