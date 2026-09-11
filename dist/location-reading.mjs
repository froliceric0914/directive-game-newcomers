// Current map includes real-world reference shops. 'related' entries recommend
// reading by a source-backed scene/object; they do not assert fictional identity.
export const locationReadings={
 sokaya:{chapterIds:[1],kind:'story',note:'仙贝店「咸甜味」的故事。'},
 kiku:{chapterIds:[2],kind:'story',note:'松矢料亭与小伙计修平的故事。'},
 ubukeya:{chapterIds:[3],kind:'related',note:'关联阅读：刀具店「刻剪刀」与厨剪。原著未以「产毛屋」命名此店。'},
 tamahide:{chapterIds:[7],kind:'related',note:'关联阅读：加贺与弘毅谈到烤鸡店和鸡蛋烧。原著未确认这家店就是玉秀。'},
 kaiseiken:{chapterIds:[7],kind:'related',note:'关联阅读：古色古香、招牌写着「大正八年创业」的咖啡馆。原著未写出快生轩店名。'},
 craft:{chapterIds:[8],kind:'story',note:'民间艺术品店「童梦屋」的故事。'},
 shigemori:{chapterIds:[2],kind:'related',note:'关联阅读：修平购买人形烧的情节。原著未将人形烧店命名为重盛。'},
 benkei:{chapterIds:[4],kind:'story',note:'第四章的遛狗路线经过滨町绿道入口的弁庆雕塑。'},
 suitengu:{chapterIds:[4,5],kind:'story',note:'第四章的水天宫与小狗；第五章继续讲述峰子的参拜与西饼店。'}
};
export const chapters={
 1:{title:'仙贝店的女孩',label:'第一章',url:'chapters/1.json'},
 2:{title:'料亭的小伙计',label:'第二章',url:'chapters/2.json'},
 3:{title:'陶瓷器店的媳妇',label:'第三章',url:'chapters/3.json'},
 4:{title:'钟表店的狗',label:'第四章',url:'chapters/4.json'},
 5:{title:'西饼店的店员',label:'第五章',url:'chapters/5.json'},
 7:{title:'保洁公司的社长',label:'第七章',url:'chapters/7.json'},
 8:{title:'民间艺术品店的顾客',label:'第八章',url:'chapters/8.json'}
};
export function readingForLocation(id){return locationReadings[id]??null;}
