import { readFile, readdir, stat, mkdir, writeFile } from "node:fs/promises";
import https from "node:https";

const root = new URL("../", import.meta.url);
const dataRoot = new URL("data/", root);
const output = new URL("data/i18n/en.json", root);
const hasChinese = value => /[\u3400-\u9fff]/.test(value);
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const preferred = {
  "新参者": "Newcomer",
  "仙贝店的女孩": "The Girl at the Senbei Shop",
  "料亭的小伙计": "The Apprentice at the Ryotei",
  "陶瓷器店的媳妇": "The Daughter-in-Law at the Tableware Shop",
  "钟表店的狗": "The Dog at the Clock Shop",
  "西饼店的店员": "The Pastry Shop Clerk",
  "翻译家的朋友": "The Translator's Friend",
  "保洁公司的社长": "The President of the Cleaning Company",
  "民间艺术品店的顾客": "The Customer at the Folk Craft Shop",
  "日本桥的刑警": "The Detective of Nihonbashi",
  "第一章": "Chapter 1",
  "第二章": "Chapter 2",
  "第三章": "Chapter 3",
  "第四章": "Chapter 4",
  "第五章": "Chapter 5",
  "第六章": "Chapter 6",
  "第七章": "Chapter 7",
  "第八章": "Chapter 8",
  "第九章": "Chapter 9",
  "加贺恭一郎": "Kyoichiro Kaga",
  "三井峰子": "Mineko Mitsui",
  "上川菜穗": "Naho Kamikawa",
  "上川聪子": "Satoko Kamikawa",
  "上川文孝": "Fumitaka Kamikawa",
  "田仓慎一": "Shinichi Takura",
  "佐佐木修平": "Shuhei Sasaki",
  "枝川赖子": "Yoriko Edagawa",
  "枝川泰治": "Taiji Edagawa",
  "柳泽铃江": "Suzue Yanagisawa",
  "柳泽麻纪": "Maki Yanagisawa",
  "寺田玄一": "Genichi Terada",
  "北村美雪": "Miyuki Kitamura",
  "清濑直弘": "Naohiro Kiyose",
  "宫本祐理": "Yuri Miyamoto",
  "岸田要作": "Yasaku Kishida",
  "岸田克哉": "Katsuya Kishida",
  "翔太": "Shota",
  "清濑弘毅": "Hiroki Kiyose",
  "青山亚美": "Ami Aoyama",
  "吉冈多美子": "Tomoko Yoshioka",
  "日本桥署 警部补": "Assistant Inspector, Nihonbashi Police Station",
  "松矢料亭 学徒": "Apprentice at Matsuya Ryotei",
  "松矢料亭 老板娘": "Proprietress of Matsuya Ryotei",
  "松矢料亭 老板": "Owner of Matsuya Ryotei",
  "岸田要作 儿子": "Yasaku Kishida's son",
  "岸田要作 孙子": "Yasaku Kishida's grandson",
  "清濑弘毅 女友": "Hiroki Kiyose's girlfriend",
  "峰子大学好友 · 翻译": "Mineko's university friend · Translator",
  "草加屋": "Sokaya",
  "菊家": "Kikuya",
  "产毛屋": "Ubukeya",
  "玉秀": "Tamahide",
  "快生轩": "Kaiseiken",
  "「童梦屋」": "Domeya",
  "赖子常去的酒吧": "Yoriko's Usual Bar",
  "弘毅的剧团排练场": "Hiroki's Theater Rehearsal Studio",
  "寺田钟表店": "Terada Clock Shop",
  "水天宫": "Suitengu Shrine",
  "卡特罗西饼店": "Quattro Pastry Shop",
  "清濑保洁公司": "Kiyose Cleaning Company",
  "岸田税务事务所": "Kishida Tax Office",
  "日本桥警署": "Nihonbashi Police Station",
  "峰子公寓": "Mineko's Apartment",
  "人形町": "Ningyocho",
  "小传马町": "Kodemmacho",
};

function request(url, options = {}, body = "") {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, response => {
      let value = "";
      response.setEncoding("utf8");
      response.on("data", chunk => value += chunk);
      response.on("end", () => response.statusCode >= 200 && response.statusCode < 300
        ? resolve(value)
        : reject(new Error(`HTTP ${response.statusCode}: ${value.slice(0, 200)}`)));
    });
    req.on("error", reject);
    req.setTimeout(20000, () => req.destroy(new Error("Translation request timed out")));
    if (body) req.write(body);
    req.end();
  });
}

