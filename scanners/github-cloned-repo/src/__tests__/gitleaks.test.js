// use the gitleaks repo site for testing 
import { Gitleaks, extractSummaryInfo, readGitleaksOutputFile, runGitleaks } from '../gitleaks'
import {  existsSync, rmSync } from 'fs';

describe('Need tests', () => {

    it('should have tests', async () => {
        const a =1
        const b= 2
        
        const c = a + b
        expect(c).toEqual(3);
    });
  });