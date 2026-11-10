import {spawnSync} from 'node:child_process';
import {mkdtemp,rm,cp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
const root=process.cwd(),scratch=await mkdtemp(resolve(tmpdir(),'sidequest-pages-'));
try{
 for(const id of ['generic','smf']){const out=resolve(scratch,id),result=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--outDir',out,'--emptyOutDir'],{cwd:root,env:{...process.env,VITE_EDITION:id},stdio:'inherit'});if(result.status!==0)throw Error(`${id} build failed`);}
 await rm(resolve(root,'dist'),{recursive:true,force:true});await cp(resolve(scratch,'generic'),resolve(root,'dist'),{recursive:true});await cp(resolve(scratch,'smf'),resolve(root,'dist/smf'),{recursive:true});
}finally{await rm(scratch,{recursive:true,force:true});}
