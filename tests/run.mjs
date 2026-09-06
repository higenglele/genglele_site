import {build} from 'esbuild';
import {mkdtemp, readdir, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const temp=await mkdtemp(join(tmpdir(),'home-agent-tests-'));
try {
 const files=(await readdir('tests')).filter(f=>/\.test\.(ts|mjs)$/.test(f));
 for(const file of files){
  const output=join(temp,file.replace(/\.ts$/,'.mjs'));
  await build({entryPoints:[resolve('tests',file)],outfile:output,bundle:true,platform:'node',format:'esm'});
  const result=spawnSync(process.execPath,[output],{stdio:'inherit'});
  if(result.status!==0)process.exitCode=1;
 }
} finally {await rm(temp,{recursive:true,force:true});}