async function filesUnder(directory) {
  const files = [];
  for (const name of await readdir(directory)) {
    if (name === "i18n") continue;
    const url = new URL(name + (name.endsWith("/") ? "" : ""), directory);
    const info = await stat(url);
    if (info.isDirectory()) files.push(...await filesUnder(new URL(name + "/", directory)));
    else if (name.endsWith(".json")) files.push(url);
  }
  return files;
}

function collect(value, target) {
  if (typeof value === "string" && hasChinese(value)) target.add(value);
  else if (Array.isArray(value)) value.forEach(item => collect(item, target));
  else if (value && typeof value === "object") Object.values(value).forEach(item => collect(item, target));
}

async function bingSession() {
  const page = await request("https://cn.bing.com/translator?from=zh-Hans&to=en");
  const ig = page.match(/IG:"([^"]+)"/)?.[1];
  const iid = page.match(/data-iid="(translator\.\d+)"/)?.[1];
  const prevention = page.match(/params_AbusePreventionHelper = \[(\d+),"([^"]+)"/)?.slice(1);
  if (!ig || !iid || !prevention) throw new Error("Unable to start translation session");
  return { ig, iid, key: prevention[0], token: prevention[1], count: 0 };
}

async function newSession() {
  let error;
  for (let attempt = 0; attempt < 5; attempt++) {
    try { return await bingSession(); }
    catch (caught) {
      error = caught;
      await wait(1000 * (attempt + 1));
    }
  }
  throw error;
}

async function translate(session, values) {
  const separator = "\nZXQZX_SPLIT_ZXQZX\n";
  const text = values.join(separator);
  const body = new URLSearchParams({
    fromLang: "zh-Hans",
    to: "en",
    text,
    key: session.key,
    token: session.token,
  }).toString();
  const url = `https://cn.bing.com/ttranslatev3?isVertical=1&IG=${session.ig}&IID=${session.iid}.${++session.count}`;
  const response = await request(url, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "content-length": Buffer.byteLength(body),
    },
  }, body);
  const translated = JSON.parse(response)?.[0]?.translations?.[0]?.text;
  const result = translated.split(/\s*ZXQZX_SPLIT_ZXQZX\s*/);
  if (!Array.isArray(result) || result.length !== values.length) throw new Error("Translation batch shape changed");
  return result;
}

async function translateResilient(session, values) {
  try {
    return await translate(session, values);
  } catch {
    try {
      await wait(350);
      return await translate(await newSession(), values);
    } catch (error) {
      if (values.length === 1) throw error;
      const middle = Math.ceil(values.length / 2);
      return [
        ...await translateResilient(await newSession(), values.slice(0, middle)),
        ...await translateResilient(await newSession(), values.slice(middle)),
      ];
    }
  }
}

const sourceFiles = await filesUnder(dataRoot);
const strings = new Set();
for (const file of sourceFiles) collect(JSON.parse(await readFile(file, "utf8")), strings);

let existing = {};
try { existing = JSON.parse(await readFile(output, "utf8")); } catch {}
const translations = { ...existing, ...preferred };
const pending = [...strings].filter(value => !translations[value]);
const batches = [];
let batch = [], size = 2;
for (const value of pending) {
  const nextSize = size + JSON.stringify(value).length + 1;
  if (batch.length && nextSize > 700) {
    batches.push(batch);
    batch = [];
    size = 2;
  }
  batch.push(value);
  size += JSON.stringify(value).length + 1;
}
if (batch.length) batches.push(batch);

if (batches.length) {
  const session = await newSession();
  for (let index = 0; index < batches.length; index++) {
    const translated = await translateResilient(session, batches[index]);
    batches[index].forEach((source, item) => translations[source] = translated[item]);
    await mkdir(new URL("data/i18n/", root), { recursive: true });
    await writeFile(output, JSON.stringify(translations, null, 2) + "\n");
    process.stdout.write(`Translated ${index + 1}/${batches.length}\r`);
    await wait(120);
  }
}

await mkdir(new URL("data/i18n/", root), { recursive: true });
const ordered = Object.fromEntries([...strings].sort((a, b) => a.localeCompare(b, "zh-CN")).map(source => [source, translations[source]]));
await writeFile(output, JSON.stringify(ordered, null, 2) + "\n");
console.log(`\nWrote ${Object.keys(ordered).length} translations to data/i18n/en.json`);
