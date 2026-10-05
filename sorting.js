
const START=[3,5,2,3,1];
const $=id=>document.getElementById(id);
function midIndex(n){return Math.floor((n-1)/2)} // left-middle for even groups, matching the guide
function pivotFor(arr,rule){return rule==="first"?arr[0]:rule==="last"?arr[arr.length-1]:arr[midIndex(arr.length)]}
function bubbleTrace(input){
 let a=[...input],steps=[],C=0,S=0,passes=0;
 for(let end=a.length-1;end>0;end--){
  let changed=false; passes++;
  for(let i=0;i<end;i++){
   C++; let before=[...a],swap=a[i]>a[i+1];
   if(swap){[a[i],a[i+1]]=[a[i+1],a[i]];S++;changed=true}
   steps.push({type:"bubble",i,j:i+1,swap,before,after:[...a],C,S,pass:passes,finishedFrom:end});
  }
  if(!changed)break;
 }
 return {steps,result:a,C,S,passes};
}
function selectionTrace(input){
 let a=[...input],steps=[],C=0,S=0,rounds=0;
 for(let pos=0;pos<a.length-1;pos++){
  rounds++; let min=pos;
  for(let j=pos+1;j<a.length;j++){
   C++; let old=min;if(a[j]<a[min])min=j;
   steps.push({type:"scan",pos,j,oldMin:old,min,C,S,round:rounds,state:[...a]});
  }
  if(min!==pos){let before=[...a];[a[pos],a[min]]=[a[min],a[pos]];S++;steps.push({type:"selswap",pos,min,before,after:[...a],C,S,round:rounds})}
  steps.push({type:"selfixed",pos,state:[...a],C,S,round:rounds});
 }
 return {steps,result:a,C,S,rounds};
}
function quickTrace(input,rule){
 let scans=0,parts=0,events=[];
 function q(arr,path="whole"){
  if(arr.length<=1)return [...arr];
  let pivot=pivotFor(arr,rule),less=[],equal=[],greater=[];parts++;
  events.push({type:"partitionStart",arr:[...arr],pivot,path,parts,scans});
  arr.forEach((v,idx)=>{
   scans++;
   let group=v<pivot?"less":v>pivot?"greater":"equal";
   if(group==="less")less.push(v);else if(group==="greater")greater.push(v);else equal.push(v);
   events.push({type:"classify",arr:[...arr],pivot,value:v,index:idx,group,less:[...less],equal:[...equal],greater:[...greater],parts,scans,path});
  });
  let L=q(less,path+".L"),G=q(greater,path+".G");
  let joined=[...L,...equal,...G];events.push({type:"join",pivot,path,joined:[...joined],parts,scans});
  return joined;
 }
 let result=q([...input]);return {events,result,scans,parts};
}
function eq(a,b){return JSON.stringify(a)===JSON.stringify(b)}
function selfTests(){
 let failures=[];
 let b=bubbleTrace(START);
 if(!eq(b.result,[1,2,3,3,5]))failures.push("bubble result");
 if(b.C!==10||b.S!==7||b.passes!==4)failures.push(`bubble counts ${b.C}/${b.S}/${b.passes}`);
 if(!(b.steps[0].i===0&&b.steps[0].j===1&&!b.steps[0].swap))failures.push("bubble first comparison");
 let s=selectionTrace(START);
 if(!eq(s.result,[1,2,3,3,5])||s.C!==10||s.S!==4||s.rounds!==4)failures.push("selection trace");
 let q1=quickTrace(START,"first"),ql=quickTrace(START,"last"),qm=quickTrace(START,"middle");
 if(!eq(q1.result,[1,2,3,3,5])||q1.scans!==7||q1.parts!==2)failures.push("quick first");
 if(!eq(ql.result,[1,2,3,3,5])||ql.scans!==9||ql.parts!==2)failures.push("quick last");
 if(!eq(qm.result,[1,2,3,3,5])||qm.scans!==10||qm.parts!==3)failures.push("quick middle");
 if(pivotFor(START,"middle")!==2)failures.push("middle pivot");
 return failures;
}
