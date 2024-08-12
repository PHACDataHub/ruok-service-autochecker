import fs from 'fs';
import yaml from 'yaml';
import path from 'path';

export class DirHandler{
    constructor(dirPath){
        this.dirPath = dirPath;
    }

    findFileType(fileName,filePath = "/"){
        let fullFilePath = this.dirPath + filePath + "/" + fileName;
        return path.extname(fullFilePath);
    }

    async listDirContents(path = "/") {
        let dirContent = await fs.promises.readdir(this.dirPath + "/" + path, { encoding: "utf-8" });
        return dirContent.map(f => path + "/" + f);
    }

    async loadFileContents(fileName,filePath = "/") {
        let fullFilePath = this.dirPath + filePath + "/" + fileName;
        let fileContent = await fs.promises.readFile(fullFilePath, { encoding: "utf-8" });
        return fileContent;
    }

    async parseFileContents(fileName, filePath = "/") {
        let fileExtension = this.findFileType(fileName, filePath);
        let fileContent = await this.loadFileContents(fileName, filePath);
        let fullFilePath = this.dirPath + filePath + "/" + fileName;
        let parsed = '';
        switch(fileExtension){
            case ".yaml":
                parsed = yaml.parse(fileContent);
        }
        return parsed;
    }
}