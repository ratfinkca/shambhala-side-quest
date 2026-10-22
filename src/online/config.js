export function readOnlineConfig(env={}){
  try{
    const endpoint=new URL(env.VITE_PLAYTEST_URL),notice=new URL(env.VITE_PLAYTEST_NOTICE_URL);
    const secure=url=>url.protocol==='https:'||(env.DEV===true&&url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname));
    if(env.VITE_PLAYTEST_ENABLED!=='true'||!secure(endpoint)||!secure(notice)||endpoint.username||endpoint.password||notice.username||notice.password)return {enabled:false};
    return {enabled:true,endpoint:endpoint.href,notice:notice.href,buildId:env.VITE_BUILD_ID||'dev'};
  }catch{return {enabled:false};}
}
