import {Resvg} from '@resvg/resvg-js';
import {writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
const directory=process.argv[2];if(!directory)throw new Error('Provide output directory');mkdirSync(directory,{recursive:true});
const holdings={
 VFLO:{as_of:'2026-06-30',source:'https://advisor.vcm.com/assets/etf/factsheet-pdf/VS%20VFLO%20FS.pdf',items:[['Devon Energy',3.49],['Expedia',3.41],['Adobe',3.37],['Sandisk',3.03],['Coeur Mining',3.03]]},
 VOO:{as_of:'2026-06-30',source:'https://workplace.vanguard.com/assets/corp/fund_communications/pdf_publish/us-products/fact-sheet/F0968.pdf',items:[['NVIDIA',7.5],['Apple',6.6],['Alphabet',5.8],['Microsoft',4.3],['Amazon',3.6]]},
 SCHD:{as_of:'2026-09-03',source:'https://www.schwabassetmanagement.com/products/schd',items:[['Merck',4.91],['Amgen',4.85],['Abbott',4.61],['Coca-Cola',4.16],['Chevron',4.11]]}
};
const colors=['#4c6037','#3c7893','#bc7939','#9577a6','#bf6763','#d9dcd1'];
const text=(x,y,size,value,weight=400)=>`<text x="${x}" y="${y}" font-size="${size}" fill="#262b22" font-weight="${weight}">${value}</text>`;
for(const other of ['VOO','SCHD']){
 let svg=text(50,65,27,'BRIEFLO / HOLDINGS',700)+text(50,128,44,`VFLO vs ${other} 구성종목`,700)+text(50,174,27,'상위 5개 보유항목 + 나머지 순자산');
 for(const [index,ticker]of ['VFLO',other].entries()){
  const data=holdings[ticker],top=230+index*440,cy=top+205,cx=200,r=112,circumference=2*Math.PI*r;
  const sum=data.items.reduce((s,x)=>s+x[1],0),otherWeight=Math.round((100-sum)*100)/100;
  if(sum<=0||sum>=100)throw new Error('Invalid weights');
  const items=[...data.items,['나머지 순자산',otherWeight]];
  svg+=text(50,top,36,ticker,700)+text(185,top,26,`기준일 ${data.as_of}`);
  let offset=0;
  for(const [i,[name,value]]of items.entries()){
   const length=circumference*value/100;
   svg+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colors[i]}" stroke-width="56" stroke-dasharray="${length} ${circumference-length}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"/>`;offset+=length;
   svg+=`<rect x="385" y="${top+47+i*48}" width="20" height="20" rx="4" fill="${colors[i]}"/>`;
   svg+=text(420,top+65+i*48,27,name)+text(750,top+65+i*48,27,`${value.toFixed(2)}%`,700);
  }
  svg+=text(cx-62,cy-10,24,'상위 5개')+text(cx-65,cy+34,33,`${sum.toFixed(2)}%`,700);
 }
 svg+=text(50,1110,25,other==='SCHD'?'기준일이 다르므로 동일 시점의 집중도 비교는 아닙니다.':'양쪽 모두 2026.06.30 공통 기준입니다.');
 svg+=text(50,1155,25,'나머지 = 100% − 표시한 5개 비중 합계 (현금 등 포함 가능)');
 svg+=text(50,1200,25,'비중은 변동되며, 원문 반올림에 따른 오차가 있을 수 있습니다.');
 svg+=text(50,1250,23,`출처: Victory Capital · ${other==='VOO'?'Vanguard':'Schwab'} / BRIEFLO 재구성`);
 const raw=`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1300"><rect width="900" height="1300" fill="#faf9f5"/><g font-family="Pretendard">${svg}</g></svg>`;
 writeFileSync(resolve(directory,`vflo-${other.toLowerCase()}-holdings.png`),new Resvg(raw,{font:{fontFiles:[resolve('src/assets/fonts/Pretendard-Regular.otf'),resolve('src/assets/fonts/Pretendard-Bold.otf')],loadSystemFonts:false}}).render().asPng());
}
writeFileSync(resolve(directory,'holdings-data.json'),JSON.stringify(holdings,null,2));
