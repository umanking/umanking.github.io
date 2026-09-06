// Reproducible editorial chart from issuer-published NAV returns. No invented price series.
import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const destination = process.argv[2];
if (!destination) throw new Error('Provide chart output directory');
mkdirSync(destination, {recursive:true});
const data = {
  as_of:'2026-06-30', retrieved_at:'2026-09-06', basis:'USD NAV total return, distributions reinvested; 3y annualized',
  VFLO:{one_year:31.19,three_year:23.34,source:'https://advisor.vcm.com/assets/etf/factsheet-pdf/VS%20VFLO%20FS.pdf'},
  VOO:{one_year:22.28,three_year:20.58,source:'https://workplace.vanguard.com/assets/corp/fund_communications/pdf_publish/us-products/fact-sheet/F0968.pdf'},
  SCHD:{one_year:24.08,three_year:13.52,source:'https://www.schwabassetmanagement.com/products/schd'},
};
for(const other of ['VOO','SCHD']) {
 let elements='';
 const text=(x,y,size,value,color='#262b22',weight=400)=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}">${value}</text>`;
 elements+=text(64,70,27,'BRIEFLO / ETF PERFORMANCE','#4c6037',700);
 elements+=text(64,145,50,`VFLO vs ${other}`,undefined,700);
 elements+=text(64,193,27,'2026.06.30 기준 · 배당 재투자 포함 NAV 수익률');
 for(const [i,key,label] of [[0,'one_year','최근 1년 누적 수익률'],[1,'three_year','최근 3년 연평균 수익률']]) {
   const top=265+i*255; elements+=text(64,top,31,label,undefined,700);
   for(let j=0;j<2;j++) { const ticker=j?other:'VFLO',value=data[ticker][key],y=top+35+j*73;
     elements+=text(64,y+36,30,ticker,undefined,700);
     elements+=`<rect x="195" y="${y}" width="${value/35*640}" height="48" rx="5" fill="${j?'#858c7d':'#4c6037'}"/>`;
     elements+=text(210+value/35*640,y+35,31,`${value.toFixed(2)}%`,undefined,700);
   }
 }
 elements+=text(64,765,25,'가로 길이: 수익률 · 두 패널 모두 0~35% 동일 척도');
 elements+=text(64,805,25,'1년: 2025.06.30~2026.06.30 / 3년: 2023.06.30~2026.06.30');
 elements+=text(64,850,24,'운용 비용 반영 · 개인 세금·거래비용·환율 효과 제외');
 elements+=text(64,890,24,'과거 성과는 미래 수익을 보장하지 않습니다.');
 elements+=text(64,942,22,`출처: Victory Capital · ${other==='VOO'?'Vanguard':'Schwab Asset Management'} / BRIEFLO 재구성`);
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="980" viewBox="0 0 1100 980"><rect width="1100" height="980" fill="#faf9f5"/><g font-family="Pretendard">${elements}</g></svg>`;
 const png=new Resvg(svg,{font:{fontFiles:[resolve('src/assets/fonts/Pretendard-Regular.otf'),resolve('src/assets/fonts/Pretendard-Bold.otf')],loadSystemFonts:false}}).render().asPng();
 writeFileSync(resolve(destination,`vflo-${other.toLowerCase()}-performance.png`),png);
}
writeFileSync(resolve(destination,'data.json'),JSON.stringify(data,null,2));
